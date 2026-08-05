'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/products'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

type WishlistContextValue = {
  items: Product[]
  loading: boolean
  isWishlisted: (id: string) => boolean
  toggle: (product: Product) => void
  user: User | null
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const loadWishlist = useCallback(
    async (uid: string) => {
      setLoading(true)
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id, products(*)')
        .eq('user_id', uid)

      if (error) {
        console.error('Error loading wishlist:', error.message)
        setItems([])
      } else {
        setItems(
          (data ?? [])
            .filter((row: any) => row.products)
            .map((row: any) => row.products as Product),
        )
      }
      setLoading(false)
    },
    [supabase],
  )

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      const u = data.user ?? null
      setUser(u)
      if (u) loadWishlist(u.id)
      else setLoading(false)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          loadWishlist(u.id)
        } else {
          setItems([])
        }
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [supabase, loadWishlist])

  const ids = useMemo(() => new Set(items.map((p) => p.id)), [items])

  const isWishlisted = useCallback((id: string) => ids.has(id), [ids])

  const toggle = useCallback(
    async (product: Product) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }

      const already = ids.has(product.id)

      if (already) {
        setItems((prev) => prev.filter((p) => p.id !== product.id))
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
      } else {
        setItems((prev) => [...prev, product])
        await supabase.from('wishlist_items').insert({
          user_id: user.id,
          product_id: product.id,
        })
      }
    },
    [user, ids, router, pathname, supabase],
  )

  const value = useMemo(
    () => ({ items, loading, isWishlisted, toggle, user }),
    [items, loading, isWishlisted, toggle, user],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
//this is components\wishlist-context.tsx