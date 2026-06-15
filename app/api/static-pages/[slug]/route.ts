import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ slug: string }> }

// GET /api/static-pages/[slug]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/static-pages/[slug]]', err)
    return NextResponse.json({ error: 'Failed to fetch static page' }, { status: 500 })
  }
}

// PUT /api/static-pages/[slug] — update
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = getAdminClient()
    const body     = await request.json()

    const {
      title, page_type, meta_title, meta_description,
      hero_heading, hero_subtext, vehicles, seo_heading,
      seo_text, faqs, is_published, sort_order, slug: newSlug,
    } = body

    const { data, error } = await supabase
      .from('static_pages')
      .update({
        ...(title            !== undefined && { title }),
        ...(newSlug          !== undefined && { slug: newSlug }),
        ...(page_type        !== undefined && { page_type }),
        ...(meta_title       !== undefined && { meta_title }),
        ...(meta_description !== undefined && { meta_description }),
        ...(hero_heading     !== undefined && { hero_heading }),
        ...(hero_subtext     !== undefined && { hero_subtext }),
        ...(vehicles         !== undefined && { vehicles }),
        ...(seo_heading      !== undefined && { seo_heading }),
        ...(seo_text         !== undefined && { seo_text }),
        ...(faqs             !== undefined && { faqs }),
        ...(is_published     !== undefined && { is_published }),
        ...(sort_order       !== undefined && { sort_order }),
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[PUT /api/static-pages/[slug]]', err)
    return NextResponse.json({ error: 'Failed to update static page' }, { status: 500 })
  }
}

// DELETE /api/static-pages/[slug]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('static_pages')
      .delete()
      .eq('slug', slug)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/static-pages/[slug]]', err)
    return NextResponse.json({ error: 'Failed to delete static page' }, { status: 500 })
  }
}
