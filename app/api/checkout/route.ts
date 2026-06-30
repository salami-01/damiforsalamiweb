import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { shippingName, shippingAddress, shippingCity, shippingPhone } = await request.json()

  if (!shippingName || !shippingAddress || !shippingCity || !shippingPhone) {
    return Response.json({ error: 'Missing shipping details' }, { status: 400 })
  }

  const { data: cartRows, error: cartError } = await supabase
    .from('cart_items')
    .select('size, quantity, products(*)')
    .eq('user_id', user.id)

  if (cartError || !cartRows || cartRows.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const items = cartRows
    .filter((row: any) => row.products)
    .map((row: any) => ({
      product_id: row.products.id as string,
      name: row.products.name as string,
      variant: row.products.variant as string,
      size: row.size as string,
      quantity: row.quantity as number,
      price: row.products.price as number,
      stock: row.products.stock as number,
    }))

  for (const item of items) {
    if (item.quantity > item.stock) {
      return Response.json(
        { error: `${item.name} (${item.variant}) only has ${item.stock} left in stock.` },
        { status: 400 },
      )
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const reference = `salami-${Date.now()}-${user.id.slice(0, 8)}`
  const shipping = `${shippingName}, ${shippingAddress}, ${shippingCity}. Phone: ${shippingPhone}`
  const origin = request.headers.get('origin') || ''

  try {
    const transaction = await initializeTransaction({
      email: user.email!,
      amountKobo: total * 100,
      reference,
      callbackUrl: `${origin}/checkout/callback`,
      metadata: {
        user_id: user.id,
        customer: shippingName,
        shipping,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          variant: i.variant,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    })
    return Response.json({ url: transaction.authorization_url })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Payment initialization failed' }, { status: 500 })
  }
}