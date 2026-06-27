import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salami — Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}
