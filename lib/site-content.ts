import { supabase } from './supabase'

export type SiteContent = {
  about: {
    headline: string
    body1: string
    body2: string
    craftHeading: string
    craftBody: string
    studioImage: string
    detailImage: string
  }
  terms: {
    refund: string
    shipping: string
  }
  contact: {
    email: string
    instagram: string
    tiktok: string
    intro: string
  }
  home: {
    tagline: string
    heroLine1: string
    heroLine2: string
    heroBody: string
    editorial1Label: string
    editorial1HeadingLine1: string
    editorial1HeadingLine2: string
    editorial1Body: string
    editorial1Image: string
    quote: string
    editorial2Label: string
    editorial2HeadingLine1: string
    editorial2HeadingLine2: string
    editorial2Body: string
    editorial2Image: string
    closingTagline: string
    closingHeading: string
  }
}

export async function getSiteContent(): Promise<SiteContent | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching site content:', error.message)
    return null
  }
  return data.content as SiteContent
}