import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCanonicalUrl } from '@/lib/seo'
import CompareClient from '../CompareClient'

export const metadata: Metadata = {
  title: 'Compare Cars Side by Side | AutoPortal360',
  description: 'Compare any two or three cars side by side — price, specs, mileage, safety and features. Find the best car for you.',
  alternates: { canonical: getCanonicalUrl('/compare/cars/') },
  robots: 'index, follow',
}

export default async function CompareCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ v1?: string }>
}) {
  const { v1 } = await searchParams
  return (
    <Suspense>
      <CompareClient vehicleType="car" basePath="/compare/cars" initialCombinedSlug={v1} />
    </Suspense>
  )
}
