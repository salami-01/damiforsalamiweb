'use client'

import { useState, useEffect } from 'react'

type AdminUser = {
  id: string
  email: string
  name: string | null
  created_at: string
  last_sign_in_at: string | null
  confirmed: boolean
  orderCount: number
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setUsers(data.users)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load users')
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Loading users...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div>
      <h2 className="text-xl font-semibold">Users</h2>
      <p className="mt-1 text-sm text-muted-foreground">{users.length} registered accounts</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Confirmed</th>
              <th className="px-4 py-3 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3">
                  {u.confirmed ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">Yes</span>
                  ) : (
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">No</span>
                  )}
                </td>
                <td className="px-4 py-3">{u.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}