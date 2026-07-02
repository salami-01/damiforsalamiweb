import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/shop')
}

// import Link from 'next/link'
// import { GradientScroll } from '@/components/gradient-scroll'
// import { Reveal } from '@/components/reveal'
// import { SiteFooter } from '@/components/site-footer'
// import { getSiteContent } from '@/lib/site-content'

// export const dynamic = 'force-dynamic'

// export default async function HomePage() {
//   const content = await getSiteContent()
//   const home = content?.home ?? {
//     tagline: 'Collection 001 — Nightfall',
//     heroLine1: 'Worn in',
//     heroLine2: 'the dark.',
//     heroBody: 'Salami is a study in restraint — heavyweight cloth, considered cuts, and a palette that lives between shadow and ember. No noise. Only the garment.',
//     editorial1Label: '01 — The Outerwear',
//     editorial1HeadingLine1: 'Structure',
//     editorial1HeadingLine2: 'over season',
//     editorial1Body: 'Every coat is cut from compact wool and built to hold its line for years, not weeks.',
//     editorial1Image: '/campaign/editorial-1.png',
//     quote: 'We design for the hour after midnight — when a city quiets and the cloth speaks for you.',
//     editorial2Label: '02 — The Essentials',
//     editorial2HeadingLine1: 'Weight you',
//     editorial2HeadingLine2: 'can feel',
//     editorial2Body: 'Boxy tees and heavyweight hoods in onyx and crimson — the foundation of the wardrobe.',
//     editorial2Image: '/campaign/editorial-2.png',
//     closingTagline: 'The full catalogue awaits',
//     closingHeading: 'Open Shop',
//   }

//   return (
//     <GradientScroll
//       colors={['#000000', '#1a1a1a', '#2b2b2b', '#3c3f41', '#4a0e16', '#7a1023']}
//       className="min-h-screen w-full text-brand-bone"
//     >
//       <section className="flex min-h-[100svh] flex-col justify-center px-6 pt-28 md:px-16 lg:px-24">
//         <Reveal>
//           <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
//             {home.tagline}
//           </p>
//         </Reveal>
//         <Reveal delay={0.1}>
//           <h1 className="mt-8 max-w-5xl font-heading text-6xl font-black uppercase leading-[0.85] tracking-tighter text-balance sm:text-8xl lg:text-[10rem]">
//             {home.heroLine1}
//             <br />
//             <span className="text-brand-bone/40">{home.heroLine2}</span>
//           </h1>
//         </Reveal>
//         <Reveal delay={0.25}>
//           <p className="mt-10 max-w-md text-pretty text-base leading-relaxed text-brand-bone/70">
//             {home.heroBody}
//           </p>
//         </Reveal>
//       </section>

//       <section className="grid grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:px-16 lg:px-24">
//         <Reveal className="md:col-span-7 md:col-start-1">
//           <div className="overflow-hidden">
//             <img
//               src={home.editorial1Image}
//               alt="Editorial — Outerwear"
//               className="aspect-[4/5] w-full object-cover"
//             />
//           </div>
//         </Reveal>
//         <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
//           <Reveal delay={0.15}>
//             <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone/40">
//               {home.editorial1Label}
//             </span>
//             <h2 className="mt-5 font-heading text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
//               {home.editorial1HeadingLine1}
//               <br />
//               {home.editorial1HeadingLine2}
//             </h2>
//             <p className="mt-6 text-pretty leading-relaxed text-brand-bone/65">
//               {home.editorial1Body}
//             </p>
//           </Reveal>
//         </div>
//       </section>

//       <section className="px-6 py-32 md:px-16 lg:px-24">
//         <Reveal>
//           <blockquote className="max-w-5xl font-heading text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
//             "{home.quote}"
//           </blockquote>
//         </Reveal>
//       </section>

//       <section className="grid grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:px-16 lg:px-24">
//         <div className="flex flex-col justify-center md:col-span-4 md:col-start-1 md:row-start-1">
//           <Reveal delay={0.15}>
//             <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone/40">
//               {home.editorial2Label}
//             </span>
//             <h2 className="mt-5 font-heading text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
//               {home.editorial2HeadingLine1}
//               <br />
//               {home.editorial2HeadingLine2}
//             </h2>
//             <p className="mt-6 text-pretty leading-relaxed text-brand-bone/65">
//               {home.editorial2Body}
//             </p>
//           </Reveal>
//         </div>
//         <Reveal className="md:col-span-7 md:col-start-6 md:row-start-1">
//           <div className="overflow-hidden">
//             <img
//               src={home.editorial2Image}
//               alt="Editorial — Essentials"
//               className="aspect-[4/5] w-full object-cover md:aspect-[16/11]"
//             />
//           </div>
//         </Reveal>
//       </section>

//       <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-32 text-center">
//         <Reveal>
//           <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/60">
//             {home.closingTagline}
//           </p>
//         </Reveal>
//         <Reveal delay={0.1}>
//           <h2 className="mt-8 font-heading text-6xl font-black uppercase leading-[0.85] tracking-tighter text-balance sm:text-8xl lg:text-9xl">
//             {home.closingHeading}
//           </h2>
//         </Reveal>
//         <Reveal delay={0.2}>
//           <Link
//             href="/shop"
//             className="mt-12 inline-flex items-center gap-3 border border-brand-bone/40 px-10 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-colors duration-500 hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
//           >
//             Enter the catalogue
//           </Link>
//         </Reveal>
//       </section>

//       <SiteFooter />
//     </GradientScroll>
//   )
// }