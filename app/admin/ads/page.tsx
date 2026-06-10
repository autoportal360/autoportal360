import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ZONES = [
  { id: 'hero-billboard', label: 'Hero Billboard',   desc: 'Full-width banner below nav' },
  { id: 'mid-feed-1',     label: 'Mid Feed 1',       desc: 'Strip banner in model listing' },
  { id: 'mid-feed-2',     label: 'Mid Feed 2',       desc: 'Second strip in listing' },
  { id: 'in-feed-native', label: 'In-Feed Native',   desc: 'Card style in model grid' },
  { id: 'pre-footer',     label: 'Pre-Footer Strip', desc: 'Wide banner before footer' },
]

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  affiliate:   { bg: 'rgba(0,212,255,0.08)',  text: '#00D4FF', border: 'rgba(0,212,255,0.2)'  },
  'oem-banner':{ bg: 'rgba(255,180,0,0.08)',  text: '#FFB400', border: 'rgba(255,180,0,0.2)'  },
  adsense:     { bg: 'rgba(0,204,102,0.08)',  text: '#00CC66', border: 'rgba(0,204,102,0.2)'  },
  custom:      { bg: 'rgba(142,153,168,0.1)', text: '#8E99A8', border: 'rgba(142,153,168,0.2)' },
}

const TH: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '13px 14px', color: '#C0C0C0', verticalAlign: 'middle', fontSize: 13,
}

interface Campaign {
  zone: string
  advertiser: string | null
  ad_type: string | null
  is_active: boolean | null
}

export default async function AdsPage() {
  let campaigns: Campaign[] = []
  try {
    const { data } = await db
      .from('ad_campaigns')
      .select('zone, advertiser, ad_type, is_active')
    campaigns = (data ?? []) as Campaign[]
  } catch { /* table not yet created */ }

  const map = Object.fromEntries(campaigns.map(c => [c.zone, c]))

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
          fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
        }}>
          Ad Zones
        </h1>
        <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
          Manage campaigns across {ZONES.length} zones
        </p>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
              <th style={TH}>Zone</th>
              <th style={TH}>Description</th>
              <th style={TH}>Advertiser</th>
              <th style={TH}>Type</th>
              <th style={TH}>Status</th>
              <th style={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ZONES.map((zone, i) => {
              const c       = map[zone.id]
              const type    = c?.ad_type ?? 'affiliate'
              const tc      = TYPE_COLOR[type] ?? TYPE_COLOR.affiliate
              const active  = c?.is_active ?? true
              return (
                <tr key={zone.id} style={{
                  borderBottom: i < ZONES.length - 1
                    ? '1px solid rgba(0,212,255,0.06)' : 'none',
                }}>
                  <td style={{ ...TD, color: '#FFFFFF', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>
                    {zone.id}
                  </td>
                  <td style={{ ...TD, fontSize: 12, color: '#8E99A8' }}>
                    {zone.label}
                    <span style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                      {zone.desc}
                    </span>
                  </td>
                  <td style={TD}>
                    {c?.advertiser ?? <span style={{ color: '#555' }}>—</span>}
                  </td>
                  <td style={TD}>
                    <span style={{
                      background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {type}
                    </span>
                  </td>
                  <td style={TD}>
                    <span style={{
                      background: active ? 'rgba(0,204,102,0.08)' : 'rgba(142,153,168,0.1)',
                      color: active ? '#00CC66' : '#8E99A8',
                      border: `1px solid ${active ? 'rgba(0,204,102,0.2)' : 'rgba(142,153,168,0.2)'}`,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={TD}>
                    <Link href={`/admin/ads/${zone.id}`} style={{
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
      </div>
    </div>
  )
}
