'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/categories'

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories((data ?? []) as Category[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  async function addCategory() {
    if (!newLabel.trim()) return
    setError(null)
    const id = newLabel.trim().toLowerCase().replace(/\s+/g, '-')
    const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      label: newLabel.trim(),
      sort_order: categories.length + 1,
    }),
  })
  if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to add category.')
    return
  }
    setNewLabel('')
    load()
  }

  async function remove(id: string) {
    setError(null)
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to delete category.')
    return
  }
    load()
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading categories...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold">Categories</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These appear in the shop filter dropdown.
      </p>
      {error && (
              <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
      <div className="mt-6 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={addCategory}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <ul className="mt-6 divide-y divide-border rounded-md border border-border">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{c.label}</span>
            <button
              type="button"
              onClick={() => remove(c.id)}
              aria-label={`Delete ${c.label}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
// components\admin\admin-categories.tsx