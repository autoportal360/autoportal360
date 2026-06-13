import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminUser, ROLE_LABELS, ROLE_COLORS } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import type { AdminRole } from '@/lib/admin-auth'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TH: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', color: '#8E99A8',
  fontWeight: 700, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.5px', whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '13px 16px', color: '#C0C0C0', verticalAlign: 'middle', fontSize: 13,
}

export default async function UsersPage() {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return <AccessDenied section="Users" />
  }

  const { data: users } = await db
    .from('admin_users')
    .select('id, email, name, role, is_active, last_login, created_at')
    .order('created_at', { ascending: true })

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '28px', gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
          }}>
            Users
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {users?.length ?? 0} admin user{(users?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/users/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px', borderRadius: '10px',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add User
        </Link>
      </div>

      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {!users?.length ? (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No users yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Name / Email</th>
                <th style={TH}>Role</th>
                <th style={TH}>Status</th>
                <th style={TH}>Last Login</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const role = (u.role ?? 'editor') as AdminRole
                const color = ROLE_COLORS[role] ?? '#8E99A8'
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
                    <td style={TD}>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
                        {u.name ?? '—'}
                      </div>
                      <div style={{ fontSize: 11, color: '#8E99A8' }}>{u.email}</div>
                    </td>
                    <td style={TD}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                        letterSpacing: '0.5px', fontFamily: 'Montserrat, sans-serif',
                        background: `${color}18`, color, border: `1px solid ${color}40`,
                      }}>
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    </td>
                    <td style={TD}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: u.is_active ? '#00CC66' : '#8E99A8',
                      }}>
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ ...TD, fontSize: 12, color: '#8E99A8' }}>
                      {u.last_login
                        ? new Date(u.last_login).toLocaleDateString('en-IN')
                        : 'Never'}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <Link href={`/admin/users/${u.id}`} style={{
                        fontSize: 12, fontWeight: 700, color: '#00D4FF',
                        textDecoration: 'none', padding: '6px 14px',
                        border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8,
                        whiteSpace: 'nowrap',
                      }}>
                        Edit →
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
