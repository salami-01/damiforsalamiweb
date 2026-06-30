import type { MetadataRoute } from 'next'

const baseUrl = 'https://melodic-fairy-ab5ac8.netlify.app/'

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