import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

type BrandRow = { slug: string; type: 'car' | 'bike' | 'scooter'; created_at: string }
type ModelRow = {
  slug: string
  created_at: string
  brands: { slug: string; type: string } | null
}
type CityRow = { slug: string }
type BlogRow = { slug: string; published_at: string | null }

function brandPageSlug(dbSlug: string, type: 'car' | 'bike' | 'scooter'): string {
  if (type === 'car') return `${dbSlug}-cars`
  if (type === 'bike') return `${dbSlug.replace(/-bike$/, '')}-bikes`
  return `${dbSlug.replace(/-scooter$/, '')}-scooters`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoportal360.vercel.app'
  const now = new Date()

  const [brandsRes, modelsRes, citiesRes, blogsRes] = await Promise.all([
    supabase.from('brands').select('slug, type, created_at').eq('is_active', true),
    supabase
      .from('models')
      .select('slug, created_at, brands!inner(slug, type)')
      .neq('status', 'discontinued'),
    supabase.from('cities').select('slug').eq('is_featured', true),
    supabase.from('blog_posts').select('slug, published_at').eq('status', 'published'),
  ])

  const brands = (brandsRes.data ?? []) as BrandRow[]
  const models = (modelsRes.data ?? []) as unknown as ModelRow[]
  const cities = (citiesRes.data ?? []) as CityRow[]
  const blogs = (blogsRes.data ?? []) as BlogRow[]

  const entries: MetadataRoute.Sitemap = []

  // Priority 1.0 — Homepage
  entries.push({ url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 })

  // Priority 0.9 — Listing pages
  for (const path of ['/new-cars/', '/new-bikes/', '/new-scooters/']) {
    entries.push({ url: `${base}${path}`, lastModified: now, changeFrequency: 'daily', priority: 0.9 })
  }

  // Priority 0.8 — Brand pages
  for (const brand of brands) {
    const slug = brandPageSlug(brand.slug, brand.type)
    entries.push({
      url: `${base}/${slug}/`,
      lastModified: brand.created_at ? new Date(brand.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Priority 0.7/0.6/0.5 — Model, price, specs, city pages
  for (const model of models) {
    const brand = model.brands as { slug: string; type: string } | null
    if (!brand) continue
    const bSlug = brandPageSlug(brand.slug, brand.type as 'car' | 'bike' | 'scooter')
    const lastMod = model.created_at ? new Date(model.created_at) : now
    const modelBase = `${base}/${bSlug}/${model.slug}`

    entries.push({ url: `${modelBase}/`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.7 })
    entries.push({ url: `${modelBase}/price/`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 })
    entries.push({ url: `${modelBase}/specs/`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.5 })

    for (const city of cities) {
      entries.push({
        url: `${modelBase}/price/${city.slug}/`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  // Priority 0.4 — Blog posts
  for (const post of blogs) {
    entries.push({
      url: `${base}/news/${post.slug}/`,
      lastModified: post.published_at ? new Date(post.published_at) : now,
      changeFrequency: 'never',
      priority: 0.4,
    })
  }

  return entries
}
