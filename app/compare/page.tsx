import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCanonicalUrl } from '@/lib/seo'
import CompareClient from './CompareClient'

function parseVehicleParam(param: string): { modelSlug: string } | null {
  for (const suffix of ['-cars', '-bikes', '-scooters']) {
    const idx = param.lastIndexOf(suffix)
    if (idx !== -1 && idx + suffix.length < param.length) {
      return { modelSlug: param.slice(idx + suffix.length + 1) }
    }
  }
  return { modelSlug: param }
}

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string; v2?: string }>
}): Promise<Metadata> {
  const { v1, v2 } = await searchParams

  if (v1 && v2) {
    const p1 = parseVehicleParam(v1)
    const p2 = parseVehicleParam(v2)
    if (p1 && p2) {
      const n1 = slugToTitle(p1.modelSlug)
      const n2 = slugToTitle(p2.modelSlug)
      return {
        title: `${n1} vs ${n2} Comparison 2026 | AutoPortal360`,
        description: `Compare ${n1} vs ${n2} — specs, price, mileage and features side by side.`,
        alternates: { canonical: getCanonicalUrl('/compare') },
        robots: 'index, follow',
      }
    }
  }

  return {
    title: 'Compare Cars, Bikes & Scooters | AutoPortal360',
    description: 'Compare any two vehicles side by side — specs, prices, mileage and features. Cars, bikes and scooters.',
    alternates: { canonical: getCanonicalUrl('/compare') },
    robots: 'index, follow',
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string; v2?: string }>
}) {
  const { v1, v2 } = await searchParams
  return (
    <Suspense>
      <CompareClient initialV1={v1} initialV2={v2} />
    </Suspense>
  )
}
