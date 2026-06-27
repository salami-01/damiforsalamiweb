import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
        Lost in the dark
      </p>
      <h1 className="mt-6 font-heading text-7xl font-black uppercase tracking-tighter sm:text-9xl">
        404
      </h1>
      <p className="mt-6 max-w-sm text-brand-bone/60">
        This page doesn't exist — but the collection still does.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-flex items-center gap-3 border border-brand-bone/40 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-colors duration-500 hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
      >
        Back to the catalogue
      </Link>
    </main>
  )
}