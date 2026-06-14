import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/brand-page-seo?type=cars|bikes|scooters
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')
  let query = db().from('brand_page_seo').select('*').order('brand_name', { ascending: true })
  if (type) query = query.eq('vehicle_type', type)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/brand-page-seo
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { brand_slug, brand_name, vehicle_type, seo_heading, seo_text, top_models, is_published } = body

  if (!brand_slug || !brand_name || !seo_text) {
    return NextResponse.json({ error: 'brand_slug, brand_name and seo_text are required' }, { status: 400 })
  }

  const { data, error } = await db()
    .from('brand_page_seo')
    .insert({
      brand_slug,
      brand_name,
      vehicle_type: vehicle_type ?? 'cars',
      seo_heading:  seo_heading  || null,
      seo_text,
      top_models:   top_models   ?? [],
      is_published: is_published ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
