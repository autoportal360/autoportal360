import type { OnRoadPrice } from '@/types'

// Format number as Indian Lakh
export function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

// Format price range
export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} – ${formatPrice(max)}`
}

// Calculate on-road price
export function calculateOnRoad(
  exShowroom: number,
  rtoPercentage: number,
  handlingCharge: number
): OnRoadPrice {
  const rto      = Math.round(exShowroom * rtoPercentage / 100)
  const insurance = Math.round(exShowroom * 0.035)
  const tcs      = exShowroom > 1000000 ? Math.round(exShowroom * 0.01) : 0
  const fastag   = 500
  const total    = exShowroom + rto + insurance + tcs + handlingCharge + fastag

  return { ex_showroom: exShowroom, rto, insurance, tcs, handling: handlingCharge, fastag, total }
}

// Convert model name to URL slug
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Build brand page URL
export function brandUrl(brandSlug: string, type: 'car' | 'bike' | 'scooter'): string {
  return `/${brandSlug}-${type}s/`
}

// Build model page URL
export function modelUrl(brandSlug: string, modelSlug: string, type: 'car' | 'bike' | 'scooter'): string {
  return `/${brandSlug}-${type}s/${modelSlug}/`
}