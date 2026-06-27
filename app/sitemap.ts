import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'

const baseUrl = 'https://vercel.com/salami4lyf/damiforsalamiweb'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const productUrls = products.map((p) => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/home`, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    ...productUrls,
  ]
}