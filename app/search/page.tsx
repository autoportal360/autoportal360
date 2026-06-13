import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatPriceRange } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import SearchBox from '@/components/SearchBox'

// ─── helpers ──────────────────────────────────────────────────────────────────

function brandUrl(slug: string, type: string) {
  const clean = slug.replace(/-bike$/, '').replace(/-scooter$/, '')
  const s = type === 'car' ? 'cars' : type === 'bike' ? 'bikes' : 'scooters'
  return `/${clean}-${s}/`
}
function modelUrl(brandSlug: string, modelSlug: string, type: string) {
  const clean = brandSlug.replace(/-bike$/, '').replace(/-scooter$/, '')
  const s = type === 'car' ? 'cars' : type === 'bike' ? 'bikes' : 'scooters'
  return `/${clean}-${s}/${modelSlug}/`
}

const TYPE_COLOR: Record<string, string> = { car: '#00D4FF', bike: '#FF6B35', scooter: '#A855F7' }
const TYPE_LABEL: Record<string, string> = { car: 'Car', bike: 'Bike', scooter: 'Scooter' }
const TYPE_ICON:  Record<string, string> = { car: '🚗', bike: '🏍️', scooter: '🛵' }

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLOR[type] ?? '#8E99A8'
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      background: `${c}1a`, border: `1px solid ${c}40`, color: c, whiteSpace: 'nowrap',
    }}>{TYPE_LABEL[type] ?? type}</span>
  )
}

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q = '' } = await searchParams
  const title = q
    ? `Search results for "${q}" | AutoPortal360`
    : 'Search | AutoPortal360'
  return {
    title,
    description: q
      ? `Browse cars, bikes and scooters matching "${q}" on AutoPortal360.`
      : 'Search cars, bikes and scooters on AutoPortal360.',
    alternates: { canonical: getCanonicalUrl(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`) },
    robots: 'noindex, follow',
  }
}

// ─── types ────────────────────────────────────────────────────────────────────

type ResultModel = {
  id: string; name: string; slug: string; type: string
  price_min: number | null; price_max: number | null; thumbnail_url: string | null
  brands: { name: string; slug: string } | null
}
type ResultBrand = {
  id: string; name: string; slug: string; type: string
  logo_url: string | null; price_min: number | null; price_max: number | null
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const query = q.trim()

  let models: ResultModel[] = []
  let brands: ResultBrand[] = []

  if (query.length >= 2) {
    const safe = query.replace(/%/g, '\\%').replace(/_/g, '\\_')
    const [modelsRes, brandsRes] = await Promise.all([
      supabase
        .from('models')
        .select('id, name, slug, type, price_min, price_max, thumbnail_url, brands!inner(name, slug)')
        .neq('status', 'discontinued')
        .or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
        .order('price_min', { ascending: true })
        .limit(20),
      supabase
        .from('brands')
        .select('id, name, slug, type, logo_url, price_min, price_max')
        .eq('is_active', true)
        .or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
        .order('sort_order')
        .limit(10),
    ])
    models = (modelsRes.data ?? []) as unknown as ResultModel[]
    brands = (brandsRes.data ?? []) as ResultBrand[]
  }

  const total = models.length + brands.length
  const hasQuery = query.length >= 2

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '28px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 22, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Search</span>
        </div>

        {/* Search box */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 'clamp(20px, 4vw, 28px)', color: '#FFFFFF', margin: '0 0 18px',
          }}>
            {hasQuery
              ? <>{total} result{total !== 1 ? 's' : ''} for <span style={{ color: '#00D4FF' }}>&ldquo;{query}&rdquo;</span></>
              : <>Search <span style={{ color: '#00D4FF' }}>AutoPortal360</span></>
            }
          </h1>
          <SearchBox placeholder="Search cars, bikes, brands, models…" />
        </div>

        {/* No results */}
        {hasQuery && total === 0 && (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 14, padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
            <p style={{ fontSize: 13, color: '#8E99A8', marginBottom: 20 }}>
              Try a shorter search or browse by category below.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: '🚗 New Cars',     href: '/new-cars/' },
                { label: '🏍️ Bikes',       href: '/new-bikes/' },
                { label: '🛵 Scooters',    href: '/new-scooters/' },
                { label: '⚡ Compare',     href: '/compare/' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                  color: '#00D4FF', padding: '8px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>{l.label}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Brands section */}
        {brands.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800,
              color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px',
            }}>
              Brands · {brands.length}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {brands.map(b => (
                <Link key={b.id} href={brandUrl(b.slug, b.type)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: 12, padding: '12px 14px', textDecoration: 'none',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0, position: 'relative',
                    background: b.logo_url ? '#FFFFFF' : 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: b.logo_url ? 5 : 0, boxSizing: 'border-box',
                  }}>
                    {b.logo_url
                      ? <Image src={b.logo_url} alt={b.name} fill style={{ objectFit: 'contain', padding: 5 }} sizes="44px" />
                      : <span style={{ fontSize: 14, fontWeight: 900, color: '#00D4FF', fontFamily: 'Montserrat, sans-serif' }}>{b.name.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', marginBottom: 3 }}>{b.name}</div>
                    {b.price_min && b.price_max
                      ? <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 600 }}>{formatPriceRange(b.price_min, b.price_max)}</div>
                      : <div style={{ fontSize: 11, color: '#8E99A8' }}>{TYPE_ICON[b.type]} {TYPE_LABEL[b.type]} brand</div>
                    }
                  </div>
                  <TypeBadge type={b.type} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Models section */}
        {models.length > 0 && (
          <section>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800,
              color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px',
            }}>
              Models · {models.length}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {models.map(m => {
                const brand = m.brands
                const href  = brand ? modelUrl(brand.slug, m.slug, m.type) : '#'
                return (
                  <Link key={m.id} href={href} style={{
                    background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)',
                    borderRadius: 14, overflow: 'hidden', textDecoration: 'none', display: 'block',
                  }}>
                    {m.thumbnail_url ? (
                      <div style={{ height: 110, position: 'relative', overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
                        <Image src={m.thumbnail_url} alt={m.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{
                        height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 44, background: 'linear-gradient(135deg,#0d1f3c,#0a0a0a)',
                      }}>
                        {TYPE_ICON[m.type] ?? '🚗'}
                      </div>
                    )}
                    <div style={{ padding: '11px 13px 13px' }}>
                      <div style={{ fontSize: 10, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>{brand?.name ?? ''}</div>
                      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{m.name}</div>
                      {m.price_min && (
                        <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700, marginBottom: 6 }}>
                          {m.price_max && m.price_max !== m.price_min ? formatPriceRange(m.price_min, m.price_max) : formatPrice(m.price_min)}
                        </div>
                      )}
                      <TypeBadge type={m.type} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state (no query) */}
        {!hasQuery && (
          <div style={{ textAlign: 'center', color: '#8E99A8', fontSize: 14, paddingTop: 20 }}>
            Start typing to search cars, bikes, brands and models.
          </div>
        )}

      </div>
    </div>
  )
}
