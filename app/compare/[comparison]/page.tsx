import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCanonicalUrl } from '@/lib/seo'
import {
  loadVehiclesFromSlugs,
  buildComparisonPath,
  POPULAR_COMPARISONS,
} from '../compareUtils'
import ComparisonTable from '../ComparisonTable'

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ comparison: string }>
}): Promise<Metadata> {
  const { comparison } = await params
  const parts = comparison.split('-vs-')

  if (parts.length < 2) {
    return { title: 'Compare Vehicles | AutoPortal360' }
  }

  const vehicles = await loadVehiclesFromSlugs(parts)
  const filled = vehicles.filter(Boolean)

  if (filled.length < 2) {
    return { title: 'Compare Vehicles | AutoPortal360' }
  }

  const names = filled.map(v => `${v!.brandName} ${v!.modelName}`)
  const title = `${names.join(' vs ')} Comparison 2026 | AutoPortal360`
  const desc  = `Compare ${names.join(' vs ')} — ex-showroom price, specs, mileage, safety and features side by side.`
  const canonical = getCanonicalUrl(`/compare/${comparison}/`)

  return {
    title,
    description: desc,
    alternates: { canonical },
    robots: 'index, follow',
    openGraph: { title, description: desc, url: canonical },
  }
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ comparison: string }>
}) {
  const { comparison } = await params
  const parts = comparison.split('-vs-').slice(0, 3) // max 3

  if (parts.length < 2) notFound()

  const loaded = await loadVehiclesFromSlugs(parts)
  const vehicles = loaded.filter(Boolean) as NonNullable<(typeof loaded)[number]>[]

  if (vehicles.length < 2) notFound()

  const title = vehicles.map(v => `${v.brandName} ${v.modelName}`).join(' vs ')
  const currentPath = buildComparisonPath(vehicles)

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '28px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/compare" style={{ color: '#8E99A8', textDecoration: 'none' }}>Compare</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>{title}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 8px',
            lineHeight: 1.25,
          }}>
            {vehicles.map((v, i) => (
              <span key={v.modelId}>
                {i > 0 && <span style={{ color: '#8E99A8', fontSize: '0.7em', padding: '0 8px' }}>vs</span>}
                <span>{v.brandName} <span style={{ color: '#00D4FF' }}>{v.modelName}</span></span>
              </span>
            ))}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: '#8E99A8', margin: 0 }}>
              Side-by-side comparison — prices, specs, mileage &amp; features
            </p>
            <Link href="/compare" style={{
              fontSize: 11, fontWeight: 700, color: '#8E99A8',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '4px 12px', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              + Change vehicles
            </Link>
          </div>
        </div>

        {/* Vehicle thumbnails strip */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          background: 'rgba(0,212,255,0.03)',
          border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 14, padding: 16, flexWrap: 'wrap',
        }}>
          {vehicles.map((v, i) => (
            <div key={v.modelId} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px' }}>
              {i > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: '#8E99A8', marginRight: 4, flexShrink: 0 }}>VS</div>}
              <div style={{
                width: 80, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {v.thumbnail_url
                  ? <Image src={v.thumbnail_url} alt={v.modelName} fill style={{ objectFit: 'contain', padding: 4 }} sizes="80px" />
                  : <span style={{ fontSize: 28 }}>{v.vehicleType === 'car' ? '🚗' : v.vehicleType === 'bike' ? '🏍️' : '🛵'}</span>
                }
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8E99A8', marginBottom: 1 }}>{v.brandName}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>{v.modelName}</div>
                {v.price_min && (
                  <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v.price_min)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <ComparisonTable vehicles={vehicles} showSummary={true} />

        {/* Popular comparisons */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800,
            color: '#FFFFFF', margin: '0 0 14px',
          }}>
            Popular Comparisons
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_COMPARISONS.filter(c => c.slug !== comparison).map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}/`} style={{
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid rgba(0,212,255,0.14)',
                borderRadius: 8, padding: '8px 14px',
                textDecoration: 'none',
                fontSize: 13, color: '#C0C0C0',
                transition: 'border-color 0.15s',
              }}>
                {c.label}
              </Link>
            ))}
            <Link href="/compare" style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.22)',
              borderRadius: 8, padding: '8px 14px',
              textDecoration: 'none',
              fontSize: 13, color: '#00D4FF', fontWeight: 700,
            }}>
              Compare any vehicle →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
