'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

type SimilarModel = {
  id: string
  name: string
  slug: string
  thumbnail_url: string | null
  price_min: number | null
}

const FALLBACKS: SimilarModel[] = [
  { id: 'f1', name: 'Tata Nexon',    slug: 'nexon',   thumbnail_url: null, price_min: 800000  },
  { id: 'f2', name: 'Maruti Swift',  slug: 'swift',   thumbnail_url: null, price_min: 650000  },
  { id: 'f3', name: 'Hyundai i20',   slug: 'i20',     thumbnail_url: null, price_min: 700000  },
  { id: 'f4', name: 'Honda City',    slug: 'city',    thumbnail_url: null, price_min: 1100000 },
]

export default function SimilarCars({
  brandSlug,
  currentModelId,
  vehicleType = 'car',
}: {
  brandSlug: string
  currentModelId: string
  vehicleType?: string
}) {
  const [models, setModels] = useState<SimilarModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const brandName = brandSlug
        .replace(/-cars$/, '').replace(/-bikes$/, '').replace(/-scooters$/, '')

      const { data: brand } = await supabase
        .from('brands').select('id').eq('slug', brandName).maybeSingle()

      if (brand) {
        const { data } = await supabase
          .from('models')
          .select('id, name, slug, thumbnail_url, price_min')
          .eq('brand_id', brand.id)
          .neq('id', currentModelId)
          .neq('status', 'discontinued')
          .order('price_min', { ascending: true })
          .limit(6)

        if (data && data.length > 0) {
          setModels(data as SimilarModel[])
          setLoading(false)
          return
        }
      }
      setModels(FALLBACKS)
      setLoading(false)
    }
    load()
  }, [brandSlug, currentModelId])

  const emoji = vehicleType === 'bike' ? '🏍️' : vehicleType === 'scooter' ? '🛵' : '🚗'

  if (loading) {
    return (
      <div className="ap-similar-scroll">
        {[1, 2, 3].map(i => (
          <div key={i} className="ap-similar-card" style={{ opacity: 0.4 }}>
            <div className="ap-similar-img">{emoji}</div>
            <div className="ap-similar-body">
              <div style={{ background: '#1e3a6e', borderRadius: '4px', height: '14px', width: '70%', marginBottom: '8px' }} />
              <div style={{ background: '#1e3a6e', borderRadius: '4px', height: '12px', width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (models.length === 0) return null

  return (
    <div className="ap-similar-scroll">
      {models.map(model => (
        <Link key={model.id} href={`/${brandSlug}/${model.slug}/`} className="ap-similar-card">
          <div className="ap-similar-img">
            {model.thumbnail_url
              ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={model.thumbnail_url} alt={model.name} loading="lazy" />
              )
              : emoji
            }
          </div>
          <div className="ap-similar-body">
            <div className="ap-similar-name">{model.name}</div>
            {model.price_min && (
              <div className="ap-similar-price">From {formatPrice(model.price_min)}</div>
            )}
            <div className="ap-similar-label">ex-showroom India</div>
          </div>
          <div className="ap-similar-cta">View Details →</div>
        </Link>
      ))}
    </div>
  )
}
