import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get distinct cities with dealer counts (active only for public)
    const { data, error } = await supabase
      .from('dealers')
      .select('city, city_slug, state')
      .eq('is_active', true)

    if (error) throw error

    // Aggregate city counts
    const cityMap = new Map<string, { city: string; city_slug: string; state: string; count: number }>()

    for (const row of data ?? []) {
      const key = row.city_slug
      if (cityMap.has(key)) {
        cityMap.get(key)!.count++
      } else {
        cityMap.set(key, { city: row.city, city_slug: row.city_slug, state: row.state, count: 1 })
      }
    }

    const cities = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count) // most dealers first

    return NextResponse.json(cities)
  } catch (error) {
    console.error('[GET /api/dealers/cities]', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
