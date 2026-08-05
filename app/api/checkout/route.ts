import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'
import type { Product } from '@/lib/products'

export const dynamic = 'force-dynamic'

type CheckoutBody = {
  shippingName?: unknown
  shippingAddress?: unknown
  shippingCity?: unknown
  shippingPhone?: unknown
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }
  return value.trim()
}

export async function POST(req: Request) {
  let body: CheckoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  let shippingName: string, shippingAddress: string, shippingCity: string, shippingPhone: string
  try {
    shippingName = requireNonEmptyString(body.shippingName, 'Full name')
    shippingAddress = requireNonEmptyString(body.shippingAddress, 'Address')
    shippingCity = requireNonEmptyString(body.shippingCity, 'City')
    shippingPhone = requireNonEmptyString(body.shippingPhone, 'Phone number')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'You must be logged in to check out.' }, { status: 401 })
  }

  const { data: cartRows, error: cartError } = await supabase
    .from('cart_items')
    .select('size, quantity, products(*)')
    .eq('user_id', user.id)

  if (cartError) {
    console.error('Checkout: failed to load cart:', cartError.message)
    return NextResponse.json({ error: 'Could not load your cart.' }, { status: 500 })
  }

  // Map each product to a single object (if returned as an array) before type guarding
  const rows = (cartRows ?? [])
    .map((row: any) => ({
      ...row,
      products: Array.isArray(row.products) ? row.products[0] : row.products,
    }))
    .filter(
      (row: any): row is { size: string; quantity: number; products: Product } =>
        !!row.products && typeof row.products === 'object',
    )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  // Server is the only source of truth for price and stock — never trust anything
  // about the order beyond the shipping fields from the client.
  const items: Array<{
    product_id: string
    name: string
    variant: string
    size: string
    quantity: number
    price: number
  }> = []

  for (const row of rows) {
    const product = row.products
    if (row.quantity > product.stock) {
      return NextResponse.json(
        {
          error:
            product.stock === 0
              ? `${product.name} is now out of stock. Please remove it from your cart.`
              : `Only ${product.stock} of ${product.name} left. Please update your cart.`,
        },
        { status: 409 },
      )
    }
    items.push({
      product_id: product.id,
      name: product.name,
      variant: product.variant,
      size: row.size,
      quantity: row.quantity,
      price: product.price,
    })
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  if (total <= 0) {
    return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 })
  }

  const shipping = `${shippingAddress}, ${shippingCity} — ${shippingPhone}`
  const origin = req.headers.get('origin') ?? new URL(req.url).origin

  try {
    const { authorization_url } = await initializeTransaction({
      email: user.email,
      amount: Math.round(total * 100), // naira -> kobo
      callback_url: `${origin}/checkout/callback`,
      metadata: {
        user_id: user.id,
        customer: shippingName,
        shipping,
        items,
      },
    })

    return NextResponse.json({ url: authorization_url })
  } catch (err: any) {
    console.error('Checkout: Paystack initialization failed:', err.message)
    return NextResponse.json(
      { error: 'Could not start payment. Please try again shortly.' },
      { status: 502 },
    )
  }
}
// this is app\api\checkout\route.ts file that handles the checkout process. It validates the request body, checks the user's cart, calculates the total, and initializes a Paystack transaction. It returns the authorization URL for the client to redirect the user to Paystack for payment.