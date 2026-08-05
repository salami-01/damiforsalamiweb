'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MailOpen } from 'lucide-react'

type Message = {
  id: string
  name: string
  email: string
  message: string
  created_at: string
  read: boolean
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/messages', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to load messages.')
      setLoading(false)
      return
    }
    setMessages(data.messages as Message[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function markRead(id: string) {
      const res = await fetch(`/api/admin/messages/${id}/read`, { method: 'PATCH' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to mark as read.')
      return
    }
    load()
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading messages...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold">Messages</h2>
      <p className="mt-1 text-sm text-muted-foreground">{messages.length} submissions</p>
      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {m.read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium">{m.name}</span>
                <span className="text-sm text-muted-foreground">{m.email}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground">{m.message}</p>
            {!m.read && (
              <button
                type="button"
                onClick={() => markRead(m.id)}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
//components\admin\admin-messages.tsx