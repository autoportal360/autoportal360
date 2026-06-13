import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCanonicalUrl } from '@/lib/seo'
import CompareClient from '../CompareClient'

export const metadata: Metadata = {
  title: 'Compare Bikes Side by Side | AutoPortal360',
  description: 'Compare any two or three bikes side by side — price, specs, mileage and features. Find the best bike for you.',
  alternates: { canonical: getCanonicalUrl('/compare/bikes/') },
  robots: 'index, follow',
}

export default async function CompareBikesPage({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string }>
}) {
  const { v1 } = await searchParams
  return (
    <Suspense>
      <CompareClient vehicleType="bike" basePath="/compare/bikes" initialCombinedSlug={v1} />
    </Suspense>
  )
}
