import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { searchParams: Promise<{ status?: string; q?: string }> }

const STATUS_TABS = [
  { value: 'all',       label: 'All'       },
  { value: 'draft',     label: 'Drafts'    },
  { value: 'published', label: 'Published' },
]

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  draft:     { bg: 'rgba(142,153,168,0.1)', text: '#8E99A8', border: 'rgba(142,153,168,0.2)' },
  published: { bg: 'rgba(0,204,102,0.08)', text: '#00CC66', border: 'rgba(0,204,102,0.2)'  },
}

const TH: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '12px 14px', color: '#C0C0C0', verticalAlign: 'middle', fontSize: 13,
}

interface BlogPost {
  id: string
  title: string
  slug: string
  status: string
  author: string | null
  published_at: string | null
  created_at: string
}

export default async function BlogPage({ searchParams }: Props) {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'blog')) return <AccessDenied section="Blog" />

  const { status = 'all', q = '' } = await searchParams

  let posts: BlogPost[] = []
  try {
    let query = db
      .from('blog_posts')
      .select('id, title, slug, status, author, published_at, created_at')
      .order('created_at', { ascending: false })
    if (status !== 'all') query = query.eq('status', status)
    const { data } = await query
    posts = (data ?? []) as BlogPost[]
  } catch { /* table not yet created */ }

  const filtered = q
    ? posts.filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.slug.toLowerCase().includes(q.toLowerCase())
      )
    : posts

  function buildHref(overrides: Record<string, string>) {
    const params  = new URLSearchParams()
    const merged  = { status, q, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v) })
    const s = params.toString()
    return `/admin/blog${s ? `?${s}` : ''}`
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '28px', gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
          }}>
            Blog
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {filtered.length} post{filtered.length !== 1 ? 's' : ''}
            {q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Link href="/admin/blog/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + New Post
        </Link>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUS_TABS.map(tab => {
            const active = status === tab.value
            return (
              <Link key={tab.value} href={buildHref({ status: tab.value })} style={{
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

        {/* Search */}
        <form method="GET" action="/admin/blog" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search title or slug…"
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

      {/* ── Table ── */}
      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No posts found.{' '}
            <Link href="/admin/blog/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Write the first post →
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Title</th>
                <th style={TH}>Slug</th>
                <th style={TH}>Status</th>
                <th style={TH}>Author</th>
                <th style={TH}>Published</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => {
                const sc = STATUS_COLOR[post.status] ?? STATUS_COLOR.draft
                return (
                  <tr
                    key={post.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600, maxWidth: 280 }}>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {post.title}
                      </span>
                    </td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 12 }}>
                      {post.slug}
                    </td>
                    <td style={TD}>
                      <span style={{
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ ...TD, fontSize: 12 }}>
                      {post.author ?? 'AutoPortal360'}
                    </td>
                    <td style={{ ...TD, fontSize: 12, whiteSpace: 'nowrap' }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-IN')
                        : <span style={{ color: '#555' }}>—</span>}
                    </td>
                    <td style={TD}>
                      <Link href={`/admin/blog/${post.id}`} style={{
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
        )}
      </div>
    </div>
  )
}
