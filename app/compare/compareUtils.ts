import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { Spec } from '@/types'

// ─── types ────────────────────────────────────────────────────────────────────

export type VehicleType = 'car' | 'bike' | 'scooter'

export type LoadedVehicle = {
  modelId: string
  modelName: string
  modelSlug: string
  brandSlug: string
  brandPageSlug: string
  brandName: string
  vehicleType: VehicleType
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  selectedVariantSlug: string | null   // set when user picks a specific variant
  popularVariant: {                    // the selected OR popular variant's data
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
  higher?: boolean
  isPrice?: boolean
  unit?: string
}

// ─── slug helpers ─────────────────────────────────────────────────────────────

export function getBrandPageSlug(dbSlug: string, type: VehicleType): string {
  if (type === 'car')    return `${dbSlug}-cars`
  if (type === 'bike')   return `${dbSlug.replace(/-bike$/, '')}-bikes`
  return `${dbSlug.replace(/-scooter$/, '')}-scooters`
}

export function getCombinedSlug(brandSlug: string, modelSlug: string): string {
  return `${brandSlug}-${modelSlug}`
}

export function variantToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function buildComparisonPath(vehicles: (LoadedVehicle | null)[]): string {
  const filled = vehicles.filter(Boolean) as LoadedVehicle[]
  if (filled.length < 2) return '/compare'
  const slugs = filled.map(v => getCombinedSlug(v.brandSlug, v.modelSlug))
  return `/compare/${slugs.join('-vs-')}/`
}

// Builds type-specific path, including variant slug when the user picked one
export function buildTypedComparisonPath(basePath: string, vehicles: (LoadedVehicle | null)[]): string {
  const filled = vehicles.filter(Boolean) as LoadedVehicle[]
  if (filled.length < 2) return basePath
  const slugs = filled.map(v => {
    const base = getCombinedSlug(v.brandSlug, v.modelSlug)
    return v.selectedVariantSlug ? `${base}-${v.selectedVariantSlug}` : base
  })
  return `${basePath}/${slugs.join('-vs-')}/`
}

export function getComparePath(vehicleType: VehicleType): string {
  if (vehicleType === 'car')  return '/compare/cars'
  if (vehicleType === 'bike') return '/compare/bikes'
  return '/compare/scooters'
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

// Enrich a raw model row into a LoadedVehicle.
// If targetVariantSlug is given, loads specs for that variant instead of popular.
async function enrichModel(row: RawModel, targetVariantSlug?: string | null): Promise<LoadedVehicle> {
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

  // Use target variant if requested, fall back to popular
  let selected = popular
  if (targetVariantSlug) {
    const matched = all.find(v => variantToSlug(v.name) === targetVariantSlug)
    if (matched) selected = matched
  }

  let specs: Spec | null = null
  if (selected) {
    const { data } = await supabase.from('specs').select('*').eq('variant_id', selected.id).single()
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
    selectedVariantSlug: targetVariantSlug ?? null,
    popularVariant: selected
      ? { name: selected.name, ex_showroom_price: selected.ex_showroom_price, fuel_type: selected.fuel_type, transmission: selected.transmission }
      : null,
    topVariant: top ? { name: top.name, ex_showroom_price: top.ex_showroom_price } : null,
    specs,
  }
}

// Load vehicles from SEO slugs. Supports:
//   'tata-punch'                        → exact model match, popular variant
//   'tata-punch-accomplished-mt'        → prefix match 'tata-punch', variant 'accomplished-mt'
export async function loadVehiclesFromSlugs(combinedSlugs: string[]): Promise<(LoadedVehicle | null)[]> {
  const { data: allModels } = await supabase
    .from('models')
    .select('id, name, slug, price_min, price_max, thumbnail_url, brands!inner(id, name, slug, type)')
    .neq('status', 'discontinued')

  if (!allModels) return combinedSlugs.map(() => null)

  const rows = allModels as unknown as RawModel[]

  // Sort longest combined-slug first so greedy prefix matching works correctly
  const sortedRows = [...rows].sort((a, b) =>
    (`${b.brands.slug}-${b.slug}`).length - (`${a.brands.slug}-${a.slug}`).length
  )

  const results = await Promise.all(
    combinedSlugs.map(async combined => {
      // 1. Exact model match
      let row = rows.find(m => `${m.brands.slug}-${m.slug}` === combined)
      let variantSlug: string | null = null

      // 2. Prefix match: brand-model-<variant-slug>
      if (!row) {
        for (const r of sortedRows) {
          const prefix = `${r.brands.slug}-${r.slug}-`
          if (combined.startsWith(prefix)) {
            row = r
            variantSlug = combined.slice(prefix.length) || null
            break
          }
        }
      }

      if (!row) return null
      return enrichModel(row, variantSlug)
    })
  )

  return results
}

// Load a single vehicle by brand slug + model slug (used in CompareClient after brand/model selection)
export async function loadVehicleByBrandModel(
  brandSlug: string,
  modelSlug: string,
): Promise<LoadedVehicle | null> {
  const { data: rows } = await supabase
    .from('models')
    .select('id, name, slug, price_min, price_max, thumbnail_url, brands!inner(id, name, slug, type)')
    .eq('slug', modelSlug)
    .neq('status', 'discontinued')

  if (!rows?.length) return null
  const rows2 = rows as unknown as RawModel[]
  const row   = rows2.find(r => r.brands.slug === brandSlug) ?? rows2[0]
  return enrichModel(row)
}

// ─── spec rows ────────────────────────────────────────────────────────────────

export const SPEC_ROWS: SpecRow[] = [
  { section: 'Pricing',              label: 'Starting Price',         isPrice: true, higher: false, value: v => v.price_min },
  {                                   label: 'Top Variant Price',      isPrice: true, higher: false, value: v => v.price_max },
  {                                   label: 'Selected Variant Price', isPrice: true, higher: false, value: v => v.popularVariant?.ex_showroom_price ?? null },
  { section: 'Engine & Performance', label: 'Engine Displacement',     unit: ' cc',                  value: v => v.specs?.engine_cc ?? null },
  {                                   label: 'Max Power',               unit: ' bhp', higher: true,   value: v => v.specs?.power_bhp ?? null },
  {                                   label: 'Max Torque',              unit: ' Nm',  higher: true,   value: v => v.specs?.torque_nm ?? null },
  {                                   label: 'Mileage (ARAI)',          unit: ' km/l',higher: true,   value: v => v.specs?.mileage_arai ?? null },
  {                                   label: 'Fuel Type',                                             value: v => v.popularVariant?.fuel_type ?? null },
  {                                   label: 'Transmission',                                          value: v => v.popularVariant?.transmission ?? null },
  { section: 'Dimensions',           label: 'Length',                  unit: ' mm',                  value: v => v.specs?.length_mm ?? null },
  {                                   label: 'Width',                   unit: ' mm',                  value: v => v.specs?.width_mm ?? null },
  {                                   label: 'Height',                  unit: ' mm',                  value: v => v.specs?.height_mm ?? null },
  {                                   label: 'Wheelbase',               unit: ' mm',                  value: v => v.specs?.wheelbase_mm ?? null },
  {                                   label: 'Ground Clearance',        unit: ' mm', higher: true,    value: v => v.specs?.ground_clearance_mm ?? null },
  {                                   label: 'Kerb Weight',             unit: ' kg', higher: false,   value: v => v.specs?.kerb_weight_kg ?? null },
  { section: 'Capacity & Features',  label: 'Seating Capacity',        unit: ' seats',               value: v => v.specs?.seating ?? null },
  {                                   label: 'Boot Space',              unit: ' L',  higher: true,    value: v => v.specs?.boot_space_l ?? null },
  {                                   label: 'Fuel Tank Capacity',      unit: ' L',  higher: true,    value: v => v.specs?.fuel_tank_l ?? null },
  {                                   label: 'Tyre Size',                                             value: v => v.specs?.tyre_size ?? null },
  { section: 'Safety',               label: 'NCAP Safety Rating',      unit: '/5',  higher: true,    value: v => v.specs?.ncap_rating ?? null },
  {                                   label: 'Airbags',                 unit: ' airbags', higher: true, value: v => v.specs?.airbags ?? null },
  {                                   label: 'ABS',                                                   value: v => v.specs?.abs != null ? (v.specs.abs ? 'Yes' : 'No') : null },
  { section: 'Suspension & Brakes',  label: 'Front Suspension',                                      value: v => v.specs?.front_suspension ?? null },
  {                                   label: 'Rear Suspension',                                       value: v => v.specs?.rear_suspension ?? null },
  {                                   label: 'Front Brake',                                           value: v => v.specs?.front_brake ?? null },
  {                                   label: 'Rear Brake',                                            value: v => v.specs?.rear_brake ?? null },
]

// ─── comparison summary (top of table) ───────────────────────────────────────

export function generateComparisonSummary(vehicles: LoadedVehicle[]): string {
  if (vehicles.length < 2) return ''
  const [v1, v2] = vehicles
  const parts: string[] = []

  if (v1.price_min && v2.price_min && v1.price_min !== v2.price_min) {
    const diff = Math.abs(v1.price_min - v2.price_min)
    const cheaper = v1.price_min < v2.price_min ? v1 : v2
    const dearer  = v1.price_min < v2.price_min ? v2 : v1
    const diffLakh = (diff / 100000).toFixed(2).replace(/\.?0+$/, '')
    parts.push(`The ${cheaper.brandName} ${cheaper.modelName} starts ₹${diffLakh} lakh cheaper than the ${dearer.brandName} ${dearer.modelName}.`)
  }

  const m1 = v1.specs?.mileage_arai, m2 = v2.specs?.mileage_arai
  if (m1 && m2 && m1 !== m2) {
    const better = m1 > m2 ? v1 : v2
    const worse  = m1 > m2 ? v2 : v1
    parts.push(`${better.brandName} ${better.modelName} delivers better mileage at ${m1 > m2 ? m1 : m2} km/l vs ${m1 > m2 ? m2 : m1} km/l in the ${worse.modelName}.`)
  }

  const b1 = v1.specs?.boot_space_l, b2 = v2.specs?.boot_space_l
  if (b1 && b2 && b1 !== b2) {
    const bigger  = b1 > b2 ? v1 : v2
    const smaller = b1 > b2 ? v2 : v1
    parts.push(`${bigger.brandName} ${bigger.modelName} offers more boot space at ${b1 > b2 ? b1 : b2}L vs ${b1 > b2 ? b2 : b1}L in the ${smaller.modelName}.`)
  }

  const p1 = v1.specs?.power_bhp, p2 = v2.specs?.power_bhp
  if (p1 && p2 && p1 !== p2) {
    const more = p1 > p2 ? v1 : v2
    const less = p1 > p2 ? v2 : v1
    parts.push(`On power, ${more.brandName} ${more.modelName} leads at ${p1 > p2 ? p1 : p2} bhp vs ${p1 > p2 ? p2 : p1} bhp in the ${less.modelName}.`)
  }

  if (parts.length === 0) {
    return `Compare the ${v1.brandName} ${v1.modelName} and ${v2.brandName} ${v2.modelName} side by side — specs, prices and features listed below.`
  }
  return parts.join(' ')
}

// ─── auto FAQ generation ──────────────────────────────────────────────────────

export function generateFAQs(vehicles: LoadedVehicle[]): { question: string; answer: string }[] {
  if (vehicles.length < 2) return []
  const [v1, v2] = vehicles
  const n1 = `${v1.brandName} ${v1.modelName}`
  const n2 = `${v2.brandName} ${v2.modelName}`
  const faqs: { question: string; answer: string }[] = []

  // Q1 — Which is better?
  const betterParts: string[] = []
  const m1 = v1.specs?.mileage_arai, m2 = v2.specs?.mileage_arai
  if (m1 && m2 && m1 !== m2) {
    const better = m1 > m2 ? v1 : v2
    betterParts.push(`${better.brandName} ${better.modelName} leads on mileage with ${m1 > m2 ? m1 : m2} km/l vs ${m1 > m2 ? m2 : m1} km/l.`)
  }
  const b1 = v1.specs?.boot_space_l, b2 = v2.specs?.boot_space_l
  if (b1 && b2 && b1 !== b2) {
    const bigger = b1 > b2 ? v1 : v2
    betterParts.push(`${bigger.brandName} ${bigger.modelName} wins on boot space with ${b1 > b2 ? b1 : b2}L vs ${b1 > b2 ? b2 : b1}L.`)
  }
  if (v1.price_min && v2.price_min && v1.price_min !== v2.price_min) {
    const cheaper = v1.price_min < v2.price_min ? v1 : v2
    betterParts.push(`${cheaper.brandName} ${cheaper.modelName} is more affordable starting at ${formatPrice(cheaper.price_min!)}.`)
  }
  faqs.push({
    question: `Which is better — ${n1} or ${n2}?`,
    answer: betterParts.length > 0
      ? betterParts.join(' ')
      : `Both are strong contenders. Check the full comparison table above to find which suits your priorities best.`,
  })

  // Q2 — Price difference
  if (v1.price_min && v2.price_min) {
    const diff = Math.abs(v1.price_min - v2.price_min)
    const diffLakh = (diff / 100000).toFixed(2).replace(/\.?0+$/, '')
    const cheaper = v1.price_min < v2.price_min ? v1 : v2
    const dearer  = v1.price_min < v2.price_min ? v2 : v1
    faqs.push({
      question: `What is the price difference between ${n1} and ${n2}?`,
      answer: `${n1} starts at ${formatPrice(v1.price_min)} while ${n2} starts at ${formatPrice(v2.price_min)}. The ${cheaper.brandName} ${cheaper.modelName} is ₹${diffLakh} lakh cheaper than the ${dearer.brandName} ${dearer.modelName}.`,
    })
  }

  // Q3 — Mileage
  if (m1 || m2) {
    let answer: string
    if (m1 && m2) {
      const better = m1 > m2 ? v1 : v2
      const worse  = m1 > m2 ? v2 : v1
      answer = `${better.brandName} ${better.modelName} delivers better fuel efficiency at ${m1 > m2 ? m1 : m2} km/l (ARAI) compared to ${m1 > m2 ? m2 : m1} km/l in the ${worse.brandName} ${worse.modelName}.`
    } else {
      const known = m1 ? v1 : v2
      answer = `${known.brandName} ${known.modelName} has an ARAI mileage of ${m1 ?? m2} km/l. Mileage data for the other vehicle is not yet available.`
    }
    faqs.push({ question: `Which has better mileage — ${n1} or ${n2}?`, answer })
  }

  // Q4 — Safety / NCAP
  const ncap1 = v1.specs?.ncap_rating, ncap2 = v2.specs?.ncap_rating
  {
    let answer: string
    if (ncap1 && ncap2) {
      if (ncap1 === ncap2) {
        answer = `Both ${n1} and ${n2} carry a ${ncap1}-star Global NCAP safety rating.`
      } else {
        const safer = ncap1 >= ncap2 ? v1 : v2
        const less  = ncap1 >= ncap2 ? v2 : v1
        answer = `${safer.brandName} ${safer.modelName} scores higher with ${ncap1 >= ncap2 ? ncap1 : ncap2}-star NCAP vs ${ncap1 >= ncap2 ? ncap2 : ncap1}-star for the ${less.brandName} ${less.modelName}.`
      }
    } else if (ncap1 || ncap2) {
      const known = ncap1 ? v1 : v2
      answer = `${known.brandName} ${known.modelName} has a ${ncap1 ?? ncap2}-star Global NCAP rating. Crash-test data for the other vehicle is not yet available.`
    } else {
      answer = `Global NCAP ratings are not yet available for these vehicles. Check the safety section above for airbag count and ABS fitment.`
    }
    faqs.push({ question: `Which is safer — ${n1} or ${n2}?`, answer })
  }

  // Q5 — Which to buy
  const buyParts: string[] = []
  if (v1.price_min && v2.price_min && v1.price_min !== v2.price_min) {
    const cheaper = v1.price_min < v2.price_min ? v1 : v2
    buyParts.push(`If budget matters most, the ${cheaper.brandName} ${cheaper.modelName} is the more affordable pick.`)
  }
  if (m1 && m2 && m1 !== m2) {
    const better = m1 > m2 ? v1 : v2
    buyParts.push(`For long-distance economy, the ${better.brandName} ${better.modelName} wins on mileage.`)
  }
  if (b1 && b2 && b1 !== b2) {
    const bigger = b1 > b2 ? v1 : v2
    buyParts.push(`If you need cargo room, the ${bigger.brandName} ${bigger.modelName} has more boot space at ${b1 > b2 ? b1 : b2}L.`)
  }
  faqs.push({
    question: `Which should I buy — ${n1} or ${n2}?`,
    answer: buyParts.length > 0
      ? buyParts.join(' ') + ' Test drive both and compare on-road prices in your city before deciding.'
      : `The best choice depends on your priorities — budget, mileage, space or features. Test drive both models and compare on-road prices in your city before deciding.`,
  })

  return faqs
}

// ─── popular comparisons ──────────────────────────────────────────────────────

export type PopularComparison = { label: string; slug: string }

export const POPULAR_COMPARISONS_BY_TYPE: Record<VehicleType, PopularComparison[]> = {
  car: [
    { label: 'Tata Punch vs Maruti Swift',        slug: 'tata-punch-vs-maruti-suzuki-swift' },
    { label: 'Hyundai Creta vs Kia Seltos',       slug: 'hyundai-creta-vs-kia-seltos' },
    { label: 'Tata Nexon vs Hyundai Venue',       slug: 'tata-nexon-vs-hyundai-venue' },
    { label: 'Mahindra XUV700 vs Tata Harrier',   slug: 'mahindra-xuv700-vs-tata-harrier' },
    { label: 'Maruti Brezza vs Hyundai Venue',    slug: 'maruti-suzuki-brezza-vs-hyundai-venue' },
    { label: 'Maruti Baleno vs Hyundai i20',      slug: 'maruti-suzuki-baleno-vs-hyundai-i20' },
  ],
  bike: [
    { label: 'RE Classic 350 vs Meteor 350',       slug: 'royal-enfield-classic-350-vs-royal-enfield-meteor-350' },
    { label: 'KTM Duke 390 vs Bajaj Dominar 400',  slug: 'ktm-duke-390-vs-bajaj-dominar-400' },
    { label: 'Hero Splendor Plus vs Honda Shine',  slug: 'hero-splendor-plus-vs-honda-cb-shine' },
    { label: 'Bajaj Pulsar NS200 vs Yamaha MT-15', slug: 'bajaj-pulsar-ns200-vs-yamaha-mt-15-v2' },
    { label: 'KTM Duke 200 vs Yamaha R15 V4',      slug: 'ktm-duke-200-vs-yamaha-r15-v4' },
    { label: 'Hero HF Deluxe vs Bajaj Pulsar 150', slug: 'hero-hf-deluxe-vs-bajaj-pulsar-150' },
  ],
  scooter: [
    { label: 'Honda Activa 6G vs TVS Jupiter',     slug: 'honda-activa-vs-tvs-jupiter' },
    { label: 'Ather 450X vs Ola S1 Pro',           slug: 'ather-450x-vs-ola-s1-pro' },
    { label: 'TVS NTorq 125 vs Honda Activa 125',  slug: 'tvs-ntorq-125-vs-honda-activa-125' },
    { label: 'Ather 450X vs TVS iQube Electric',   slug: 'ather-450x-vs-tvs-iqube-electric' },
    { label: 'Yamaha Fascino 125 vs Honda Dio',    slug: 'yamaha-fascino-125-vs-honda-dio' },
    { label: 'Ola S1 Air vs TVS iQube Electric',   slug: 'ola-s1-air-vs-tvs-iqube-electric' },
  ],
}

export const POPULAR_COMPARISONS: PopularComparison[] = [
  ...POPULAR_COMPARISONS_BY_TYPE.car,
  ...POPULAR_COMPARISONS_BY_TYPE.bike,
  ...POPULAR_COMPARISONS_BY_TYPE.scooter,
]

// ─── landing-page preview loader ──────────────────────────────────────────────

export type ComparisonPreview = {
  modelId: string
  modelName: string
  brandName: string
  brandSlug: string
  modelSlug: string
  brandPageSlug: string
  thumbnail_url: string | null
  price_min: number | null
  mileage_arai: number | null
}

export type PopularComparisonData = {
  label: string
  slug: string
  v1: ComparisonPreview | null
  v2: ComparisonPreview | null
}

export async function loadPopularPreviews(
  comparisons: PopularComparison[]
): Promise<PopularComparisonData[]> {
  if (!comparisons.length) return []

  const allParts = comparisons.flatMap(c => c.slug.split('-vs-').slice(0, 2))
  const uniqueParts = [...new Set(allParts)]

  const { data: allModels } = await supabase
    .from('models')
    .select('id, name, slug, price_min, thumbnail_url, brands!inner(name, slug, type)')
    .neq('status', 'discontinued')

  if (!allModels) return comparisons.map(c => ({ ...c, v1: null, v2: null }))

  type RM = { id: string; name: string; slug: string; price_min: number | null; thumbnail_url: string | null; brands: { name: string; slug: string; type: string } }
  const rows = allModels as unknown as RM[]

  const lookup = new Map<string, RM>()
  for (const m of rows) {
    const combined = `${m.brands.slug}-${m.slug}`
    if (uniqueParts.includes(combined) && !lookup.has(combined)) {
      lookup.set(combined, m)
    }
  }

  const matchedModelIds = [...new Set([...lookup.values()].map(m => m.id))]
  if (!matchedModelIds.length) return comparisons.map(c => ({ ...c, v1: null, v2: null }))

  const { data: variants } = await supabase
    .from('variants')
    .select('id, model_id, is_popular, sort_order')
    .in('model_id', matchedModelIds)
    .order('sort_order')

  const popularByModel = new Map<string, string>()
  for (const modelId of matchedModelIds) {
    const mv = (variants ?? []).filter(v => v.model_id === modelId)
    const pop = mv.find(v => v.is_popular) ?? mv[0]
    if (pop) popularByModel.set(modelId, pop.id)
  }

  const variantIds = [...popularByModel.values()]
  const mileageMap = new Map<string, number | null>()
  if (variantIds.length) {
    const { data: specs } = await supabase
      .from('specs')
      .select('variant_id, mileage_arai')
      .in('variant_id', variantIds)
    for (const s of specs ?? []) mileageMap.set(s.variant_id, s.mileage_arai)
  }

  function makePreview(combinedSlug: string): ComparisonPreview | null {
    const m = lookup.get(combinedSlug)
    if (!m) return null
    const vid = popularByModel.get(m.id)
    return {
      modelId:       m.id,
      modelName:     m.name,
      brandName:     m.brands.name,
      brandSlug:     m.brands.slug,
      modelSlug:     m.slug,
      brandPageSlug: getBrandPageSlug(m.brands.slug, m.brands.type as VehicleType),
      thumbnail_url: m.thumbnail_url,
      price_min:     m.price_min,
      mileage_arai:  vid ? (mileageMap.get(vid) ?? null) : null,
    }
  }

  return comparisons.map(c => {
    const [p1, p2] = c.slug.split('-vs-')
    return { label: c.label, slug: c.slug, v1: makePreview(p1), v2: makePreview(p2) }
  })
}

// ─── model counts by vehicle type ─────────────────────────────────────────────

export async function getVehicleTypeCounts(): Promise<Record<VehicleType, number>> {
  const { data: brands } = await supabase
    .from('brands').select('id, type').eq('is_active', true)
  if (!brands) return { car: 0, bike: 0, scooter: 0 }

  const ids = (type: VehicleType) => brands.filter(b => b.type === type).map(b => b.id)
  const [cr, br, sr] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact', head: true }).in('brand_id', ids('car')).neq('status', 'discontinued'),
    supabase.from('models').select('*', { count: 'exact', head: true }).in('brand_id', ids('bike')).neq('status', 'discontinued'),
    supabase.from('models').select('*', { count: 'exact', head: true }).in('brand_id', ids('scooter')).neq('status', 'discontinued'),
  ])
  return { car: cr.count ?? 0, bike: br.count ?? 0, scooter: sr.count ?? 0 }
}
