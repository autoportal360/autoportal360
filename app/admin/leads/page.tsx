import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import LeadsClient from './LeadsClient'

export default async function LeadsPage() {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'leads')) {
    return <AccessDenied section="Leads" />
  }
  return <LeadsClient />
}
