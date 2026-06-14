import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import type { Dealer } from '@/types/dealer'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TH: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '12px 16px', color: '#C0C0C0', verticalAlign: 'middle',
}

type Props = { searchParams: Promise<{ city?: string; brand?: string; type?: string }> }

export default async function DealersPage({ searchParams }: Props) {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'dealers')) return <AccessDenied section="Dealers" />

  const { city = '', brand = '', type = '' } = await searchParams

  let query = db
    .from('dealers')
    .select('*')
    .order('city')
    .order('brand_name')

  if (city)  query = query.eq('city_slug', city)
  if (brand) query = query.eq('brand_slug', brand)
  if (type)  query = query.contains('vehicle_types', [type])

  const { data: dealers = [] } = await query

  // Unique filter options
  const [{ data: allDealers = [] }] = await Promise.all([
    db.from('dealers').select('city, city_slug, brand_slug, brand_name').order('city'),
  ])
  const cities = [...new Map((allDealers ?? []).map(d => [d.city_slug, { slug: d.city_slug, name: d.city }])).values()]
  const brands = [...new Map((allDealers ?? []).map(d => [d.brand_slug, { slug: d.brand_slug, name: d.brand_name }])).values()]

  const SELECT: React.CSSProperties = {
    background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
    borderRadius: 8, padding: '8px 12px', color: '#C0C0C0', fontSize: 13,
    outline: 'none', cursor: 'pointer',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 26, fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Dealers
          </h1>
          <p style={{ fontSize: 13, color: '#8E99A8', margin: 0 }}>
            {(dealers ?? []).length} dealer{(dealers ?? []).length !== 1 ? 's' : ''} · authorized showrooms
          </p>
        </div>
        <Link href="/admin/dealers/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: 13, padding: '11px 22px',
          borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add Dealer
        </Link>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select name="city" defaultValue={city} style={SELECT}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="brand" defaultValue={brand} style={SELECT}>
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
        <select name="type" defaultValue={type} style={SELECT}>
          <option value="">All Types</option>
          <option value="cars">Cars</option>
          <option value="bikes">Bikes</option>
          <option value="scooters">Scooters</option>
        </select>
        <button type="submit" style={{
          background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          Filter
        </button>
        {(city || brand || type) && (
          <Link href="/admin/dealers" style={{
            background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            Clear
          </Link>
        )}
      </form>

      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        {dealers && dealers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Dealer Name</th>
                <th style={TH}>Brand</th>
                <th style={TH}>City</th>
                <th style={TH}>Types</th>
                <th style={{ ...TH, textAlign: 'center' }}>Rating</th>
                <th style={TH}>Status</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(dealers as Dealer[]).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < (dealers.length - 1) ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                  <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>
                    <div>{d.name}</div>
                    {d.locality && <div style={{ fontSize: 11, color: '#8E99A8', marginTop: 2 }}>{d.locality}</div>}
                  </td>
                  <td style={TD}>{d.brand_name}</td>
                  <td style={TD}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#C0C0C0' }}>{d.city}</div>
                    <div style={{ fontSize: 11, color: '#8E99A8' }}>{d.state}</div>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {d.vehicle_types.map(t => (
                        <span key={t} style={{
                          background: t === 'cars' ? 'rgba(0,212,255,0.08)' : t === 'bikes' ? 'rgba(255,107,53,0.08)' : 'rgba(168,85,247,0.08)',
                          color: t === 'cars' ? '#00D4FF' : t === 'bikes' ? '#FF6B35' : '#A855F7',
                          border: `1px solid ${t === 'cars' ? 'rgba(0,212,255,0.2)' : t === 'bikes' ? 'rgba(255,107,53,0.2)' : 'rgba(168,85,247,0.2)'}`,
                          padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
                        }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    {d.rating ? (
                      <span style={{ color: '#FFB400', fontWeight: 700 }}>★ {d.rating}</span>
                    ) : <span style={{ color: '#555' }}>—</span>}
                  </td>
                  <td style={TD}>
                    <span style={{
                      background: d.is_active ? 'rgba(0,255,128,0.08)' : 'rgba(255,80,80,0.08)',
                      color: d.is_active ? '#00CC66' : '#FF8080',
                      border: `1px solid ${d.is_active ? 'rgba(0,255,128,0.2)' : 'rgba(255,80,80,0.2)'}`,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={TD}>
                    <Link href={`/admin/dealers/${d.id}`} style={{
                      background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                      border: '1px solid rgba(0,212,255,0.2)',
                      padding: '6px 14px', borderRadius: 8,
                      fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No dealers found.{' '}
            <Link href="/admin/dealers/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Add the first dealer →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
