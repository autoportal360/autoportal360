import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/static-pages — list pages (filter by page_type, published_only for non-admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)
    const page_type = searchParams.get('page_type')
    const admin     = searchParams.get('admin') === '1'

    let q = supabase
      .from('static_pages')
      .select('id,title,slug,page_type,meta_title,is_published,sort_order,created_at,updated_at,seo_heading,hero_heading,hero_subtext')
      .order('sort_order', { ascending: true })
      .order('created_at',  { ascending: false })

    if (!admin) q = q.eq('is_published', true) as typeof q
    if (page_type && ['cars','bikes','scooters','mixed'].includes(page_type)) {
      q = q.eq('page_type', page_type) as typeof q
    }

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ pages: data ?? [] })
  } catch (err) {
    console.error('[GET /api/static-pages]', err)
    return NextResponse.json({ error: 'Failed to fetch static pages' }, { status: 500 })
  }
}

// POST /api/static-pages — create new page (admin only via service role)
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const body     = await request.json()

    const {
      title, slug, page_type, meta_title, meta_description,
      hero_heading, hero_subtext, vehicles, seo_heading,
      seo_text, faqs, is_published, sort_order,
    } = body

    if (!title || !slug || !hero_heading) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, hero_heading' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('static_pages')
      .insert({
        title,
        slug,
        page_type:        page_type        ?? 'cars',
        meta_title:       meta_title        || null,
        meta_description: meta_description  || null,
        hero_heading,
        hero_subtext:     hero_subtext      || null,
        vehicles:         vehicles          ?? [],
        seo_heading:      seo_heading       || null,
        seo_text:         seo_text          ?? '',
        faqs:             faqs              ?? [],
        is_published:     is_published      ?? true,
        sort_order:       sort_order        ?? 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/static-pages]', err)
    return NextResponse.json({ error: 'Failed to create static page' }, { status: 500 })
  }
}
