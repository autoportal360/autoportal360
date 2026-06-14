export interface Brand {
  id: string
  name: string
  slug: string
  type: 'car' | 'bike' | 'scooter'
  logo_url: string | null
  tagline: string | null
  founded_year: number | null
  country: string | null
  price_min: number | null
  price_max: number | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Model {
  id: string
  brand_id: string
  name: string
  slug: string
  type: 'car' | 'bike' | 'scooter'
  body_type: string | null
  segment: string | null
  launch_year: number | null
  status: 'active' | 'discontinued' | 'upcoming'
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  meta_title: string | null
  meta_description: string | null
  overview_html: string | null
  created_at: string
  brand?: Brand
}

export interface Variant {
  id: string
  model_id: string
  name: string
  slug: string
  fuel_type: string | null
  transmission: string | null
  ex_showroom_price: number
  is_popular: boolean
  sort_order: number
  created_at: string
  specs?: Spec
}

export interface Spec {
  id: string
  variant_id: string
  engine_cc: number | null
  power_bhp: number | null
  torque_nm: number | null
  mileage_arai: number | null
  fuel_tank_l: number | null
  seating: number | null
  boot_space_l: number | null
  ground_clearance_mm: number | null
  length_mm: number | null
  width_mm: number | null
  height_mm: number | null
  wheelbase_mm: number | null
  kerb_weight_kg: number | null
  tyre_size: string | null
  ncap_rating: string | null
  airbags: number | null
  abs: boolean | null
  front_suspension: string | null
  rear_suspension: string | null
  front_brake: string | null
  rear_brake: string | null
}

export interface State {
  id: string
  name: string
  slug: string
  rto_percentage: number
  handling_charge: number
}

export interface City {
  id: string
  name: string
  slug: string
  state_id: string
  is_featured: boolean
  state?: State
}

export interface Lead {
  id?: string
  name: string
  phone: string
  email: string
  city: string
  model_slug: string
  source_url?: string
}

export type { Dealer, VehicleType, DealerFormData, DealerCitySummary, DealerBrandSummary } from './dealer'

// Helper type for on-road price calculation
export interface OnRoadPrice {
  ex_showroom: number
  rto: number
  insurance: number
  tcs: number
  handling: number
  fastag: number
  total: number
}