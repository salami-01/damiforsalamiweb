import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Login', href: '/login' },
  { label: 'Cart', href: '/cart' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-bone/15 px-6 py-12 md:px-16 lg:px-24">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Link
          href="/home"
          className="font-heading text-5xl font-black uppercase tracking-tighter text-brand-bone"
        >
          SM
        </Link>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-bone/60 transition-colors duration-300 hover:text-brand-red"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/35">
        © {new Date().getFullYear()} Salami (SM). All rights reserved.
      </p>
    </footer>
  )
}
