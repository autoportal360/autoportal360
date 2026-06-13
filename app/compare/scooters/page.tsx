import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCanonicalUrl } from '@/lib/seo'
import CompareClient from '../CompareClient'

export const metadata: Metadata = {
  title: 'Compare Scooters Side by Side | AutoPortal360',
  description: 'Compare any two or three scooters side by side — price, specs, mileage and features. Find the best scooter for you.',
  alternates: { canonical: getCanonicalUrl('/compare/scooters/') },
  robots: 'index, follow',
}

export default async function CompareScootersPage({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string }>
}) {
  const { v1 } = await searchParams
  return (
    <Suspense>
      <CompareClient vehicleType="scooter" basePath="/compare/scooters" initialCombinedSlug={v1} />
    </Suspense>
  )
}
