'use client'

import { useEffect } from 'react'

interface RecentItem {
  slug: string
  brand: string
  model: string
  price: string
  timestamp: number
}

const KEY = 'ap_recently_viewed'
const MAX = 10

export default function TrackRecentView({
  brand,
  model,
  price,
  slug,
}: {
  brand: string
  model: string
  price: string
  slug: string
}) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      const items: RecentItem[] = raw ? JSON.parse(raw) : []
      const filtered = items.filter(i => i.slug !== slug)
      const next = [{ slug, brand, model, price, timestamp: Date.now() }, ...filtered].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch { /* ignore storage errors */ }
  }, [slug, brand, model, price])

  return null
}
