import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { formatPriceRange } from '@/lib/utils'
import type { Brand } from '@/types'
import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { searchParams: Promise<{ type?: string; q?: string }> }

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'car',     label: 'Cars' },
  { value: 'bike',    label: 'Bikes' },
  { value: 'scooter', label: 'Scooters' },
]

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  car:     { bg: 'rgba(0,212,255,0.08)',   text: '#00D4FF', border: 'rgba(0,212,255,0.2)'   },
  bike:    { bg: 'rgba(255,180,0,0.08)',   text: '#FFB400', border: 'rgba(255,180,0,0.2)'   },
  scooter: { bg: 'rgba(0,255,128,0.06)',   text: '#00CC66', border: 'rgba(0,255,128,0.2)'   },
}

const TH: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}

const TD: React.CSSProperties = {
  padding: '12px 16px', color: '#C0C0C0', verticalAlign: 'middle',
}

export default async function BrandsPage({ searchParams }: Props) {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'brands')) return <AccessDenied section="Brands" />

  const { type = 'all', q = '' } = await searchParams

  // Brands query — filter server-side
  let query = db.from('brands').select('*').order('type').order('sort_order')
  if (type !== 'all') query = query.eq('type', type as Brand['type'])
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: brands = [] } = await query

  // Model counts — one lightweight query, counted in JS
  const { data: modelRows = [] } = await db.from('models').select('brand_id')
  const modelCount = new Map<string, number>()
  ;(modelRows ?? []).forEach(m =>
    modelCount.set(m.brand_id, (modelCount.get(m.brand_id) ?? 0) + 1)
  )

  const total = brands?.length ?? 0

  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '28px', gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
          }}>
            Brands
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {total} brand{total !== 1 ? 's' : ''}{q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Link href="/admin/brands/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add New Brand
        </Link>
      </div>

      {/* ── FILTERS ── */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap',
      }}>
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {TABS.map(tab => {
            const active = type === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/brands?type=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                style={{
                  padding: '7px 14px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: 700,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  background: active ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                  color: active ? '#06142D' : '#C0C0C0',
                  border: `1px solid ${active ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search form (GET, no JS needed) */}
        <form method="GET" action="/admin/brands" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {type !== 'all' && <input type="hidden" name="type" value={type} />}
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search by name…"
            style={{
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '10px', padding: '8px 14px',
              color: '#FFFFFF', fontSize: '13px', outline: 'none', width: '220px',
            }}
          />
          <button type="submit" style={{
            background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '10px', padding: '8px 16px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          }}>
            Search
          </button>
          {q && (
            <Link href={`/admin/brands${type !== 'all' ? `?type=${type}` : ''}`} style={{
              background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px 14px',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center',
            }}>
              ✕ Clear
            </Link>
          )}
        </form>
      </div>

      {/* ── TABLE ── */}
      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {brands && brands.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Logo</th>
                <th style={TH}>Name</th>
                <th style={TH}>Slug</th>
                <th style={TH}>Type</th>
                <th style={TH}>Price Range</th>
                <th style={{ ...TH, textAlign: 'center' }}>Models</th>
                <th style={TH}>Active</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, i) => {
                const tc = TYPE_COLOR[brand.type] ?? TYPE_COLOR.car
                const count = modelCount.get(brand.id) ?? 0
                return (
                  <tr
                    key={brand.id}
                    style={{ borderBottom: i < brands.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    {/* Logo */}
                    <td style={TD}>
                      {brand.logo_url ? (
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, background: '#FFFFFF',
                          position: 'relative', overflow: 'hidden', flexShrink: 0,
                        }}>
                          <Image
                            src={brand.logo_url} alt={brand.name}
                            fill sizes="38px"
                            style={{ objectFit: 'contain', padding: 4 }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 38, height: 38, borderRadius: 8,
                          background: 'rgba(0,212,255,0.08)',
                          border: '1px solid rgba(0,212,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: 11, fontWeight: 900, color: '#00D4FF',
                        }}>
                          {brand.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>
                      {brand.name}
                    </td>

                    {/* Slug */}
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 12 }}>
                      {brand.slug}
                    </td>

                    {/* Type badge */}
                    <td style={TD}>
                      <span style={{
                        background: tc.bg, color: tc.text,
                        border: `1px solid ${tc.border}`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {brand.type}
                      </span>
                    </td>

                    {/* Price range */}
                    <td style={TD}>
                      {brand.price_min && brand.price_max
                        ? formatPriceRange(brand.price_min, brand.price_max)
                        : <span style={{ color: '#555' }}>—</span>}
                    </td>

                    {/* Model count */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <span style={{
                        background: count > 0 ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)',
                        color: count > 0 ? '#00D4FF' : '#555',
                        padding: '2px 10px', borderRadius: 12,
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {count}
                      </span>
                    </td>

                    {/* Active badge */}
                    <td style={TD}>
                      <span style={{
                        background: brand.is_active ? 'rgba(0,255,128,0.08)' : 'rgba(255,80,80,0.08)',
                        color: brand.is_active ? '#00CC66' : '#FF8080',
                        border: `1px solid ${brand.is_active ? 'rgba(0,255,128,0.2)' : 'rgba(255,80,80,0.2)'}`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Edit action */}
                    <td style={TD}>
                      <Link href={`/admin/brands/${brand.id}`} style={{
                        background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                        border: '1px solid rgba(0,212,255,0.2)',
                        padding: '6px 14px', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No brands found.{' '}
            <Link href="/admin/brands/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Add the first brand →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
