'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/cart-context'
import { formatPrice } from '@/lib/products'

export default function CheckoutPage() {
    const { items, subtotal, loading, user } = useCart()
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [phone, setPhone] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
    shippingName: name,
    shippingAddress: address,
    shippingCity: city,
    shippingPhone: phone,
        }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Something went wrong')
    window.location.href = data.url
    } catch (err: any) {
    setError(err.message)
    setSubmitting(false)
    }
}

if (loading) {
    return <main className="min-h-screen bg-brand-graphite px-6 pt-32 text-brand-bone">Loading...</main>
}

if (!user) {
    return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
        <p>You need to be logged in to check out.</p>
        <Link href="/login?next=/checkout" className="mt-4 underline">Log in</Link>
    </main>
    )
}

if (items.length === 0) {
    return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="mt-4 underline">Browse the shop</Link>
    </main>
    )
}

const inputClass =
    'w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 text-sm text-brand-bone outline-none focus:border-brand-red'

return (
    <main className="min-h-screen bg-brand-graphite px-6 pt-28 text-brand-bone md:px-16 lg:px-24">
    <h1 className="font-heading text-4xl font-black uppercase tracking-tighter sm:text-5xl">Checkout</h1>

    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
    <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">Shipping details</h2>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input required placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        <input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        <input required placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-brand-red py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone disabled:opacity-50"
        >
            {submitting ? 'Redirecting to Paystack...' : 'Pay with Paystack'}
        </button>
        </form>

        <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">Order summary</h2>
        <ul className="mt-6 divide-y divide-brand-bone/10">
            {items.map((i) => (
            <li key={`${i.product.id}-${i.size}`} className="flex justify-between py-4 text-sm">
                <div>
                <p>{i.product.name}</p>
                <p className="text-xs text-brand-bone/50">{i.product.variant} — {i.size} × {i.quantity}</p>
                </div>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
            </li>
            ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-brand-bone/15 pt-4 font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
        </div>
        </div>
    </div>
    </main>
)
}
