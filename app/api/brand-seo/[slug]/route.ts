import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Ctx = { params: Promise<{ slug: string }> }

// GET /api/brand-seo/[slug]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params
  const { data, error } = await db()
    .from('brand_seo_content')
    .select('*')
    .eq('brand_slug', slug)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

// PUT /api/brand-seo/[slug]
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params
  const body = await req.json()

  const update: Record<string, unknown> = {}
  if (body.brand_name       !== undefined) update.brand_name       = body.brand_name
  if (body.seo_title        !== undefined) update.seo_title        = body.seo_title || null
  if (body.seo_text         !== undefined) update.seo_text         = body.seo_text
  if (body.meta_description !== undefined) update.meta_description = body.meta_description || null
  if (body.is_published     !== undefined) update.is_published     = body.is_published

  const { data, error } = await db()
    .from('brand_seo_content')
    .update(update)
    .eq('brand_slug', slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/brand-seo/[slug]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params
  const { error } = await db()
    .from('brand_seo_content')
    .delete()
    .eq('brand_slug', slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
