'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, X, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/products'

type Payment = {
  reference: string
  user_id: string | null
  email: string
  amount: number
  status: string
  channel: string | null
  order_id: string | null
  created_at: string
  raw_response: any
}

const STATUS_STYLE: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-destructive/10 text-destructive',
  abandoned: 'bg-secondary text-secondary-foreground',
  pending: 'bg-amber-100 text-amber-800',
}

const PAGE_SIZE = 8

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Payment | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)
  const supabase = createClient()

  const loadPayments = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error loading payments:', error.message)
      setPayments([])
    } else {
      setPayments((data ?? []) as Payment[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const statuses = useMemo(
    () => Array.from(new Set(payments.map((p) => p.status))).sort(),
    [payments],
  )

  const filtered = useMemo(() => {
    let result = payments
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) => p.reference.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
      )
    }
    return result
  }, [payments, search, statusFilter])

  const orphaned = useMemo(
    () => payments.filter((p) => p.status === 'success' && !p.order_id),
    [payments],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  async function retryFulfillment(reference: string) {
    setRetrying(reference)
    setRetryError(null)
    try {
      const res = await fetch('/api/admin/retry-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Retry failed.')
      await loadPayments()
      setActive(null)
    } catch (err: any) {
      setRetryError(err.message)
    } finally {
      setRetrying(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading payments...</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {payments.length} payment records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by reference or email..."
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
      </div>

      {orphaned.length > 0 && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {orphaned.length} successful payment{orphaned.length > 1 ? 's' : ''} without an order —
          the order insert likely failed after payment succeeded. Open a record below and use
          "Retry order creation" to resolve.
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 text-right font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {payments.length === 0 ? 'No payments yet.' : 'No payments match.'}
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.reference} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{formatPrice(p.amount / 100)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[p.status] ?? 'bg-secondary text-secondary-foreground'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.order_id ? (
                      <span className="font-mono text-xs">{p.order_id}</span>
                    ) : p.status === 'success' ? (
                      <span className="text-xs font-medium text-destructive">Missing</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(p)}
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
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
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
              <h3 className="font-mono text-sm font-semibold">{active.reference}</h3>
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</p>
              <p className="font-medium">{active.email}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</p>
                <p className="mt-1 text-sm">{formatPrice(active.amount / 100)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Channel</p>
                <p className="mt-1 text-sm">{active.channel ?? '—'}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[active.status] ?? 'bg-secondary text-secondary-foreground'}`}>
                {active.status}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order</p>
              {active.order_id ? (
                <p className="mt-1 font-mono text-sm">{active.order_id}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">No order linked.</p>
              )}
            </div>

            {active.status === 'success' && !active.order_id && (
              <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  Payment succeeded but no order was created. Retrying is safe — it will not
                  double-charge or duplicate the order.
                </p>
                {retryError && <p className="mt-2 text-xs text-destructive">{retryError}</p>}
                <button
                  type="button"
                  disabled={retrying === active.reference}
                  onClick={() => retryFulfillment(active.reference)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {retrying === active.reference ? 'Retrying...' : 'Retry order creation'}
                </button>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Raw Paystack response</p>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-[11px] text-muted-foreground">
                {JSON.stringify(active.raw_response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
//components\admin\admin-payments.tsx