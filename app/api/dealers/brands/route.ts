import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('dealers')
      .select('brand_slug, brand_name')
      .eq('is_active', true)

    if (error) throw error

    const brandMap = new Map<string, { brand_name: string; brand_slug: string; count: number }>()

    for (const row of data ?? []) {
      const key = row.brand_slug
      if (brandMap.has(key)) {
        brandMap.get(key)!.count++
      } else {
        brandMap.set(key, { brand_name: row.brand_name, brand_slug: row.brand_slug, count: 1 })
      }
    }

    const brands = Array.from(brandMap.values())
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(brands)
  } catch (error) {
    console.error('[GET /api/dealers/brands]', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}
