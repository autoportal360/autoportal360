import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ models: [], brands: [], total: 0 })
  }

  // Escape ilike special chars to prevent pattern injection
  const safe = q.replace(/%/g, '\\%').replace(/_/g, '\\_')

  const [modelsRes, brandsRes] = await Promise.all([
    supabase
      .from('models')
      .select('id, name, slug, type, price_min, thumbnail_url, brands!inner(name, slug)')
      .neq('status', 'discontinued')
      .or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
      .limit(5),
    supabase
      .from('brands')
      .select('id, name, slug, type, logo_url, price_min, price_max')
      .eq('is_active', true)
      .or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
      .limit(3),
  ])

  const models = modelsRes.data ?? []
  const brands = brandsRes.data ?? []

  return NextResponse.json({ models, brands, total: models.length + brands.length })
}
