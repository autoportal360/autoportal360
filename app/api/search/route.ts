import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Escape PostgreSQL ilike special characters
function safe(w: string) {
  return w.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

// Count how many search words appear in the combined "Brand Model" text
function score(brandName: string, modelName: string, words: string[]): number {
  const text = `${brandName} ${modelName}`.toLowerCase()
  return words.filter(w => text.includes(w)).length
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ models: [], brands: [], total: 0 })
  }

  // Split into individual words (max 6), lowercase for scoring
  const words = q.split(/\s+/).slice(0, 6).map(w => w.toLowerCase())
  const safeWords = words.map(safe)

  // Filter string: model name matches ANY word
  const nameFilter  = safeWords.map(w => `name.ilike.%${w}%`).join(',')
  // Filter string: brand name or slug matches ANY word
  const brandFilter = safeWords.map(w => `name.ilike.%${w}%,slug.ilike.%${w}%`).join(',')

  // Round 1 — parallel:
  //   (a) all brands whose name/slug matches any word (up to 20, slice 3 for display)
  //   (b) models whose own name matches any word
  const [brandsAllRes, modelsNameRes] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name, slug, type, logo_url, price_min, price_max')
      .eq('is_active', true)
      .or(brandFilter)
      .limit(20),
    supabase
      .from('models')
      .select('id, name, slug, type, price_min, thumbnail_url, brands!inner(name, slug)')
      .neq('status', 'discontinued')
      .or(nameFilter)
      .limit(20),
  ])

  const matchedBrandIds = (brandsAllRes.data ?? []).map(b => b.id)

  // Round 2 — fetch models that belong to any matched brand
  // (handles "royal enfield", "tata cars", "honda activa" etc.)
  const modelsBrandRes = matchedBrandIds.length > 0
    ? await supabase
        .from('models')
        .select('id, name, slug, type, price_min, thumbnail_url, brands!inner(name, slug)')
        .neq('status', 'discontinued')
        .in('brand_id', matchedBrandIds)
        .limit(20)
    : { data: [] }

  // Merge model results, deduplicate by id
  type M = {
    id: string; name: string; slug: string; type: string
    price_min: number | null; thumbnail_url: string | null
    brands: { name: string; slug: string }
  }

  const seen = new Set<string>()
  const allModels: M[] = []
  for (const m of [
    ...(modelsNameRes.data ?? []),
    ...(modelsBrandRes.data ?? []),
  ] as unknown as M[]) {
    if (!seen.has(m.id)) { seen.add(m.id); allModels.push(m) }
  }

  // Sort by relevance: models where more words match the "Brand Model" text rank higher
  allModels.sort((a, b) =>
    score(b.brands?.name ?? '', b.name, words) -
    score(a.brands?.name ?? '', a.name, words)
  )

  const models = allModels.slice(0, 5)
  const brands = (brandsAllRes.data ?? []).slice(0, 3)

  return NextResponse.json({ models, brands, total: models.length + brands.length })
}
