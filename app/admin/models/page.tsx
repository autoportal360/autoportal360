import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { formatPriceRange } from '@/lib/utils'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { searchParams: Promise<{ type?: string; status?: string; q?: string }> }

const TYPE_TABS = [
  { value: 'all',     label: 'All' },
  { value: 'car',     label: 'Cars' },
  { value: 'bike',    label: 'Bikes' },
  { value: 'scooter', label: 'Scooters' },
]

const STATUS_TABS = [
  { value: 'all',          label: 'All' },
  { value: 'active',       label: 'Active' },
  { value: 'upcoming',     label: 'Upcoming' },
  { value: 'discontinued', label: 'Discontinued' },
]

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  active:       { bg: 'rgba(0,255,128,0.08)',  text: '#00CC66', border: 'rgba(0,255,128,0.2)' },
  upcoming:     { bg: 'rgba(255,180,0,0.08)',  text: '#FFB400', border: 'rgba(255,180,0,0.2)' },
  discontinued: { bg: 'rgba(142,153,168,0.1)', text: '#8E99A8', border: 'rgba(142,153,168,0.2)' },
}

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  car:     { bg: 'rgba(0,212,255,0.08)',  text: '#00D4FF', border: 'rgba(0,212,255,0.2)' },
  bike:    { bg: 'rgba(255,180,0,0.08)',  text: '#FFB400', border: 'rgba(255,180,0,0.2)' },
  scooter: { bg: 'rgba(0,255,128,0.06)',  text: '#00CC66', border: 'rgba(0,255,128,0.2)' },
}

const TH: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '11px 14px', color: '#C0C0C0', verticalAlign: 'middle',
}

export default async function ModelsPage({ searchParams }: Props) {
  const { type = 'all', status = 'all', q = '' } = await searchParams

  let query = db
    .from('models')
    .select('*, brand:brands(id, name, slug, type)')
    .order('created_at', { ascending: false })

  if (type !== 'all')   query = query.eq('type', type)
  if (status !== 'all') query = query.eq('status', status)

  const { data: allModels = [] } = await query

  const models = q
    ? (allModels ?? []).filter(m => {
        const lq = q.toLowerCase()
        return (
          m.name.toLowerCase().includes(lq) ||
          (m.brand as { name: string } | null)?.name.toLowerCase().includes(lq)
        )
      })
    : (allModels ?? [])

  const total = models.length

  function buildHref(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = { type, status, q, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v) })
    const s = params.toString()
    return `/admin/models${s ? `?${s}` : ''}`
  }

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
            Models
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {total} model{total !== 1 ? 's' : ''}{q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Link href="/admin/models/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add New Model
        </Link>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {TYPE_TABS.map(tab => {
            const active = type === tab.value
            return (
              <Link key={tab.value} href={buildHref({ type: tab.value })} style={{
                padding: '7px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
                background: active ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                color: active ? '#06142D' : '#C0C0C0',
                border: `1px solid ${active ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
              }}>
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUS_TABS.map(tab => {
            const active = status === tab.value
            return (
              <Link key={tab.value} href={buildHref({ status: tab.value })} style={{
                padding: '7px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
                background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: active ? '#FFFFFF' : '#8E99A8',
                border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/models" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {type   !== 'all' && <input type="hidden" name="type"   value={type} />}
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search by name or brand…"
            style={{
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '10px', padding: '8px 14px',
              color: '#FFFFFF', fontSize: '13px', outline: 'none', width: '230px',
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
            <Link href={buildHref({ q: '' })} style={{
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
        {models.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Thumb</th>
                <th style={TH}>Brand</th>
                <th style={TH}>Model Name</th>
                <th style={TH}>Slug</th>
                <th style={TH}>Type</th>
                <th style={TH}>Body Type</th>
                <th style={TH}>Status</th>
                <th style={TH}>Price Range</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, i) => {
                const brand = model.brand as { name: string } | null
                const sc = STATUS_COLOR[model.status] ?? STATUS_COLOR.active
                const tc = TYPE_COLOR[model.type] ?? TYPE_COLOR.car
                return (
                  <tr
                    key={model.id}
                    style={{ borderBottom: i < models.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    {/* Thumbnail */}
                    <td style={TD}>
                      {model.thumbnail_url ? (
                        <div style={{
                          width: 44, height: 30, borderRadius: 6,
                          position: 'relative', overflow: 'hidden', flexShrink: 0,
                          background: '#111',
                        }}>
                          <Image
                            src={model.thumbnail_url} alt={model.name}
                            fill sizes="44px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 44, height: 30, borderRadius: 6,
                          background: 'rgba(0,212,255,0.06)',
                          border: '1px solid rgba(0,212,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, color: '#8E99A8',
                        }}>
                          No img
                        </div>
                      )}
                    </td>

                    {/* Brand */}
                    <td style={{ ...TD, color: '#8E99A8', fontSize: 12 }}>
                      {brand?.name ?? '—'}
                    </td>

                    {/* Model name */}
                    <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>
                      {model.name}
                    </td>

                    {/* Slug */}
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 12 }}>
                      {model.slug}
                    </td>

                    {/* Type */}
                    <td style={TD}>
                      <span style={{
                        background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {model.type}
                      </span>
                    </td>

                    {/* Body type */}
                    <td style={{ ...TD, fontSize: 12 }}>
                      {model.body_type ?? <span style={{ color: '#555' }}>—</span>}
                    </td>

                    {/* Status */}
                    <td style={TD}>
                      <span style={{
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {model.status}
                      </span>
                    </td>

                    {/* Price range */}
                    <td style={{ ...TD, fontSize: 12 }}>
                      {model.price_min && model.price_max
                        ? formatPriceRange(model.price_min, model.price_max)
                        : <span style={{ color: '#555' }}>—</span>}
                    </td>

                    {/* Edit */}
                    <td style={TD}>
                      <Link href={`/admin/models/${model.id}`} style={{
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
            No models found.{' '}
            <Link href="/admin/models/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Add the first model →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
