import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

const NAV = [
  { href: '/admin',          label: 'Dashboard', icon: '◼' },
  { href: '/admin/brands',   label: 'Brands',    icon: '🏷' },
  { href: '/admin/models',   label: 'Models',    icon: '🚗' },
  { href: '/admin/slider',   label: 'Slider',    icon: '🎞️' },
  { href: '/admin/leads',    label: 'Leads',     icon: '📋' },
  { href: '/admin/states',   label: 'States',    icon: '🗺️' },
  { href: '/admin/cities',   label: 'Cities',    icon: '🏙️' },
  { href: '/admin/ads',      label: 'Ads',       icon: '📢' },
  { href: '/admin/seo',      label: 'SEO',       icon: '🔍' },
  { href: '/admin/blog',     label: 'Blog',      icon: '✍' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated — no sidebar (login page handles its own layout)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div style={{
      background: '#06142D',
      display: 'flex', minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* ── SIDEBAR ── */}
      <nav style={{
          width: '220px', background: '#111111', flexShrink: 0,
          borderRight: '1px solid rgba(0,212,255,0.08)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflow: 'auto',
        }}>
          {/* Logo */}
          <div style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '17px', fontWeight: 900, color: '#FFFFFF',
            }}>
              Auto<span style={{ color: '#00D4FF' }}>Portal</span>
              <span style={{ color: '#8E99A8' }}>360</span>
            </div>
            <div style={{
              fontSize: '9px', color: '#8E99A8', marginTop: '3px',
              textTransform: 'uppercase', letterSpacing: '2px',
            }}>
              Admin
            </div>
          </div>

          {/* Nav links */}
          <div style={{ padding: '12px', flex: 1 }}>
            {NAV.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  color: '#C0C0C0', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 600, marginBottom: '2px',
                }}
              >
                <span style={{ fontSize: '15px', lineHeight: 1 }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Email footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '11px', color: '#8E99A8',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.email}
          </div>
        </nav>

        {/* ── MAIN AREA ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Top bar */}
          <header style={{
            height: '60px', background: '#0A1F44',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', padding: '0 24px', flexShrink: 0,
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            <LogoutButton />
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
            {children}
          </main>
        </div>

    </div>
  )
}
