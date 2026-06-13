import Link from 'next/link'
import { getAdminUser } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import UserForm from '../UserForm'

export default async function NewUserPage() {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return <AccessDenied section="Users" />
  }

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
          Add User
        </h1>
        <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
          Grant admin panel access to a team member
        </p>
      </div>

      <UserForm />
    </div>
  )
}
