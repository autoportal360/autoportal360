import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCanonicalUrl } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Sitemap | AutoPortal360',
  description: 'Complete sitemap of AutoPortal360 — browse all car, bike and scooter pages.',
  robots: 'noindex, follow',
  alternates: { canonical: getCanonicalUrl('/sitemap') },
}

// ─── types ────────────────────────────────────────────────────────────────────

type BrandRow = { name: string; slug: string; type: 'car' | 'bike' | 'scooter' }
type ModelRow = {
  name: string
  slug: string
  brands: { name: string; slug: string; type: string } | null
}
type BlogRow = { title: string; slug: string }

// ─── helpers ──────────────────────────────────────────────────────────────────

function brandPageSlug(dbSlug: string, type: 'car' | 'bike' | 'scooter'): string {
  if (type === 'car')    return `${dbSlug}-cars`
  if (type === 'bike')   return `${dbSlug.replace(/-bike$/, '')}-bikes`
  return `${dbSlug.replace(/-scooter$/, '')}-scooters`
}

function toTitleCase(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── style tokens ─────────────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '13px', fontWeight: 800, color: '#00D4FF',
  textTransform: 'uppercase', letterSpacing: '1.2px',
  margin: '0 0 14px', paddingBottom: '8px',
  borderBottom: '1px solid rgba(0,212,255,0.15)',
}

const subHeading: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, color: '#C0C0C0',
  margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px',
}

const linkStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: '#8E99A8',
  textDecoration: 'none', marginBottom: '4px', lineHeight: 1.5,
}

const card: React.CSSProperties = {
  background: '#0A1F44',
  border: '1px solid rgba(0,212,255,0.08)',
  borderRadius: '12px', padding: '20px 24px',
}

// ─── main page ────────────────────────────────────────────────────────────────

export default async function SitemapPage() {
  const [brandsRes, modelsRes, blogsRes] = await Promise.all([
    supabase.from('brands').select('name, slug, type').eq('is_active', true).order('name'),
    supabase
      .from('models')
      .select('name, slug, brands!inner(name, slug, type)')
      .neq('status', 'discontinued')
      .order('name'),
    supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50),
  ])

  const brands  = (brandsRes.data  ?? []) as BrandRow[]
  const models  = (modelsRes.data  ?? []) as unknown as ModelRow[]
  const blogs   = (blogsRes.data   ?? []) as BlogRow[]

  const carBrands     = brands.filter(b => b.type === 'car')
  const bikeBrands    = brands.filter(b => b.type === 'bike')
  const scooterBrands = brands.filter(b => b.type === 'scooter')

  // Group models by brand slug
  type BrandGroup = { brandName: string; pageSlug: string; models: { name: string; slug: string }[] }
  const carGroups     = new Map<string, BrandGroup>()
  const bikeGroups    = new Map<string, BrandGroup>()
  const scooterGroups = new Map<string, BrandGroup>()

  for (const model of models) {
    const brand = model.brands
    if (!brand) continue
    const type = brand.type as 'car' | 'bike' | 'scooter'
    const pSlug = brandPageSlug(brand.slug, type)
    const map = type === 'car' ? carGroups : type === 'bike' ? bikeGroups : scooterGroups

    if (!map.has(brand.slug)) {
      map.set(brand.slug, { brandName: brand.name, pageSlug: pSlug, models: [] })
    }
    map.get(brand.slug)!.models.push({ name: model.name, slug: model.slug })
  }

  const MAIN_PAGES = [
    { label: 'Home',            href: '/' },
    { label: 'New Cars',        href: '/new-cars/' },
    { label: 'New Bikes',       href: '/new-bikes/' },
    { label: 'New Scooters',    href: '/new-scooters/' },
    { label: 'Compare Vehicles',href: '/compare/' },
    { label: 'News & Reviews',  href: '/news/' },
    { label: 'About Us',        href: '/about/' },
    { label: 'Contact',         href: '/contact/' },
  ]

  return (
    <div style={{
      background: '#06142D', minHeight: '100vh',
      padding: '48px 24px 72px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
            color: '#FFFFFF', margin: '0 0 8px',
          }}>
            Sitemap <span style={{ color: '#00D4FF' }}>— AutoPortal360</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#8E99A8', margin: 0 }}>
            Complete directory of all pages
          </p>
        </div>

        {/* ── Main Pages ── */}
        <div style={{ ...card, marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Main Pages</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '4px 16px',
          }}>
            {MAIN_PAGES.map(p => (
              <Link key={p.href} href={p.href} style={linkStyle}
                className="sitemap-link">
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Vehicle Sections Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>

          {/* Car Brands */}
          <div style={card}>
            <h2 style={sectionHeading}>All Car Brands ({carBrands.length})</h2>
            <div style={{ columns: '2', columnGap: '16px' }}>
              {carBrands.map(b => {
                const pSlug = brandPageSlug(b.slug, 'car')
                return (
                  <Link key={b.slug} href={`/${pSlug}/`} style={linkStyle}>
                    {b.name} Cars
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Bike Brands */}
          <div style={card}>
            <h2 style={sectionHeading}>All Bike Brands ({bikeBrands.length})</h2>
            <div style={{ columns: '2', columnGap: '16px' }}>
              {bikeBrands.map(b => {
                const pSlug = brandPageSlug(b.slug, 'bike')
                return (
                  <Link key={b.slug} href={`/${pSlug}/`} style={linkStyle}>
                    {b.name} Bikes
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Scooter Brands */}
          <div style={card}>
            <h2 style={sectionHeading}>All Scooter Brands ({scooterBrands.length})</h2>
            <div style={{ columns: '2', columnGap: '16px' }}>
              {scooterBrands.map(b => {
                const pSlug = brandPageSlug(b.slug, 'scooter')
                return (
                  <Link key={b.slug} href={`/${pSlug}/`} style={linkStyle}>
                    {b.name} Scooters
                  </Link>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Car Models ── */}
        {carGroups.size > 0 && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <h2 style={sectionHeading}>Car Models by Brand</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px 24px',
            }}>
              {[...carGroups.values()].map(group => (
                <div key={group.pageSlug}>
                  <Link href={`/${group.pageSlug}/`} style={{
                    ...subHeading,
                    display: 'block', textDecoration: 'none', color: '#FFFFFF', marginBottom: '6px',
                  }}>
                    {group.brandName} Cars
                  </Link>
                  {group.models.map(m => (
                    <Link key={m.slug} href={`/${group.pageSlug}/${m.slug}/`} style={linkStyle}>
                      {m.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bike Models ── */}
        {bikeGroups.size > 0 && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <h2 style={sectionHeading}>Bike Models by Brand</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px 24px',
            }}>
              {[...bikeGroups.values()].map(group => (
                <div key={group.pageSlug}>
                  <Link href={`/${group.pageSlug}/`} style={{
                    ...subHeading,
                    display: 'block', textDecoration: 'none', color: '#FFFFFF', marginBottom: '6px',
                  }}>
                    {group.brandName} Bikes
                  </Link>
                  {group.models.map(m => (
                    <Link key={m.slug} href={`/${group.pageSlug}/${m.slug}/`} style={linkStyle}>
                      {m.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scooter Models ── */}
        {scooterGroups.size > 0 && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <h2 style={sectionHeading}>Scooter Models by Brand</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px 24px',
            }}>
              {[...scooterGroups.values()].map(group => (
                <div key={group.pageSlug}>
                  <Link href={`/${group.pageSlug}/`} style={{
                    ...subHeading,
                    display: 'block', textDecoration: 'none', color: '#FFFFFF', marginBottom: '6px',
                  }}>
                    {group.brandName} Scooters
                  </Link>
                  {group.models.map(m => (
                    <Link key={m.slug} href={`/${group.pageSlug}/${m.slug}/`} style={linkStyle}>
                      {m.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Blog Posts ── */}
        {blogs.length > 0 && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <h2 style={sectionHeading}>News & Reviews ({blogs.length})</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '4px 24px',
            }}>
              {blogs.map(post => (
                <Link key={post.slug} href={`/news/${post.slug}/`} style={linkStyle}>
                  {post.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── City Prices Note ── */}
        <div style={{
          ...card,
          background: 'rgba(0,212,255,0.03)',
          marginBottom: '24px',
        }}>
          <h2 style={sectionHeading}>City-Wise On-Road Prices</h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: '0 0 10px', lineHeight: 1.7 }}>
            On-road prices are available for 26+ cities across India.
            View any model page and click the <strong style={{ color: '#FFFFFF' }}>Price</strong> tab
            to see city-wise prices including ex-showroom, RTO, insurance, and on-road totals.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              ['New Cars',    '/new-cars/'],
              ['New Bikes',   '/new-bikes/'],
              ['New Scooters','/new-scooters/'],
            ].map(([label, href]) => (
              <Link key={href} href={href} style={{
                fontSize: '12px', fontWeight: 700, color: '#00D4FF',
                border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px',
                padding: '6px 14px', textDecoration: 'none',
              }}>
                Browse {label} →
              </Link>
            ))}
          </div>
        </div>

        {/* ── Footer note ── */}
        <p style={{ fontSize: '12px', color: '#8E99A8', textAlign: 'center', margin: 0 }}>
          This page is updated automatically · Also see{' '}
          <a href="/sitemap.xml" style={{ color: '#00D4FF', textDecoration: 'none' }}>
            sitemap.xml
          </a>{' '}
          for the machine-readable version
        </p>

      </div>

      <style>{`
        .sitemap-link:hover { color: #00D4FF !important; }
      `}</style>
    </div>
  )
}
