import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import SchemaMarkup from '@/components/SchemaMarkup'
import ImageGallery from '@/components/ImageGallery'
import FaqAccordion from '@/components/FaqAccordion'
import type { GalleryImage } from '@/components/ImageGallery'
import type { Faq } from '@/components/FaqAccordion'
import { getCanonicalUrl } from '@/lib/seo'
import type { Brand } from '@/types'
import ModelSubNav from '../ModelSubNav'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleType = 'car' | 'bike' | 'scooter'

type ModelRow = { id: string; name: string; slug: string }

type ModelImageRow = {
  id: string; url: string; alt_text: string | null
  type: string; sort_order: number
}

type ModelPageSeo = {
  seo_heading: string | null
  seo_text: string
  faqs: Faq[]
}

// ─── Slug parsing ─────────────────────────────────────────────────────────────

interface ParsedSlug {
  brandName: string; vehicleType: VehicleType
  vehicleLabel: string; listingHref: string
}

function parseSlug(brandSlug: string): ParsedSlug | null {
  if (brandSlug.endsWith('-cars'))
    return { brandName: brandSlug.slice(0, -5), vehicleType: 'car',     vehicleLabel: 'Cars',     listingHref: '/new-cars/'     }
  if (brandSlug.endsWith('-bikes'))
    return { brandName: brandSlug.slice(0, -6), vehicleType: 'bike',    vehicleLabel: 'Bikes',    listingHref: '/new-bikes/'    }
  if (brandSlug.endsWith('-scooters'))
    return { brandName: brandSlug.slice(0, -9), vehicleType: 'scooter', vehicleLabel: 'Scooters', listingHref: '/new-scooters/' }
  return null
}

const getBrand = cache(async (slug: string, type: VehicleType): Promise<Brand | null> => {
  const { data } = await supabase.from('brands').select('*')
    .eq('slug', slug).eq('type', type).eq('is_active', true).single()
  if (data) return data
  if (type === 'bike' || type === 'scooter') {
    const { data: d2 } = await supabase.from('brands').select('*')
      .eq('slug', `${slug}-${type}`).eq('type', type).eq('is_active', true).single()
    return d2 ?? null
  }
  return null
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandSlug: string; model: string }>
}): Promise<Metadata> {
  const { brandSlug, model: modelSlug } = await params
  const parsed = parseSlug(brandSlug)
  if (!parsed) return { title: 'Not Found' }
  const brand = await getBrand(parsed.brandName, parsed.vehicleType)
  if (!brand) return { title: 'Not Found' }
  const { data: model } = await supabase
    .from('models').select('name').eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!model) return { title: 'Not Found' }
  const canonical = `/${brandSlug}/${modelSlug}/images/`
  return {
    title: `${brand.name} ${model.name} Images 2026 — Exterior & Interior | AutoPortal360`,
    description: `${brand.name} ${model.name} image gallery — exterior, interior, colour and detail photos. High-quality images from all angles.`,
    alternates: { canonical: getCanonicalUrl(canonical) },
    openGraph: { title: `${brand.name} ${model.name} Images 2026`, url: getCanonicalUrl(canonical), type: 'website' },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ brandSlug: string; model: string }>
}) {
  const { brandSlug, model: modelSlug } = await params

  const parsed = parseSlug(brandSlug)
  if (!parsed) notFound()
  const { brandName, vehicleType, vehicleLabel, listingHref } = parsed

  const brand = await getBrand(brandName, vehicleType)
  if (!brand) notFound()

  const { data: modelRaw } = await supabase
    .from('models').select('id, name, slug')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!modelRaw) notFound()
  const m = modelRaw as unknown as ModelRow

  const [{ data: imagesRaw }, { data: seoRaw }] = await Promise.all([
    supabase.from('model_images').select('*').eq('model_id', m.id).order('sort_order'),
    supabase.from('model_page_seo').select('seo_heading,seo_text,faqs')
      .eq('model_id', m.id).eq('page_type', 'images').eq('is_published', true).maybeSingle(),
  ])

  const dbImages = (imagesRaw ?? []) as ModelImageRow[]

  // Map DB rows to GalleryImage format
  const galleryImages: GalleryImage[] = dbImages.map(img => ({
    url:      img.url,
    alt:      img.alt_text ?? `${brand.name} ${m.name} ${img.type ?? 'exterior'} photo`,
    category: img.type ?? 'exterior',
  }))

  // SEO content — DB admin content takes priority, static fallback otherwise
  const seoContent = seoRaw as ModelPageSeo | null
  const seoHeading = seoContent?.seo_heading ?? `About ${brand.name} ${m.name} Photos and Images`
  const seoText    = seoContent?.seo_text ?? ''
  const faqs: Faq[] = seoContent?.faqs ?? [
    {
      question: `How many ${m.name} images are available?`,
      answer:   `AutoPortal360 currently has ${dbImages.length > 0 ? dbImages.length : 'multiple'} photos of the ${brand.name} ${m.name} covering exterior, interior and colour options. New images are added regularly.`,
    },
    {
      question: `Are ${m.name} interior photos available?`,
      answer:   dbImages.some(i => i.type === 'interior')
        ? `Yes — interior photos of the ${brand.name} ${m.name} are available in the gallery above. Click any image to open the full-screen lightbox.`
        : `Interior photos of the ${brand.name} ${m.name} will be added soon. Check back after the next update.`,
    },
    {
      question: `What are the exterior design highlights of the ${m.name}?`,
      answer:   `The ${brand.name} ${m.name} features a contemporary exterior design with bold lines, a distinctive front grille and modern LED lighting. The gallery above shows all exterior angles including front, rear, side and three-quarter views.`,
    },
    {
      question: `What colors is the ${m.name} available in?`,
      answer:   `The ${brand.name} ${m.name} is available in multiple color options. Visit the Colors page for official color swatches, or browse the gallery above to see real-world color photos.`,
    },
  ]

  // Schema markup
  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name:        `${brand.name} ${m.name} Images`,
    description: `Exterior and interior photos of the ${brand.name} ${m.name}`,
    url:         getCanonicalUrl(`/${brandSlug}/${modelSlug}/images/`),
    numberOfItems: galleryImages.length,
    ...(galleryImages.length > 0 && {
      image: galleryImages.slice(0, 10).map(img => ({
        '@type':       'ImageObject',
        url:           img.url,
        name:          img.alt,
        description:   img.alt,
      })),
    }),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <div>
      <SchemaMarkup schemas={[imageGallerySchema, faqSchema]} />
      <ModelSubNav brandSlug={brandSlug} modelSlug={modelSlug} />
      <AdSlot zone="hero-billboard" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 64px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/${modelSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{m.name}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Images</span>
        </div>

        {/* H1 */}
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.2 }}>
          {brand.name} {m.name} <span style={{ color: '#00D4FF' }}>Images</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#8E99A8', margin: '0 0 28px' }}>
          {dbImages.length > 0 ? `${dbImages.length} photos · Exterior, interior and colour` : 'Exterior, interior and detail photos'}
        </p>

        {/* Gallery */}
        <ImageGallery images={galleryImages} />

        {/* SEO text */}
        {(seoText || !seoContent) && (
          <div className="ap-seo-block">
            <h2>{seoHeading}</h2>
            {seoText
              ? seoText.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="ap-seo-para">{para.trim()}</p>
                ))
              : (
                <>
                  <p className="ap-seo-para">
                    The {brand.name} {m.name} image gallery on AutoPortal360 gives you a comprehensive visual overview of this vehicle. Browse high-quality photographs covering all exterior angles — front, rear, side profiles and three-quarter views — to get a true sense of its design language and proportions.
                  </p>
                  <p className="ap-seo-para">
                    Interior photos reveal the dashboard layout, seat quality, infotainment system, instrument cluster and cabin storage options. Whether you are evaluating materials and fit-finish or checking head room and legroom, the interior images help you make a more informed buying decision without visiting a showroom.
                  </p>
                  <p className="ap-seo-para">
                    Colour and detail shots highlight paint finish quality and exterior accents. All images are updated regularly as new variants and special editions are launched. Click any photo to open the full-screen lightbox carousel and navigate using arrow keys or swipe gestures on mobile.
                  </p>
                </>
              )
            }
          </div>
        )}

        {/* FAQs */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 1rem' }}>
            Frequently Asked Questions
          </h2>
          <FaqAccordion faqs={faqs} />
        </div>

      </div>

      <AdSlot zone="pre-footer" />
    </div>
  )
}
