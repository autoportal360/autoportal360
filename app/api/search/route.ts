import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Service-role client — bypasses RLS for server-side search
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function safe(w: string) {
  return w.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

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

  console.log('Search query:', q)

  const words     = q.split(/\s+/).slice(0, 6).map(w => w.toLowerCase())
  const safeWords = words.map(safe)

  const nameFilter  = safeWords.map(w => `name.ilike.%${w}%`).join(',')
  const brandFilter = safeWords.map(w => `name.ilike.%${w}%,slug.ilike.%${w}%`).join(',')

  // Round 1 — parallel
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

  console.log('Brand results:', brandsAllRes.data?.length ?? 0, brandsAllRes.error?.message)
  console.log('Model results:', modelsNameRes.data?.length ?? 0, modelsNameRes.error?.message)

  const matchedBrandIds = (brandsAllRes.data ?? []).map(b => b.id)

  // Round 2 — models belonging to matched brands
  const modelsBrandRes = matchedBrandIds.length > 0
    ? await supabase
        .from('models')
        .select('id, name, slug, type, price_min, thumbnail_url, brands!inner(name, slug)')
        .neq('status', 'discontinued')
        .in('brand_id', matchedBrandIds)
        .limit(20)
    : { data: [] }

  type M = {
    id: string; name: string; slug: string; type: string
    price_min: number | null; thumbnail_url: string | null
    brands: { name: string; slug: string }
  }

  const seen      = new Set<string>()
  const allModels: M[] = []
  for (const m of [
    ...(modelsNameRes.data ?? []),
    ...(modelsBrandRes.data ?? []),
  ] as unknown as M[]) {
    if (!seen.has(m.id)) { seen.add(m.id); allModels.push(m) }
  }

  allModels.sort((a, b) =>
    score(b.brands?.name ?? '', b.name, words) -
    score(a.brands?.name ?? '', a.name, words)
  )

  const models = allModels.slice(0, 5)
  const brands = (brandsAllRes.data ?? []).slice(0, 3)

  return NextResponse.json({ models, brands, total: models.length + brands.length })
}
