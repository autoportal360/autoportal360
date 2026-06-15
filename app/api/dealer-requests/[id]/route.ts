import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ id: string }> }

// GET /api/dealer-requests/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('dealer_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Dealer request not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/dealer-requests/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch dealer request' }, { status: 500 })
  }
}

// PUT /api/dealer-requests/[id] — update status + admin_notes
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getAdminClient()
    const body = await request.json()

    const { status, admin_notes } = body

    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}
    if (status !== undefined)      updatePayload.status      = status
    if (admin_notes !== undefined)  updatePayload.admin_notes = admin_notes || null

    const { data, error } = await supabase
      .from('dealer_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT /api/dealer-requests/[id]]', error)
    return NextResponse.json({ error: 'Failed to update dealer request' }, { status: 500 })
  }
}

// DELETE /api/dealer-requests/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('dealer_requests')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/dealer-requests/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete dealer request' }, { status: 500 })
  }
}
