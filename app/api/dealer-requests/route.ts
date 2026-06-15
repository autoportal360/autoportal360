import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/dealer-requests
// Query params: status (pending/approved/rejected), page, per_page
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)

    const status   = searchParams.get('status')
    const page     = parseInt(searchParams.get('page') ?? '1', 10)
    const per_page = parseInt(searchParams.get('per_page') ?? '20', 10)

    let countQuery = supabase
      .from('dealer_requests')
      .select('id', { count: 'exact', head: true })

    let dataQuery = supabase
      .from('dealer_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * per_page, page * per_page - 1)

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      countQuery = countQuery.eq('status', status) as typeof countQuery
      dataQuery  = dataQuery.eq('status', status)
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

    if (countResult.error) throw countResult.error
    if (dataResult.error)  throw dataResult.error

    const total       = countResult.count ?? 0
    const total_pages = Math.ceil(total / per_page)

    return NextResponse.json({ requests: dataResult.data ?? [], total, page, per_page, total_pages })
  } catch (error) {
    console.error('[GET /api/dealer-requests]', error)
    return NextResponse.json({ error: 'Failed to fetch dealer requests' }, { status: 500 })
  }
}

// POST /api/dealer-requests — public submission
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const body = await request.json()

    const {
      dealer_name, brand_name, brand_slug, contact_person, phone, email,
      city, state, address, locality, pincode, vehicle_types,
      website, google_maps_url, working_hours, message,
    } = body

    if (!dealer_name || !brand_name || !contact_person || !phone || !email || !city || !state || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: dealer_name, brand_name, contact_person, phone, email, city, state, address' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('dealer_requests')
      .insert({
        dealer_name,
        brand_name,
        brand_slug:      brand_slug      || null,
        contact_person,
        phone,
        email,
        city,
        state,
        address,
        locality:        locality        || null,
        pincode:         pincode         || null,
        vehicle_types:   vehicle_types   ?? ['cars'],
        website:         website         || null,
        google_maps_url: google_maps_url || null,
        working_hours:   working_hours   || 'Mon-Sat: 9 AM – 7 PM',
        message:         message         || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/dealer-requests]', error)
    return NextResponse.json({ error: 'Failed to submit dealer request' }, { status: 500 })
  }
}
