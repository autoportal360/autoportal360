import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { toSlug } from '@/types/dealer'

// Service-role client — bypasses RLS for admin writes
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/dealers
// Query params: brand_slug, city_slug, vehicle_type, is_active, search, page, per_page
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)

    const brand_slug   = searchParams.get('brand_slug')
    const city_slug    = searchParams.get('city_slug')
    const vehicle_type = searchParams.get('vehicle_type')
    const is_active    = searchParams.get('is_active')
    const search       = searchParams.get('search')
    const page         = parseInt(searchParams.get('page') ?? '1', 10)
    const per_page     = parseInt(searchParams.get('per_page') ?? '20', 10)

    // Count query (without range)
    let countQuery = supabase
      .from('dealers')
      .select('id', { count: 'exact', head: true })

    // Data query
    let dataQuery = supabase
      .from('dealers')
      .select('*')
      .order('name', { ascending: true })
      .range((page - 1) * per_page, page * per_page - 1)

    // Apply shared filters
    const applyFilters = (q: typeof dataQuery) => {
      if (brand_slug)                          q = q.eq('brand_slug', brand_slug)
      if (city_slug)                           q = q.eq('city_slug', city_slug)
      if (vehicle_type)                        q = q.contains('vehicle_types', [vehicle_type])
      if (is_active !== null && is_active !== '') q = q.eq('is_active', is_active === 'true')
      if (search)                              q = q.or(
        `name.ilike.%${search}%,city.ilike.%${search}%,brand_name.ilike.%${search}%,address.ilike.%${search}%`
      )
      return q
    }

    countQuery = applyFilters(countQuery as typeof dataQuery) as typeof countQuery
    dataQuery  = applyFilters(dataQuery)

    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery,
    ])

    if (countResult.error) throw countResult.error
    if (dataResult.error)  throw dataResult.error

    const total       = countResult.count ?? 0
    const total_pages = Math.ceil(total / per_page)

    return NextResponse.json({
      dealers:     dataResult.data ?? [],
      total,
      page,
      per_page,
      total_pages,
    })
  } catch (error) {
    console.error('[GET /api/dealers]', error)
    return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 })
  }
}

// POST /api/dealers
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const body = await request.json()

    const {
      name, brand_slug, brand_name, city, city_slug, state,
      address, locality, pincode, phone, email, website,
      google_maps_url, vehicle_types, is_authorized, is_active,
      working_hours,
    } = body

    // Validation
    if (!name || !brand_slug || !brand_name || !city || !state || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brand_slug, brand_name, city, state, address' },
        { status: 400 }
      )
    }

    // Generate slug
    const resolvedCitySlug = city_slug || toSlug(city)
    const slug = toSlug(`${brand_slug}-${name}-${resolvedCitySlug}`)

    const { data, error } = await supabase
      .from('dealers')
      .insert({
        name,
        slug,
        brand_slug,
        brand_name,
        city,
        city_slug: resolvedCitySlug,
        state,
        address,
        locality:        locality        || null,
        pincode:         pincode         || null,
        phone:           phone           || null,
        email:           email           || null,
        website:         website         || null,
        google_maps_url: google_maps_url || null,
        vehicle_types:   vehicle_types  ?? ['cars'],
        is_authorized:   is_authorized  ?? true,
        is_active:       is_active      ?? true,
        working_hours:   working_hours  || 'Mon-Sat: 9 AM – 7 PM',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A dealer with this slug already exists. Try a different name.' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/dealers]', error)
    return NextResponse.json({ error: 'Failed to create dealer' }, { status: 500 })
  }
}
