'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import {
  ORDERS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from '@/lib/orders'
import { formatPrice } from '@/lib/products'

const STATUS_STYLE: Record<OrderStatus, string> = {
  Processing: 'bg-secondary text-secondary-foreground',
  Shipped: 'bg-amber-100 text-amber-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
}

const PAGE_SIZE = 8

function orderTotal(order: Order) {
  return order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(ORDERS)
  const [active, setActive] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q),
    )
  }, [orders, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {orders.length} orders
            {search && ' matching search'}
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No orders match your search.
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                  <td className="px-4 py-3">{formatPrice(orderTotal(o))}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${STATUS_STYLE[o.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(o)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold">{active.id}</h3>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Customer
              </p>
              <p className="font-medium">{active.customer}</p>
              <p className="text-sm text-muted-foreground">{active.email}</p>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Shipping
              </p>
              <p className="text-sm">{active.shipping}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <select
                value={active.status}
                onChange={(e) => updateStatus(active.id, e.target.value as OrderStatus)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </p>
              <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                {active.items.map((item, i) => (
                  <li key={i} className="flex justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant} — Size {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-semibold">
                <span>Total</span>
                <span>{formatPrice(orderTotal(active))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}