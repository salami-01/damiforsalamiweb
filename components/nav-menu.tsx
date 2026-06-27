'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/components/cart-context'
import { createClient } from '@/lib/supabase/client'

const BASE_LINKS = [
  { label: 'Open Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Your Cart', href: '/cart' },
  { label: 'Contact', href: '/contact' },
]

export function NavMenu() {
  const [open, setOpen] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { count, user } = useCart()
  const supabase = createClient()

  const isLandingPage = pathname === '/'
  const hidden = pathname?.startsWith('/admin') || isLandingPage

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open || confirmingLogout ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, confirmingLogout])

  if (hidden) {
    return null
  }

  const links = user
  ? [...BASE_LINKS, { label: 'My Account', href: '/account' }, { label: 'Log Out', href: '#', isLogout: true }]
  : [...BASE_LINKS, { label: 'Login Page', href: `/login?next=${encodeURIComponent(pathname || '/')}` }]
  async function handleLogout() {
    await supabase.auth.signOut()
    setConfirmingLogout(false)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed left-5 top-5 z-[60] flex h-10 w-10 items-center justify-center md:left-8 md:top-8"
      >
        <span className="relative block h-4 w-7">
          <motion.span
            className="absolute left-0 block h-px w-7 bg-brand-bone"
            animate={open ? { rotate: 45, top: '50%', y: '-50%' } : { rotate: 0, top: 0, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="absolute left-0 top-1/2 block h-px w-7 -translate-y-1/2 bg-brand-bone"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="absolute bottom-0 left-0 block h-px w-7 bg-brand-bone"
            animate={
              open ? { rotate: -45, bottom: '50%', y: '50%' } : { rotate: 0, bottom: 0, y: 0 }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
      </button>

      <Link
  href="/home"
  aria-label="Salami home"
  className="fixed left-1/2 top-5 z-[55] -translate-x-1/2 md:top-7"
>
  <img src="/logo.png" alt="Salami" className="h-8 w-auto md:h-10" />
</Link>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[50] flex flex-col justify-center bg-brand-black/95 px-6 backdrop-blur-md md:px-20"
          >
            <ul className="flex flex-col gap-2 md:gap-4">
              {links.map((link, i) => {
                const active = pathname === link.href
                const content = (
                  <>
                    <span className="font-mono text-xs font-normal tracking-widest text-brand-slate">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="relative">
                      {link.label}
                      {link.label === 'Your Cart' && count > 0 && (
                        <span className="ml-3 align-super font-mono text-sm text-brand-red">
                          ({count})
                        </span>
                      )}
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-brand-red transition-all duration-500 ${
                          active ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </span>
                  </>
                )

                return (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 + i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {'isLogout' in link ? (
                      <button
                        type="button"
                        onClick={() => setConfirmingLogout(true)}
                        className="group inline-flex items-baseline gap-4 font-heading text-4xl font-extrabold uppercase leading-none tracking-tight text-brand-bone transition-colors duration-500 hover:text-brand-red sm:text-6xl md:text-7xl"
                      >
                        {content}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`group inline-flex items-baseline gap-4 font-heading text-4xl font-extrabold uppercase leading-none tracking-tight transition-colors duration-500 sm:text-6xl md:text-7xl ${
                          active ? 'text-brand-red' : 'text-brand-bone hover:text-brand-red'
                        }`}
                      >
                        {content}
                      </Link>
                    )}
                  </motion.li>
                )
              })}
            </ul>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-8 left-6 max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-widest text-brand-slate md:left-20"
            >
              Salami — SM
              <br />A modern luxury streetwear label.
            </motion.p>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmingLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-brand-slate p-8 text-center"
            >
              <p className="font-heading text-2xl font-bold uppercase text-brand-bone">
                Log out?
              </p>
              <p className="mt-2 text-sm text-brand-bone/60">
                You'll need to sign in again to access your account.
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingLogout(false)}
                  className="flex-1 border border-brand-bone/30 py-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-bone hover:bg-brand-bone/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-brand-red py-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-bone hover:opacity-90"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}