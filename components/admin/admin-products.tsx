'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, X, Upload } from 'lucide-react'
import { formatPrice, getPromoInfo, SIZE_OPTIONS, type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/categories'

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'

const emptyDraft: Product = {
  id: '',
  name: '',
  variant: '',
  price: 0,
  compareAtPrice: null,
  promoEndsAt: null,
  image: '',
  images: [],
  stock: 0,
  category: null,
  sizes: [],
  badges: [],
}

/** datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time, not UTC. */
function isoToLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function localInputToIso(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [badgesInput, setBadgesInput] = useState('')
  const supabase = createClient()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('id')
    if (error) setError(error.message)
    else {
      setProducts(
        (data ?? []).map((p: any) => ({
          ...p,
          compareAtPrice: p.compareAtPrice ?? null,
          promoEndsAt: p.promoEndsAt ?? null,
          sizes: p.sizes ?? [],
          badges: p.badges ?? [],
        })) as Product[],
      )
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProducts()
    supabase.from('categories').select('*').order('sort_order').then(({ data }: { data: Category[] | null }) => {
      setCategories((data ?? []) as Category[])
    })
  }, [loadProducts, supabase])

  function startEdit(product: Product) {
    setEditing({ ...product, sizes: [...product.sizes], badges: [...product.badges] })
    setBadgesInput(product.badges.join(', '))
    setIsNew(false)
    setError(null)
  }

  function startNew() {
    setEditing({ ...emptyDraft, id: `sm-${Math.floor(Math.random() * 9000) + 1000}` })
    setBadgesInput('')
    setIsNew(true)
    setError(null)
  }

  function toggleSize(s: string) {
    if (!editing) return
    const has = editing.sizes.includes(s)
    setEditing({
      ...editing,
      sizes: has ? editing.sizes.filter((x) => x !== s) : [...editing.sizes, s],
    })
  }

  async function handleMultiImageUpload(file: File, index: number) {
    if (!editing) return
    const slot = index === -1 ? 'new' : `img-${index}`
    setUploading(slot)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${editing.id}-${Date.now()}-${slot}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(null)
      return
    }

    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    const url = data.publicUrl
    const currentImages = editing.images?.length > 0 ? editing.images : [editing.image].filter(Boolean)

    let newImages: string[]
    if (index === -1) {
      newImages = [...currentImages, url]
    } else {
      newImages = currentImages.map((img, i) => (i === index ? url : img))
    }

    setEditing({
      ...editing,
      images: newImages,
      image: newImages[0],
    })
    setUploading(null)
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError(null)

    const badges = badgesInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)

    if (editing.compareAtPrice !== null && editing.compareAtPrice <= editing.price) {
      setError('Compare-at price must be higher than the current price for a promo to show.')
      setSaving(false)
      return
    }

    const payload = {
      name: editing.name,
      variant: editing.variant,
      price: editing.price,
      compareAtPrice: editing.compareAtPrice,
      promoEndsAt: editing.promoEndsAt,
      image: editing.image,
      images: editing.images ?? [],
      stock: editing.stock,
      category: editing.category ?? null,
      sizes: editing.sizes ?? [],
      badges,
    }

    if (isNew) {
      const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, ...payload }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create product.')
      setSaving(false)
      return
    }
    } else {
      const res = await fetch(`/api/admin/products/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to update product.')
      setSaving(false)
      return
      }
    }

    setSaving(false)
    setEditing(null)
    loadProducts()
  }

  async function remove(id: string) {
    const confirmed = window.confirm('Delete this product? This cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to delete product.')
    return
  }
    loadProducts()
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading products...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} items in the catalogue</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Promo</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const { isPromo, percentOff } = getPromoInfo(p)
              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || '/placeholder.svg'} alt="" className="h-10 w-9 rounded object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.variant}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    {isPromo ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                        -{percentOff}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'text-primary' : ''}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label={`Delete ${p.name}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <div className="shrink-0 px-6 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{isNew ? 'Add product' : 'Edit product'}</h3>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Close"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex-1 space-y-4 overflow-y-auto px-6 pb-2">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Name</span>
                <input
                  className={fieldClass}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Variant</span>
                <input
                  className={fieldClass}
                  value={editing.variant}
                  onChange={(e) => setEditing({ ...editing, variant: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Price (₦)</span>
                  <input
                    type="number"
                    className={fieldClass}
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Stock</span>
                  <input
                    type="number"
                    className={fieldClass}
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div className="rounded-md border border-dashed border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Promo (optional)
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-muted-foreground">Compare-at price (₦)</span>
                    <input
                      type="number"
                      placeholder="e.g. 40000"
                      className={fieldClass}
                      value={editing.compareAtPrice ?? ''}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          compareAtPrice: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted-foreground">Promo ends</span>
                    <input
                      type="datetime-local"
                      className={fieldClass}
                      value={isoToLocalInput(editing.promoEndsAt)}
                      onChange={(e) =>
                        setEditing({ ...editing, promoEndsAt: localInputToIso(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Set a compare-at price higher than the current price to show this item as a promo on the
                  shop and /promo page. Leave the countdown blank if the discount isn't time-limited.
                </p>
                {(() => {
                  const { isPromo, percentOff } = getPromoInfo(editing)
                  return isPromo ? (
                    <p className="mt-2 text-xs font-medium text-emerald-700">
                      Will display as -{percentOff}% off
                    </p>
                  ) : null
                })()}
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <select
                  className={fieldClass}
                  value={editing.category ?? ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value || null })}
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Available sizes</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => {
                    const active = editing.sizes.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input text-foreground hover:bg-secondary'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Leave all unselected for a single "One Size" item.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Badges (comma separated)</span>
                <input
                  className={fieldClass}
                  placeholder="e.g. Female Gown, Limited"
                  value={badgesInput}
                  onChange={(e) => setBadgesInput(e.target.value)}
                />
              </label>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Product images</span>
                <p className="mt-1 text-[11px] text-muted-foreground">First image is the main thumbnail. Add more for the detail page carousel.</p>
                <div className="mt-2 flex flex-col gap-3">
                  {(editing.images?.length > 0 ? editing.images : [editing.image]).filter(Boolean).map((img, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={img} alt="" className="h-16 w-14 rounded object-cover" />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                        <Upload className="h-3.5 w-3.5" />
                        {uploading === `img-${i}` ? 'Uploading...' : 'Replace'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!!uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleMultiImageUpload(file, i)
                          }}
                        />
                      </label>
                      {(editing.images?.length > 1) && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = editing.images.filter((_, idx) => idx !== i)
                            setEditing({ ...editing, images: newImages, image: newImages[0] || '' })
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading === 'new' ? 'Uploading...' : 'Add another image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleMultiImageUpload(file, -1)
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || uploading !== null}
                  onClick={save}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
//this is components\admin\admin-products.tsx