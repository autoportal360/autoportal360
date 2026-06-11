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

  if (!name)                       return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!/^\d{10}$/.test(phone))     return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 })

  const { error } = await getSupabase()
    .from('leads')
    .insert({
      name,
      phone,
      email:        String(body.email        ?? '').trim() || null,
      city:         String(body.city         ?? '').trim() || null,
      model_slug:   String(body.model_slug   ?? '').trim() || null,
      model_id:     body.model_id   ? String(body.model_id)   : null,
      brand_name:   body.brand_name ? String(body.brand_name) : null,
      model_name:   body.model_name ? String(body.model_name) : null,
      variant_name: body.variant_name ? String(body.variant_name) : null,
      message:      body.message    ? String(body.message)    : null,
      source_page:  body.source_page ? String(body.source_page) : null,
      status:       'new',
    })

  if (error) {
    console.error('Lead insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
