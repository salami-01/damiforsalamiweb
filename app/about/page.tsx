import { GradientScroll } from '@/components/gradient-scroll'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { getSiteContent } from '@/lib/site-content'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About',
  description: 'The story behind Salami — made in shadow, built to last.',
}
export default async function AboutPage() {
  const content = await getSiteContent()
  const about = content?.about ?? {
    headline: 'Made in shadow',
    body1: 'Salami began in a single studio with a refusal — to follow the season, to shout, to compromise the cloth. We make a small number of pieces, slowly, in a palette that never strays from black, grey, and ember.',
    body2: 'Each garment is cut to last and worn to live in. Nothing is decorative. Everything is deliberate.',
    craftHeading: 'Every thread counts',
    craftBody: 'Seams are reinforced, hems are weighted, and every stitch is chosen for the way it ages.',
    studioImage: '/campaign/studio.png',
    detailImage: '/campaign/detail.png',
  }

  return (
    <GradientScroll
      colors={['#000000', '#1a1a1a', '#2b2b2b', '#3c3f41', '#4a0e16']}
      className="min-h-screen w-full text-brand-bone"
    >
      <section className="flex min-h-[90svh] flex-col justify-center px-6 pt-28 md:px-16 lg:px-24">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
            The House
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-8 max-w-5xl font-heading text-6xl font-black uppercase leading-[0.85] tracking-tighter text-balance sm:text-8xl lg:text-[9rem]">
            {about.headline}
          </h1>
        </Reveal>
      </section>

      <section className="grid grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:px-16 lg:px-24">
        <div className="flex flex-col justify-center md:col-span-5">
          <Reveal>
            <p className="text-lg leading-relaxed text-brand-bone/75">{about.body1}</p>
            <p className="mt-6 leading-relaxed text-brand-bone/60">{about.body2}</p>
          </Reveal>
        </div>
        <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
          <div className="overflow-hidden">
            <img
              src={about.studioImage}
              alt="Salami atelier"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-32 md:px-16 lg:px-24">
        <Reveal>
          <blockquote className="max-w-5xl font-heading text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            "Luxury is not the logo. It is the
            <span className="text-brand-red"> weight, the seam, the silence.</span>"
          </blockquote>
        </Reveal>
      </section>

      <section className="grid grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:px-16 lg:px-24">
        <Reveal className="md:col-span-7">
          <div className="overflow-hidden">
            <img
              src={about.detailImage}
              alt="Fabric detail"
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
        </Reveal>
        <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
          <Reveal delay={0.15}>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone/40">
              The Craft
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
              {about.craftHeading}
            </h2>
            <p className="mt-6 leading-relaxed text-brand-bone/65">{about.craftBody}</p>
          </Reveal>
        </div>
      </section>

      <div className="h-24" />
      <SiteFooter />
    </GradientScroll>
  )
}