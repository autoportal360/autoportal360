export type VehicleType = 'cars' | 'bikes' | 'scooters'

export interface Dealer {
  id: string
  name: string
  slug: string
  brand_slug: string
  brand_name: string
  city: string
  city_slug: string
  state: string
  address: string
  locality?: string | null
  pincode?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  google_maps_url?: string | null
  vehicle_types: VehicleType[]
  is_authorized: boolean
  is_active: boolean
  working_hours?: string | null
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface DealerFormData {
  name: string
  brand_slug: string
  brand_name: string
  city: string
  city_slug: string
  state: string
  address: string
  locality: string
  pincode: string
  phone: string
  email: string
  website: string
  google_maps_url: string
  vehicle_types: VehicleType[]
  is_authorized: boolean
  is_active: boolean
  working_hours: string
}

export const EMPTY_DEALER_FORM: DealerFormData = {
  name: '',
  brand_slug: '',
  brand_name: '',
  city: '',
  city_slug: '',
  state: '',
  address: '',
  locality: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  google_maps_url: '',
  vehicle_types: ['cars'],
  is_authorized: true,
  is_active: true,
  working_hours: 'Mon-Sat: 9 AM – 7 PM',
}

export interface DealerCitySummary {
  city: string
  city_slug: string
  state: string
  count: number
}

export interface DealerBrandSummary {
  brand_name: string
  brand_slug: string
  count: number
}

export interface DealerListResponse {
  dealers: Dealer[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
] as const

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
