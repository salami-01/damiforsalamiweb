'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

type CartToast = { id: number; product: Product; size: string; kind: 'added' | 'limit' }

export type CartItem = {
  product: Product
  size: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  loading: boolean
  addItem: (product: Product, size?: string) => void
  removeItem: (id: string, size: string) => void
  setQuantity: (id: string, size: string, quantity: number) => void
  user: User | null
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<CartToast[]>([])
  const [user, setUser] = useState<User | null>(null)
  const toastId = useRef(0)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const loadCart = useCallback(
    async (uid: string) => {
      setLoading(true)
      const { data, error } = await supabase
        .from('cart_items')
        .select('size, quantity, products(*)')
        .eq('user_id', uid)

      if (error) {
        console.error('Error loading cart:', error.message)
        setItems([])
      } else {
        setItems(
          (data ?? [])
            .filter((row: any) => row.products)
            .map((row: any) => ({
              product: row.products as Product,
              size: row.size,
              quantity: row.quantity,
            })),
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
    if (u) loadCart(u.id)
    else setLoading(false)
  }
  init()

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        loadCart(u.id)
      } else {
        setItems([])
      }
    },
  )

  return () => listener.subscription.unsubscribe()
}, [supabase, loadCart])

  function pushToast(product: Product, size: string, kind: 'added' | 'limit') {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, product, size, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }

  const addItem = useCallback(
    async (product: Product, size = 'M') => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }

      if (product.stock <= 0) {
        pushToast(product, size, 'limit')
        return
      }

      const existing = items.find((i) => i.product.id === product.id && i.size === size)

      if (existing && existing.quantity >= product.stock) {
        pushToast(product, size, 'limit')
        return
      }

      setItems((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        }
        return [...prev, { product, size, quantity: 1 }]
      })

      pushToast(product, size, 'added')

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', size)
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          size,
          quantity: 1,
        })
      }
    },
    [user, items, router, pathname, supabase],
  )

  const removeItem = useCallback(
    async (id: string, size: string) => {
      setItems((prev) => prev.filter((i) => !(i.product.id === id && i.size === size)))
      if (!user) return
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id).eq('size', size)
    },
    [user, supabase],
  )

  const setQuantity = useCallback(
    async (id: string, size: string, quantity: number) => {
      const item = items.find((i) => i.product.id === id && i.size === size)
      const clamped = item ? Math.min(quantity, item.product.stock) : quantity

      setItems((prev) =>
        prev
          .map((i) =>
            i.product.id === id && i.size === size ? { ...i, quantity: Math.max(0, clamped) } : i,
          )
          .filter((i) => i.quantity > 0),
      )
      if (!user) return

      if (clamped <= 0) {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id).eq('size', size)
      } else {
        await supabase.from('cart_items').update({ quantity: clamped }).eq('user_id', user.id).eq('product_id', id).eq('size', size)
      }
    },
    [user, items, supabase],
  )

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.product.price, 0), [items])

  const value = useMemo(
    () => ({ items, count, subtotal, loading, addItem, removeItem, setQuantity, user }),
    [items, count, subtotal, loading, addItem, removeItem, setQuantity, user],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`rounded-md px-4 py-3 text-sm shadow-lg ${
                t.kind === 'limit' ? 'bg-brand-red text-white' : 'bg-black text-white'
              }`}
            >
              {t.kind === 'limit' ? 'No more stock available' : 'Item has been added to cart'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}