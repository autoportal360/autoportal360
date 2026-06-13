import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-auth'
import type { AdminRole } from '@/lib/admin-auth-client'
import AccessDenied from '@/app/admin/AccessDenied'
import UserForm from '../UserForm'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return <AccessDenied section="Users" />
  }

  const { data: user } = await db
    .from('admin_users')
    .select('id, email, name, role, is_active')
    .eq('id', id)
    .single()

  if (!user) notFound()

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <Link href="/admin/users" style={{
          fontSize: 12, color: '#8E99A8', textDecoration: 'none', fontWeight: 600,
        }}>
          ← Back to Users
        </Link>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
          fontWeight: 900, color: '#FFFFFF', margin: '8px 0 4px',
        }}>
          Edit User
        </h1>
        <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
          {user.email}
        </p>
      </div>

      <UserForm
        userId={user.id}
        initial={{
          email:     user.email,
          name:      user.name ?? null,
          role:      (user.role ?? 'editor') as AdminRole,
          is_active: user.is_active ?? true,
        }}
      />
    </div>
  )
}
