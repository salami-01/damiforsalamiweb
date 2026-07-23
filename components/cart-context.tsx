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
import { ShoppingBag } from 'lucide-react'
import { type Product, getCheckoutPrice } from '@/lib/products'
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
  addItem: (product: Product, size?: string, quantity?: number) => void
  removeItem: (id: string, size: string) => void
  setQuantity: (id: string, size: string, quantity: number) => void
  user: User | null
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_HIDDEN_PREFIXES = ['/admin', '/login', '/signup', '/checkout']

function FloatingCartButton({ count }: { count: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [bump, setBump] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 400)
      prevCount.current = count
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])

  const hidden =
    pathname === '/' ||
    CART_HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))

  if (hidden) return null

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          key="floating-cart"
          type="button"
          onClick={() => router.push('/cart')}
          aria-label={`View cart, ${count} item${count === 1 ? '' : 's'}`}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: bump ? 1.15 : 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-brand-bone shadow-lg shadow-black/40 transition-transform hover:scale-105"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-bone px-1.5 font-mono text-[11px] font-bold text-brand-black">
            {count}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

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
    async (product: Product, size = 'M', quantity = 1) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }

      if (product.stock <= 0) {
        pushToast(product, size, 'limit')
        return
      }

      const existing = items.find((i) => i.product.id === product.id && i.size === size)
      const currentQty = existing?.quantity ?? 0

      if (currentQty >= product.stock) {
        pushToast(product, size, 'limit')
        return
      }

      const requestedTotal = currentQty + quantity
      const newQuantity = Math.min(requestedTotal, product.stock)
      const wasClamped = newQuantity < requestedTotal

      setItems((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: newQuantity }
              : i,
          )
        }
        return [...prev, { product, size, quantity: newQuantity }]
      })

      pushToast(product, size, wasClamped ? 'limit' : 'added')

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', size)
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          size,
          quantity: newQuantity,
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
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * getCheckoutPrice(i.product), 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, count, subtotal, loading, addItem, removeItem, setQuantity, user }),
    [items, count, subtotal, loading, addItem, removeItem, setQuantity, user],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
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
      <FloatingCartButton count={count} />
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
//this fine is C:\Users\HP\salami\salami-app\components\cart-context.tsx