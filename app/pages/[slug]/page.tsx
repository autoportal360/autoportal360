import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getCanonicalUrl } from '@/lib/seo'
import SchemaMarkup from '@/components/SchemaMarkup'
import StaticPageClient from './StaticPageClient'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { params: Promise<{ slug: string }> }

async function getPage(slug: string) {
  const { data, error } = await db
    .from('static_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Not Found' }

  return {
    title:       page.meta_title       ?? page.hero_heading,
    description: page.meta_description ?? page.hero_subtext ?? '',
    alternates:  { canonical: getCanonicalUrl(`/pages/${slug}/`) },
    robots:      { index: true, follow: true },
    openGraph: {
      title:       page.meta_title ?? page.hero_heading,
      description: page.meta_description ?? page.hero_subtext ?? '',
      url:         getCanonicalUrl(`/pages/${slug}/`),
      type:        'website',
    },
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  const vehicles = (page.vehicles ?? []) as {
    brand: string; model: string; price: string
    fuel: string; type: string; slug: string; tag: string
  }[]

  const faqs = (page.faqs ?? []) as { question: string; answer: string }[]

  // JSON-LD schemas
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.hero_heading,
    description: page.hero_subtext ?? '',
    url: getCanonicalUrl(`/pages/${slug}/`),
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${v.brand} ${v.model}`,
      url: getCanonicalUrl(v.slug),
    })),
  }

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.meta_title ?? page.hero_heading,
    description: page.meta_description ?? page.hero_subtext ?? '',
    url: getCanonicalUrl(`/pages/${slug}/`),
    publisher: {
      '@type': 'Organization',
      name: 'AutoPortal360',
      url: getCanonicalUrl('/'),
    },
  }

  const schemas = [webPageSchema, itemListSchema, ...(faqSchema ? [faqSchema] : [])]

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <StaticPageClient
        heroHeading={page.hero_heading}
        heroSubtext={page.hero_subtext}
        pageType={page.page_type}
        vehicles={vehicles}
        seoHeading={page.seo_heading}
        seoText={page.seo_text ?? ''}
        faqs={faqs}
      />
    </>
  )
}
