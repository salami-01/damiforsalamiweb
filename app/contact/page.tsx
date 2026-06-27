import { ContactForm } from '@/components/contact-form'
import { SiteFooter } from '@/components/site-footer'
import { getSiteContent } from '@/lib/site-content'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Salami for press, wholesale, or support.',
}
export default async function ContactPage() {
  const content = await getSiteContent()

  const contact = content?.contact ?? {
    email: 'studio@salami.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    intro:
      'For press, wholesale, or anything else — write to us directly. We read every message.',
  }

  const socials = [
    { label: 'Instagram', href: contact.instagram },
    { label: 'TikTok', href: contact.tiktok },
    { label: 'Email', href: `mailto:${contact.email}` },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-brand-charcoal text-brand-bone">
      <div className="flex-1 px-6 pt-28 md:px-16 md:pt-36 lg:px-24">
        <div className="grid grid-cols-1 gap-16 pb-28 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
              Get in touch
            </p>

            <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl">
              Contact
            </h1>

            <p className="mt-8 max-w-sm leading-relaxed text-brand-bone/60">
              {contact.intro}
            </p>

            <a
              href={`mailto:${contact.email}`}
              className="mt-10 inline-block font-heading text-2xl font-bold lowercase tracking-tight text-brand-bone underline underline-offset-8 transition-colors hover:text-brand-red sm:text-3xl"
            >
              {contact.email}
            </a>

            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-bone/60 transition-colors hover:text-brand-red"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm />
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}