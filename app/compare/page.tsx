import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCanonicalUrl } from '@/lib/seo'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Compare Cars, Bikes & Scooters | AutoPortal360',
  description: 'Compare any two or three vehicles side by side — specs, prices, mileage and features. Cars, bikes and scooters.',
  alternates: { canonical: getCanonicalUrl('/compare/') },
  robots: 'index, follow',
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string }>
}) {
  const { v1 } = await searchParams
  return (
    <Suspense>
      <CompareClient initialCombinedSlug={v1} />
    </Suspense>
  )
}
