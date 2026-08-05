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
        <img src={value || '/placeholder.svg'} alt="" className="h-16 w-14 rounded object-cover" />
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
    const res = await fetch('/api/admin/site-content', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
    setSaving(false)
    if (!res.ok) {
    const data = await res.json()
    setError(data.error || 'Failed to save content.')
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
            Edit landing slideshow, About, Terms, and Contact.
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

        {/* Landing slideshow */}
        <section className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Landing Page — Images</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload separate sets for portrait (mobile) and landscape (desktop). If a set is empty, the general images are used as fallback.
          </p>

          {/* General fallback images */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General (fallback)</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {(content.landing?.images ?? []).map((img, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <img src={img} alt="" className="h-20 w-14 rounded object-cover" />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium hover:bg-secondary">
                    <Upload className="h-3 w-3" />
                    {uploadingField === `landing-img-${i}` ? '...' : 'Replace'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(file, `landing-img-${i}`, (url) => {
                          const newImages = [...(content.landing?.images ?? [])]
                          newImages[i] = url
                          setContent({ ...content, landing: { ...content.landing, images: newImages } })
                          setSaved(false)
                        })
                      }} />
                  </label>
                  {(content.landing?.images?.length ?? 0) > 1 && (
                    <button type="button" onClick={() => {
                      const newImages = (content.landing?.images ?? []).filter((_, idx) => idx !== i)
                      setContent({ ...content, landing: { ...content.landing, images: newImages } })
                      setSaved(false)
                    }} className="text-[11px] text-destructive hover:underline">Remove</button>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingField?.startsWith('landing-new') ? '...' : 'Add'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadImage(file, `landing-new-${Date.now()}`, (url) => {
                        setContent({ ...content, landing: { ...content.landing, images: [...(content.landing?.images ?? []), url] } })
                        setSaved(false)
                      })
                    }} />
                </label>
              </div>
            </div>
          </div>

          {/* Portrait images */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Portrait / Mobile</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Shown on phones and any screen taller than it is wide.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {(content.landing?.portraitImages ?? []).map((img, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <img src={img} alt="" className="h-20 w-14 rounded object-cover" />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium hover:bg-secondary">
                    <Upload className="h-3 w-3" />
                    {uploadingField === `portrait-${i}` ? '...' : 'Replace'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(file, `portrait-${i}-${Date.now()}`, (url) => {
                          const imgs = [...(content.landing?.portraitImages ?? [])]
                          imgs[i] = url
                          setContent({ ...content, landing: { ...content.landing, portraitImages: imgs } })
                          setSaved(false)
                        })
                      }} />
                  </label>
                  {(content.landing?.portraitImages?.length ?? 0) > 0 && (
                    <button type="button" onClick={() => {
                      const imgs = (content.landing?.portraitImages ?? []).filter((_, idx) => idx !== i)
                      setContent({ ...content, landing: { ...content.landing, portraitImages: imgs } })
                      setSaved(false)
                    }} className="text-[11px] text-destructive hover:underline">Remove</button>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingField?.startsWith('portrait-new') ? '...' : 'Add portrait'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadImage(file, `portrait-new-${Date.now()}`, (url) => {
                        setContent({ ...content, landing: { ...content.landing, portraitImages: [...(content.landing?.portraitImages ?? []), url] } })
                        setSaved(false)
                      })
                    }} />
                </label>
              </div>
            </div>
          </div>

          {/* Landscape images */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Landscape / Desktop</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Shown on desktops, laptops, and any screen wider than it is tall.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {(content.landing?.landscapeImages ?? []).map((img, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <img src={img} alt="" className="h-14 w-20 rounded object-cover" />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium hover:bg-secondary">
                    <Upload className="h-3 w-3" />
                    {uploadingField === `landscape-${i}` ? '...' : 'Replace'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(file, `landscape-${i}-${Date.now()}`, (url) => {
                          const imgs = [...(content.landing?.landscapeImages ?? [])]
                          imgs[i] = url
                          setContent({ ...content, landing: { ...content.landing, landscapeImages: imgs } })
                          setSaved(false)
                        })
                      }} />
                  </label>
                  {(content.landing?.landscapeImages?.length ?? 0) > 0 && (
                    <button type="button" onClick={() => {
                      const imgs = (content.landing?.landscapeImages ?? []).filter((_, idx) => idx !== i)
                      setContent({ ...content, landing: { ...content.landing, landscapeImages: imgs } })
                      setSaved(false)
                    }} className="text-[11px] text-destructive hover:underline">Remove</button>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingField?.startsWith('landscape-new') ? '...' : 'Add landscape'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadImage(file, `landscape-new-${Date.now()}`, (url) => {
                        setContent({ ...content, landing: { ...content.landing, landscapeImages: [...(content.landing?.landscapeImages ?? []), url] } })
                        setSaved(false)
                      })
                    }} />
                </label>
              </div>
            </div>
          </div>

          <label className="mt-6 block max-w-xs border-t border-border pt-5">
            <span className="text-xs font-medium text-muted-foreground">Slide interval (ms) — e.g. 4000 = 4 seconds</span>
            <input
              type="number"
              className={fieldClass}
              value={content.landing?.intervalMs ?? 4000}
              onChange={(e) => {
                setContent({ ...content, landing: { ...content.landing, intervalMs: Number(e.target.value) } })
                setSaved(false)
              }}
            />
          </label>
        </section>

        {/* About */}
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

        {/* Terms */}
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

        {/* Contact */}
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

      </div>
    </form>
  )
}
//this is the name of the file: components/admin/admin-content.tsx