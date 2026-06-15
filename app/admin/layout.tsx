import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getAdminUser } from '@/lib/admin-auth'
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from '@/lib/admin-auth-client'
import type { AdminRole } from '@/lib/admin-auth-client'

const NAV = [
  { href: '/admin',          label: 'Dashboard', icon: '◼',  section: null },
  { href: '/admin/brands',   label: 'Brands',    icon: '🏷',  section: 'brands' },
  { href: '/admin/models',   label: 'Models',    icon: '🚗',  section: 'models' },
  { href: '/admin/slider',   label: 'Slider',    icon: '🎞️', section: 'slider' },
  { href: '/admin/leads',    label: 'Leads',     icon: '📋',  section: 'leads' },
  { href: '/admin/states',   label: 'States',    icon: '🗺️', section: 'states' },
  { href: '/admin/cities',   label: 'Cities',    icon: '🏙️', section: 'cities' },
  { href: '/admin/pages',    label: 'Pages SEO', icon: '📄',  section: 'pages' },
  { href: '/admin/dealers',  label: 'Dealers',   icon: '🏪',  section: 'dealers' },
  { href: '/admin/ads',      label: 'Ads',       icon: '📢',  section: 'ads' },
  { href: '/admin/seo',       label: 'SEO',       icon: '🔍',  section: 'seo' },
  { href: '/admin/brand-seo',      label: 'Dealer SEO Pages', icon: '📝',  section: 'brand-seo' },
  { href: '/admin/brand-page-seo', label: 'Brand Page SEO', icon: '📄',  section: 'brand-page-seo' },
  { href: '/admin/blog',      label: 'Blog',      icon: '✍',   section: 'blog' },
  { href: '/admin/users',    label: 'Users',     icon: '👥',  section: 'users' },
]

function navVisible(section: string | null, role: AdminRole): boolean {
  if (section === null) return true
  if (section === 'users') return role === 'super_admin'
  return hasPermission(role, section)
}

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

  if (!user) {
    return <>{children}</>
  }

  const adminUser = await getAdminUser()
  if (!adminUser) {
    redirect('/admin/login?error=unauthorized')
  }

  const role = adminUser.role
  const visibleNav = NAV.filter(link => navVisible(link.section, role))

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
            {visibleNav.map(link => (
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

          {/* User info footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontSize: '12px', color: '#FFFFFF', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: '4px',
            }}>
              {adminUser.name ?? user.email}
            </div>
            <span style={{
              display: 'inline-block',
              fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              background: `${ROLE_COLORS[role]}18`,
              color: ROLE_COLORS[role],
              border: `1px solid ${ROLE_COLORS[role]}40`,
            }}>
              {ROLE_LABELS[role]}
            </span>
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
