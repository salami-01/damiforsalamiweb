'use client'

import { useState } from 'react'
import { Package, ClipboardList, FileText, Mail } from 'lucide-react'
import { AdminProducts } from '@/components/admin/admin-products'
import { AdminOrders } from '@/components/admin/admin-orders'
import { AdminContent } from '@/components/admin/admin-content'
import { AdminMessages } from '@/components/admin/admin-messages'
import { AdminUsers } from '@/components/admin/admin-users'

type Tab = 'products' | 'orders' | 'content' | 'messages' | 'users'

const NAV: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'users', label: 'Users', icon: Users },
]

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('products')

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-border bg-card md:w-60 md:border-b-0 md:border-r">
        <div className="px-6 py-6">
          <p className="text-lg font-bold tracking-tight">Salami</p>
          <p className="text-xs text-muted-foreground">Admin Console</p>
        </div>
        <nav className="flex gap-1 px-3 pb-4 md:flex-col">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors md:flex-none ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-x-auto p-6 md:p-10">
        {tab === 'products' && <AdminProducts />}
        {tab === 'orders' && <AdminOrders />}
        {tab === 'content' && <AdminContent />}
        {tab === 'messages' && <AdminMessages />}
        {tab === 'users' && <AdminUsers />}
      </main>
    </div>
  )
}