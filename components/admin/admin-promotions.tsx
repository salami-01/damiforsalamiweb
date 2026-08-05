'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, type Product } from '@/lib/products'

type PromoDraft = {
  compareAtPrice: string
  promoEndsAt: string
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminPromotions() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, PromoDraft>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('id')
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const list = (data ?? []) as Product[]
    setProducts(list)
    setDrafts(
      Object.fromEntries(
        list.map((p) => [
          p.id,
          {
            compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
            promoEndsAt: p.promoEndsAt ? toLocalInputValue(p.promoEndsAt) : '',
          },
        ]),
      ),
    )
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  function updateDraft(id: string, patch: Partial<PromoDraft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  function promoStatus(p: Product, draft: PromoDraft): 'active' | 'expired' | 'none' {
    const compareAt = draft.compareAtPrice ? Number(draft.compareAtPrice) : null
    if (!compareAt || compareAt <= p.price) return 'none'
    if (draft.promoEndsAt && new Date(draft.promoEndsAt).getTime() < Date.now()) return 'expired'
    return 'active'
  }

  async function save(id: string) {
    const draft = drafts[id]
    if (!draft) return

    const compareAtPrice = draft.compareAtPrice ? Number(draft.compareAtPrice) : null
    if (compareAtPrice !== null && (Number.isNaN(compareAtPrice) || compareAtPrice < 0)) {
      setError('Compare-at price must be a valid non-negative number.')
      return
    }

    setSavingId(id)
    setError(null)
    const promoEndsAt = draft.promoEndsAt ? new Date(draft.promoEndsAt).toISOString() : null

    const res = await fetch(`/api/admin/products/${id}/promo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compareAtPrice, promoEndsAt }),
  })

    setSavingId(null)
    if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to save promo.')
      return
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, compareAtPrice, promoEndsAt } : p,
      ),
    )
  }

  async function clearPromo(id: string) {
    setSavingId(id)
    setError(null)
    const res = await fetch(`/api/admin/products/${id}/promo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compareAtPrice: null, promoEndsAt: null }),
  })

    setSavingId(null)
    if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to clear promo.')
      return
    }
    updateDraft(id, { compareAtPrice: '', promoEndsAt: '' })
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, compareAtPrice: null, promoEndsAt: null } : p)),
    )
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading promotions...</p>

  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold">Promotions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a compare-at price and optional end date to run a promo on any product.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Compare-at (₦)</th>
              <th className="px-4 py-3 font-medium">Promo ends</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const draft = drafts[p.id] ?? { compareAtPrice: '', promoEndsAt: '' }
                const status = promoStatus(p, draft)
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image || '/placeholder.svg'} alt="" className="h-10 w-9 rounded object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={draft.compareAtPrice}
                        onChange={(e) => updateDraft(p.id, { compareAtPrice: e.target.value })}
                        placeholder="No promo"
                        className="w-28 rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        value={draft.promoEndsAt}
                        onChange={(e) => updateDraft(p.id, { promoEndsAt: e.target.value })}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {status === 'active' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">Active</span>
                      )}
                      {status === 'expired' && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">Expired</span>
                      )}
                      {status === 'none' && (
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => clearPromo(p.id)}
                          disabled={savingId === p.id}
                          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => save(p.id)}
                          disabled={savingId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingId === p.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
//components\admin\admin-promotions.tsx