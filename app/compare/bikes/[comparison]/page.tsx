import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import { loadVehiclesFromSlugs } from '../../compareUtils'
import ComparisonPageContent from '../../ComparisonPageContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ comparison: string }>
}): Promise<Metadata> {
  const { comparison } = await params
  const parts = comparison.split('-vs-')
  const vehicles = await loadVehiclesFromSlugs(parts)
  const filled = vehicles.filter(Boolean)
  if (filled.length < 2) return { title: 'Compare Bikes | AutoPortal360' }

  const names = filled.map(v => `${v!.brandName} ${v!.modelName}`)
  const title = `${names.join(' vs ')} Bike Comparison 2026 | AutoPortal360`
  const desc  = `Compare ${names.join(' vs ')} — ex-showroom price, specs, mileage and features side by side.`
  const canonical = getCanonicalUrl(`/compare/bikes/${comparison}/`)
  return { title, description: desc, alternates: { canonical }, robots: 'index, follow' }
}

export default async function BikesComparisonPage({
  params,
}: {
  params: Promise<{ comparison: string }>
}) {
  const { comparison } = await params
  return (
    <ComparisonPageContent
      comparison={comparison}
      basePath="/compare/bikes"
      vehicleType="bike"
    />
  )
}
