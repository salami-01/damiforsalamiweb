import type { MetadataRoute } from 'next'

const baseUrl = 'https://vercel.com/salami4lyf/damiforsalamiweb'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/cart'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}