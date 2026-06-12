import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name  = String(body.name  ?? '').trim()
  const phone = String(body.phone ?? '').trim()

  if (!name)                   return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 })

  const payload: Record<string, unknown> = {
    name,
    phone,
    email:      String(body.email      ?? '').trim() || null,
    city:       String(body.city       ?? '').trim() || null,
    model_slug: String(body.model_slug ?? '').trim() || null,
    status:     'new',
  }

  // Optional enrichment columns — only added once migration has been run.
  // If the column does not yet exist Supabase will return a clear error.
  if (body.model_id)     payload.model_id     = String(body.model_id)
  if (body.brand_name)   payload.brand_name   = String(body.brand_name)
  if (body.model_name)   payload.model_name   = String(body.model_name)
  if (body.variant_name) payload.variant_name = String(body.variant_name)
  if (body.message)      payload.message      = String(body.message)
  if (body.source_page)  payload.source_page  = String(body.source_page)

  try {
    const { data, error } = await getSupabase()
      .from('leads')
      .insert(payload)
      .select()

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Leads API unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
