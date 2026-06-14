import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

export default async function NewDealerPage() {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'dealers')) return <AccessDenied section="Dealers" />

  const Form = (await import('../DealerForm')).default
  return <Form />
}
