'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, X, Upload } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'

const emptyDraft: Product = {
  id: '',
  name: '',
  variant: '',
  price: 0,
  image: '',
  images: [],
  stock: 0,
  category: null,
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('id')
    if (error) setError(error.message)
    else setProducts((data ?? []) as Product[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  function startEdit(product: Product) {
    setEditing({ ...product })
    setIsNew(false)
    setError(null)
  }

  function startNew() {
    setEditing({ ...emptyDraft, id: `sm-${Math.floor(Math.random() * 9000) + 1000}` })
    setIsNew(true)
    setError(null)
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

    if (isNew) {
      const { error } = await supabase.from('products').insert(editing)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('products')
        .update({
          name: editing.name,
          variant: editing.variant,
          price: editing.price,
          image: editing.image,
          images: editing.images ?? [],
          stock: editing.stock,
        })
        .eq('id', editing.id)
        
      if (error) {
        setError(error.message)
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
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      setError(error.message)
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

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
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

            <div className="mt-5 space-y-4">
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

            <div className="mt-6 flex justify-end gap-3">
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
      )}
    </div>
  )
}