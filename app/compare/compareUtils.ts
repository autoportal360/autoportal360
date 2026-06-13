import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { Spec } from '@/types'

// ─── types ────────────────────────────────────────────────────────────────────

export type VehicleType = 'car' | 'bike' | 'scooter'

export type LoadedVehicle = {
  modelId: string
  modelName: string
  modelSlug: string
  brandSlug: string       // DB slug, e.g. 'tata', 'maruti-suzuki'
  brandPageSlug: string   // URL slug, e.g. 'tata-cars'
  brandName: string
  vehicleType: VehicleType
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  popularVariant: {
    name: string
    ex_showroom_price: number
    fuel_type: string | null
    transmission: string | null
  } | null
  topVariant: { name: string; ex_showroom_price: number } | null
  specs: Spec | null
}

export type SpecRow = {
  section?: string
  label: string
  value: (v: LoadedVehicle) => number | string | null
  higher?: boolean  // true = higher wins, false = lower wins, undefined = no comparison
  isPrice?: boolean
  unit?: string
}

// ─── slug helpers ─────────────────────────────────────────────────────────────

export function getBrandPageSlug(dbSlug: string, type: VehicleType): string {
  if (type === 'car')    return `${dbSlug}-cars`
  if (type === 'bike')   return `${dbSlug.replace(/-bike$/, '')}-bikes`
  return `${dbSlug.replace(/-scooter$/, '')}-scooters`
}

// Combined SEO slug: brandDbSlug + '-' + modelSlug
export function getCombinedSlug(brandSlug: string, modelSlug: string): string {
  return `${brandSlug}-${modelSlug}`
}

export function buildComparisonPath(vehicles: (LoadedVehicle | null)[]): string {
  const filled = vehicles.filter(Boolean) as LoadedVehicle[]
  if (filled.length < 2) return '/compare'
  const slugs = filled.map(v => getCombinedSlug(v.brandSlug, v.modelSlug))
  return `/compare/${slugs.join('-vs-')}/`
}

// ─── DB loading ───────────────────────────────────────────────────────────────

type RawModel = {
  id: string
  name: string
  slug: string
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  brands: { id: string; name: string; slug: string; type: string }
}

// Load one model's variants + specs given raw model row
async function enrichModel(row: RawModel): Promise<LoadedVehicle> {
  const brand = row.brands
  const brandType = brand.type as VehicleType

  const { data: variants } = await supabase
    .from('variants')
    .select('id, name, ex_showroom_price, fuel_type, transmission, is_popular, sort_order')
    .eq('model_id', row.id)
    .order('sort_order')

  const all = variants ?? []
  const popular = all.find(v => v.is_popular) ?? all[0] ?? null
  const top     = all.length > 1 ? all[all.length - 1] : null

  let specs: Spec | null = null
  if (popular) {
    const { data } = await supabase.from('specs').select('*').eq('variant_id', popular.id).single()
    specs = data as Spec | null
  }

  return {
    modelId:       row.id,
    modelName:     row.name,
    modelSlug:     row.slug,
    brandSlug:     brand.slug,
    brandPageSlug: getBrandPageSlug(brand.slug, brandType),
    brandName:     brand.name,
    vehicleType:   brandType,
    price_min:     row.price_min,
    price_max:     row.price_max,
    thumbnail_url: row.thumbnail_url,
    popularVariant: popular
      ? { name: popular.name, ex_showroom_price: popular.ex_showroom_price, fuel_type: popular.fuel_type, transmission: popular.transmission }
      : null,
    topVariant: top ? { name: top.name, ex_showroom_price: top.ex_showroom_price } : null,
    specs,
  }
}

// Load vehicles from SEO combined slugs (e.g. 'tata-punch', 'maruti-suzuki-swift')
export async function loadVehiclesFromSlugs(combinedSlugs: string[]): Promise<(LoadedVehicle | null)[]> {
  const { data: allModels } = await supabase
    .from('models')
    .select('id, name, slug, price_min, price_max, thumbnail_url, brands!inner(id, name, slug, type)')
    .neq('status', 'discontinued')

  if (!allModels) return combinedSlugs.map(() => null)

  const rows = allModels as unknown as RawModel[]

  const results = await Promise.all(
    combinedSlugs.map(async combined => {
      const row = rows.find(m => `${m.brands.slug}-${m.slug}` === combined)
      if (!row) return null
      return enrichModel(row)
    })
  )

  return results
}

// Load a single vehicle by brand DB slug + model slug (used in CompareClient selectors)
export async function loadVehicleByBrandModel(brandSlug: string, modelSlug: string): Promise<LoadedVehicle | null> {
  const { data: rows } = await supabase
    .from('models')
    .select('id, name, slug, price_min, price_max, thumbnail_url, brands!inner(id, name, slug, type)')
    .eq('slug', modelSlug)
    .neq('status', 'discontinued')

  if (!rows?.length) return null
  const rows2 = rows as unknown as RawModel[]
  const row = rows2.find(r => r.brands.slug === brandSlug) ?? rows2[0]
  return enrichModel(row)
}

// ─── spec rows ────────────────────────────────────────────────────────────────

export const SPEC_ROWS: SpecRow[] = [
  { section: 'Pricing',             label: 'Starting Price',               isPrice: true, higher: false, value: v => v.price_min },
  {                                  label: 'Top Variant Price',            isPrice: true, higher: false, value: v => v.price_max },
  {                                  label: 'Popular Variant Price',        isPrice: true, higher: false, value: v => v.popularVariant?.ex_showroom_price ?? null },
  { section: 'Engine & Performance', label: 'Engine Displacement',          unit: ' cc',                  value: v => v.specs?.engine_cc ?? null },
  {                                  label: 'Max Power',                    unit: ' bhp', higher: true,   value: v => v.specs?.power_bhp ?? null },
  {                                  label: 'Max Torque',                   unit: ' Nm',  higher: true,   value: v => v.specs?.torque_nm ?? null },
  {                                  label: 'Mileage (ARAI)',               unit: ' km/l',higher: true,   value: v => v.specs?.mileage_arai ?? null },
  {                                  label: 'Fuel Type',                                                  value: v => v.popularVariant?.fuel_type ?? null },
  {                                  label: 'Transmission',                                               value: v => v.popularVariant?.transmission ?? null },
  { section: 'Dimensions',           label: 'Length',                       unit: ' mm',                  value: v => v.specs?.length_mm ?? null },
  {                                  label: 'Width',                        unit: ' mm',                  value: v => v.specs?.width_mm ?? null },
  {                                  label: 'Height',                       unit: ' mm',                  value: v => v.specs?.height_mm ?? null },
  {                                  label: 'Wheelbase',                    unit: ' mm',                  value: v => v.specs?.wheelbase_mm ?? null },
  {                                  label: 'Ground Clearance',             unit: ' mm', higher: true,    value: v => v.specs?.ground_clearance_mm ?? null },
  {                                  label: 'Kerb Weight',                  unit: ' kg', higher: false,   value: v => v.specs?.kerb_weight_kg ?? null },
  { section: 'Capacity & Features',  label: 'Seating Capacity',             unit: ' seats',               value: v => v.specs?.seating ?? null },
  {                                  label: 'Boot Space',                   unit: ' L',  higher: true,    value: v => v.specs?.boot_space_l ?? null },
  {                                  label: 'Fuel Tank Capacity',           unit: ' L',  higher: true,    value: v => v.specs?.fuel_tank_l ?? null },
  {                                  label: 'Tyre Size',                                                  value: v => v.specs?.tyre_size ?? null },
  { section: 'Safety',               label: 'NCAP Safety Rating',           unit: '/5',  higher: true,    value: v => v.specs?.ncap_rating ?? null },
  {                                  label: 'Airbags',                      unit: ' airbags', higher: true, value: v => v.specs?.airbags ?? null },
  {                                  label: 'ABS',                                                        value: v => v.specs?.abs != null ? (v.specs.abs ? 'Yes' : 'No') : null },
  { section: 'Suspension & Brakes',  label: 'Front Suspension',                                           value: v => v.specs?.front_suspension ?? null },
  {                                  label: 'Rear Suspension',                                            value: v => v.specs?.rear_suspension ?? null },
  {                                  label: 'Front Brake',                                                value: v => v.specs?.front_brake ?? null },
  {                                  label: 'Rear Brake',                                                 value: v => v.specs?.rear_brake ?? null },
]

// ─── comparison summary ───────────────────────────────────────────────────────

export function generateComparisonSummary(vehicles: LoadedVehicle[]): string {
  if (vehicles.length < 2) return ''
  const [v1, v2] = vehicles
  const parts: string[] = []

  // Price
  if (v1.price_min && v2.price_min && v1.price_min !== v2.price_min) {
    const diff = Math.abs(v1.price_min - v2.price_min)
    const cheaper = v1.price_min < v2.price_min ? v1 : v2
    const dearer  = v1.price_min < v2.price_min ? v2 : v1
    const diffLakh = (diff / 100000).toFixed(2).replace(/\.?0+$/, '')
    parts.push(
      `The ${cheaper.brandName} ${cheaper.modelName} starts ₹${diffLakh} lakh cheaper than the ${dearer.brandName} ${dearer.modelName}.`
    )
  }

  // Mileage
  const m1 = v1.specs?.mileage_arai, m2 = v2.specs?.mileage_arai
  if (m1 && m2 && m1 !== m2) {
    const better = m1 > m2 ? v1 : v2
    const worse  = m1 > m2 ? v2 : v1
    const bVal   = m1 > m2 ? m1 : m2
    const wVal   = m1 > m2 ? m2 : m1
    parts.push(
      `${better.brandName} ${better.modelName} delivers better mileage at ${bVal} km/l vs ${wVal} km/l in the ${worse.modelName}.`
    )
  }

  // Boot space
  const b1 = v1.specs?.boot_space_l, b2 = v2.specs?.boot_space_l
  if (b1 && b2 && b1 !== b2) {
    const bigger  = b1 > b2 ? v1 : v2
    const smaller = b1 > b2 ? v2 : v1
    const bVal    = b1 > b2 ? b1 : b2
    const sVal    = b1 > b2 ? b2 : b1
    parts.push(
      `${bigger.brandName} ${bigger.modelName} offers more boot space at ${bVal}L vs ${sVal}L in the ${smaller.modelName}.`
    )
  }

  // Power
  const p1 = v1.specs?.power_bhp, p2 = v2.specs?.power_bhp
  if (p1 && p2 && p1 !== p2) {
    const more = p1 > p2 ? v1 : v2
    const less = p1 > p2 ? v2 : v1
    const mVal = p1 > p2 ? p1 : p2
    const lVal = p1 > p2 ? p2 : p1
    parts.push(
      `On power, ${more.brandName} ${more.modelName} has the edge at ${mVal} bhp against ${lVal} bhp in the ${less.modelName}.`
    )
  }

  if (parts.length === 0) {
    return `Compare the ${v1.brandName} ${v1.modelName} and ${v2.brandName} ${v2.modelName} side by side — specs, prices and features are listed below.`
  }

  return parts.join(' ')
}

// ─── popular comparisons ──────────────────────────────────────────────────────

export const POPULAR_COMPARISONS: { label: string; slug: string }[] = [
  { label: 'Tata Punch vs Maruti Swift',              slug: 'tata-punch-vs-maruti-suzuki-swift' },
  { label: 'Hyundai Creta vs Kia Seltos',             slug: 'hyundai-creta-vs-kia-seltos' },
  { label: 'Royal Enfield Classic 350 vs Meteor 350', slug: 'royal-enfield-classic-350-vs-royal-enfield-meteor-350' },
  { label: 'Honda Activa vs TVS Jupiter',             slug: 'honda-activa-vs-tvs-jupiter' },
  { label: 'Ather 450X vs Ola S1 Pro',                slug: 'ather-450x-vs-ola-s1-pro' },
]
