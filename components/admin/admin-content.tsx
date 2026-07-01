'use client'

import { useState, useEffect } from 'react'
import { Check, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SiteContent } from '@/lib/site-content'

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'

function ImageField({
  label,
  value,
  uploading,
  onUpload,
}: {
  label: string
  value: string
  uploading: boolean
  onUpload: (file: File) => void
}) {
  return (
    <div className="mt-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <img src={value} alt="" className="h-16 w-14 rounded object-cover" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Uploading...' : 'Replace'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
            }}
          />
        </label>
      </div>
    </div>
  )
}

export function AdminContent() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
  async function load() {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single()

    if (error) setError(error.message)
    else setContent(data.content as SiteContent)
    setLoading(false)
  }
  load()
}, [supabase])
  function setAbout<K extends keyof SiteContent['about']>(key: K, value: string) {
    if (!content) return
    setContent({ ...content, about: { ...content.about, [key]: value } })
    setSaved(false)
  }

  function setTerms<K extends keyof SiteContent['terms']>(key: K, value: string) {
    if (!content) return
    setContent({ ...content, terms: { ...content.terms, [key]: value } })
    setSaved(false)
  }

  function setContact<K extends keyof SiteContent['contact']>(key: K, value: string) {
    if (!content) return
    setContent({ ...content, contact: { ...content.contact, [key]: value } })
    setSaved(false)
  }

  function setHome<K extends keyof SiteContent['home']>(key: K, value: string) {
    if (!content) return
    setContent({ ...content, home: { ...content.home, [key]: value } })
    setSaved(false)
  }

  async function uploadImage(file: File, fieldKey: string, onDone: (url: string) => void) {
    setUploadingField(fieldKey)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${fieldKey}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploadingField(null)
      return
    }

    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    onDone(data.publicUrl)
    setUploadingField(null)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!content) return
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('site_content')
      .update({ content })
      .eq('id', 1)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading content...</p>
  if (!content) return <p className="text-sm text-destructive">Failed to load content.</p>

  return (
    <form onSubmit={save}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Content Editor</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit Home, About, Terms, and Contact copy and images.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Home — Hero</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Tagline</span>
            <input className={fieldClass} value={content.home.tagline} onChange={(e) => setHome('tagline', e.target.value)} />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Headline line 1</span>
              <input className={fieldClass} value={content.home.heroLine1} onChange={(e) => setHome('heroLine1', e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Headline line 2</span>
              <input className={fieldClass} value={content.home.heroLine2} onChange={(e) => setHome('heroLine2', e.target.value)} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Hero body text</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.home.heroBody} onChange={(e) => setHome('heroBody', e.target.value)} />
          </label>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Home — Editorial 1</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Label</span>
            <input className={fieldClass} value={content.home.editorial1Label} onChange={(e) => setHome('editorial1Label', e.target.value)} />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Heading line 1</span>
              <input className={fieldClass} value={content.home.editorial1HeadingLine1} onChange={(e) => setHome('editorial1HeadingLine1', e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Heading line 2</span>
              <input className={fieldClass} value={content.home.editorial1HeadingLine2} onChange={(e) => setHome('editorial1HeadingLine2', e.target.value)} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Body</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.home.editorial1Body} onChange={(e) => setHome('editorial1Body', e.target.value)} />
          </label>
          <ImageField
            label="Image"
            value={content.home.editorial1Image}
            uploading={uploadingField === 'home-editorial1Image'}
            onUpload={(file) => uploadImage(file, 'home-editorial1Image', (url) => setHome('editorial1Image', url))}
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Home — Quote &amp; Editorial 2</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Pull quote</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.home.quote} onChange={(e) => setHome('quote', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Editorial 2 — Label</span>
            <input className={fieldClass} value={content.home.editorial2Label} onChange={(e) => setHome('editorial2Label', e.target.value)} />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Heading line 1</span>
              <input className={fieldClass} value={content.home.editorial2HeadingLine1} onChange={(e) => setHome('editorial2HeadingLine1', e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Heading line 2</span>
              <input className={fieldClass} value={content.home.editorial2HeadingLine2} onChange={(e) => setHome('editorial2HeadingLine2', e.target.value)} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Body</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.home.editorial2Body} onChange={(e) => setHome('editorial2Body', e.target.value)} />
          </label>
          <ImageField
            label="Image"
            value={content.home.editorial2Image}
            uploading={uploadingField === 'home-editorial2Image'}
            onUpload={(file) => uploadImage(file, 'home-editorial2Image', (url) => setHome('editorial2Image', url))}
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Home — Closing</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Tagline</span>
            <input className={fieldClass} value={content.home.closingTagline} onChange={(e) => setHome('closingTagline', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Heading</span>
            <input className={fieldClass} value={content.home.closingHeading} onChange={(e) => setHome('closingHeading', e.target.value)} />
          </label>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">About</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Headline</span>
            <input className={fieldClass} value={content.about.headline} onChange={(e) => setAbout('headline', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Body — paragraph 1</span>
            <textarea rows={4} className={`${fieldClass} resize-none`} value={content.about.body1} onChange={(e) => setAbout('body1', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Body — paragraph 2</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.about.body2} onChange={(e) => setAbout('body2', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Craft heading</span>
            <input className={fieldClass} value={content.about.craftHeading} onChange={(e) => setAbout('craftHeading', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Craft body</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.about.craftBody} onChange={(e) => setAbout('craftBody', e.target.value)} />
          </label>
          <ImageField
            label="Studio image"
            value={content.about.studioImage}
            uploading={uploadingField === 'about-studioImage'}
            onUpload={(file) => uploadImage(file, 'about-studioImage', (url) => setAbout('studioImage', url))}
          />
          <ImageField
            label="Detail image"
            value={content.about.detailImage}
            uploading={uploadingField === 'about-detailImage'}
            onUpload={(file) => uploadImage(file, 'about-detailImage', (url) => setAbout('detailImage', url))}
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Terms</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Refund policy</span>
            <textarea rows={5} className={`${fieldClass} resize-none`} value={content.terms.refund} onChange={(e) => setTerms('refund', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Shipping policy</span>
            <textarea rows={4} className={`${fieldClass} resize-none`} value={content.terms.shipping} onChange={(e) => setTerms('shipping', e.target.value)} />
          </label>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Contact</h3>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Intro text</span>
            <textarea rows={3} className={`${fieldClass} resize-none`} value={content.contact.intro} onChange={(e) => setContact('intro', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <input className={fieldClass} value={content.contact.email} onChange={(e) => setContact('email', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Instagram</span>
            <input className={fieldClass} value={content.contact.instagram} onChange={(e) => setContact('instagram', e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">TikTok</span>
            <input className={fieldClass} value={content.contact.tiktok} onChange={(e) => setContact('tiktok', e.target.value)} />
          </label>
        </section>
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Landing Page — Slideshow</h3>
          <p className="mt-1 text-xs text-muted-foreground">Images shown on the landing page before "Enter" is clicked.</p>
          <div className="mt-4 space-y-3">
            {content.landing.images.map((img, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={img} alt="" className="h-14 w-12 rounded object-cover" />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingField === `landing-${i}` ? 'Uploading...' : 'Replace'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadImage(file, `landing-img-${i}`, (url) => {
                        const newImages = [...content.landing.images]
                        newImages[i] = url
                        setContent({ ...content, landing: { ...content.landing, images: newImages } })
                        setSaved(false)
                      })
                    }}
                  />
                </label>
                {content.landing.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = content.landing.images.filter((_, idx) => idx !== i)
                      setContent({ ...content, landing: { ...content.landing, images: newImages } })
                      setSaved(false)
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
              <Upload className="h-3.5 w-3.5" />
              {uploadingField?.startsWith('landing-new') ? 'Uploading...' : 'Add image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadImage(file, `landing-new-${Date.now()}`, (url) => {
                    setContent({ ...content, landing: { ...content.landing, images: [...content.landing.images, url] } })
                    setSaved(false)
                  })
                }}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted-foreground">Slide interval (ms)</span>
            <input
              type="number"
              className={fieldClass}
              value={content.landing.intervalMs}
              onChange={(e) => {
                setContent({ ...content, landing: { ...content.landing, intervalMs: Number(e.target.value) } })
                setSaved(false)
              }}
            />
          </label>
        </section>
      </div>
    </form>
  )
}
