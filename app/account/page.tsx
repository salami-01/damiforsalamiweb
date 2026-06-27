import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/orders'
import { SiteFooter } from '@/components/site-footer'

const STATUS_STYLE: Record<string, string> = {
  Processing: 'bg-brand-bone/10 text-brand-bone/70',
  Shipped: 'bg-amber-500/15 text-amber-400',
  Delivered: 'bg-emerald-500/15 text-emerald-400',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const orderList = (orders ?? []) as Order[]
  const name = user.user_metadata?.full_name as string | undefined

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-12 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
          My Account
        </p>
        <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl">
          {name || 'Your Account'}
        </h1>
        <p className="mt-4 text-sm text-brand-bone/60">{user.email}</p>
      </header>

      <section className="px-6 pb-28 md:px-16 lg:px-24">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone/50">
          Order History
        </h2>

        {orderList.length === 0 ? (
          <p className="mt-6 text-sm text-brand-bone/60">
            No orders yet. Once you place an order, it'll show up here.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {orderList.map((order) => {
              const total = order.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0,
              )
              return (
                <div key={order.id} className="border border-brand-bone/15 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-brand-bone/50">{order.id}</p>
                      <p className="text-sm text-brand-bone/60">{order.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${STATUS_STYLE[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <ul className="mt-5 divide-y divide-brand-bone/10">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between py-3 text-sm">
                        <div>
                          <p>{item.name}</p>
                          <p className="text-xs text-brand-bone/50">
                            {item.variant} — Size {item.size} × {item.quantity}
                          </p>
                        </div>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex justify-between border-t border-brand-bone/15 pt-4 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}