import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

export const dynamic = 'force-dynamic'

type PageSeoRow = {
  id: string
  page_key: string
  page_type: string
  meta_title: string | null
  updated_at: string
}

const TYPE_COLOR: Record<string, string> = {
  city:         '#00D4FF',
  model:        '#4CAF50',
  brand:        '#FF9800',
  specs:        '#9C27B0',
  'new-cars':   '#2196F3',
  'new-bikes':  '#F44336',
  'new-scooters': '#00BCD4',
  home:         '#FF5722',
  custom:       '#8E99A8',
}

export default async function PageSeoListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'pages')) return <AccessDenied section="Pages SEO" />

  const { q, type } = await searchParams

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('page_seo')
    .select('id, page_key, page_type, meta_title, updated_at')
    .order('updated_at', { ascending: false })

  if (q) query = query.ilike('page_key', `%${q}%`)
  if (type) query = query.eq('page_type', type)

  const { data: rows } = await query.limit(200)
  const pages = (rows ?? []) as PageSeoRow[]

  const PAGE_TYPES = ['city', 'model', 'brand', 'specs', 'new-cars', 'new-bikes', 'new-scooters', 'home', 'custom']

  const th: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
    color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(0,212,255,0.1)', whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    padding: '12px 16px', borderBottom: '1px solid rgba(0,212,255,0.06)',
    fontSize: '13px', color: '#C0C0C0', verticalAlign: 'middle',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Page SEO Manager
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {pages.length} record{pages.length !== 1 ? 's' : ''} · Override meta, H1, FAQs and SEO content per page
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none' }}
        >
          + New Page SEO
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search page key…"
          style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '9px 14px', color: '#FFFFFF', fontSize: '13px', minWidth: '240px' }}
        />
        <select
          name="type"
          defaultValue={type ?? ''}
          style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '9px 14px', color: '#FFFFFF', fontSize: '13px' }}
        >
          <option value="">All types</option>
          {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '9px 18px', color: '#00D4FF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          Filter
        </button>
        {(q || type) && (
          <Link href="/admin/pages" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 18px', color: '#8E99A8', fontSize: '13px', textDecoration: 'none' }}>
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        {pages.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#8E99A8', fontSize: '14px' }}>
            No SEO records yet. <Link href="/admin/pages/new" style={{ color: '#00D4FF' }}>Create one →</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,212,255,0.04)' }}>
                  <th style={th}>Page Key</th>
                  <th style={th}>Type</th>
                  <th style={th}>Meta Title</th>
                  <th style={th}>Updated</th>
                  <th style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id}>
                    <td style={td}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#FFFFFF' }}>{p.page_key}</span>
                    </td>
                    <td style={td}>
                      <span style={{
                        fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                        background: `${TYPE_COLOR[p.page_type] ?? '#8E99A8'}22`,
                        color: TYPE_COLOR[p.page_type] ?? '#8E99A8',
                        border: `1px solid ${TYPE_COLOR[p.page_type] ?? '#8E99A8'}44`,
                        fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase',
                      }}>
                        {p.page_type}
                      </span>
                    </td>
                    <td style={{ ...td, maxWidth: '300px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {p.meta_title ?? <span style={{ color: '#444', fontStyle: 'italic' }}>—</span>}
                      </span>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: '#8E99A8', fontSize: '12px' }}>
                      {new Date(p.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <Link
                        href={`/admin/pages/${p.id}`}
                        style={{ fontSize: '12px', fontWeight: 700, color: '#00D4FF', textDecoration: 'none', padding: '5px 12px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '6px' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
