import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/brand-seo
export async function GET() {
  const { data, error } = await db()
    .from('brand_seo_content')
    .select('*')
    .order('brand_name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/brand-seo
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { brand_slug, brand_name, seo_title, seo_text, meta_description, is_published } = body

  if (!brand_slug || !brand_name || !seo_text) {
    return NextResponse.json({ error: 'brand_slug, brand_name and seo_text are required' }, { status: 400 })
  }

  const { data, error } = await db()
    .from('brand_seo_content')
    .insert({ brand_slug, brand_name, seo_title: seo_title || null, seo_text, meta_description: meta_description || null, is_published: is_published ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
