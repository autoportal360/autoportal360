import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ id: string }> }

// GET /api/dealers/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

// PUT /api/dealers/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const supabase = getAdminClient()
    const body = await request.json()

    // Strip read-only fields
    const { id: _id, created_at: _ca, updated_at: _ua, slug: _slug, ...rest } = body

    const { data, error } = await supabase
      .from('dealers')
      .update(rest)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug conflict' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT /api/dealers/[id]]', error)
    return NextResponse.json({ error: 'Failed to update dealer' }, { status: 500 })
  }
}

// DELETE /api/dealers/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const supabase = getAdminClient()
    const { error } = await supabase.from('dealers').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/dealers/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete dealer' }, { status: 500 })
  }
}
