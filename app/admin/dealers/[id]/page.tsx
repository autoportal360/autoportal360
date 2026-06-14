import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

type Props = { params: Promise<{ id: string }> }

export default async function EditDealerPage({ params }: Props) {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'dealers')) return <AccessDenied section="Dealers" />

  const { id } = await params
  const Form = (await import('../DealerForm')).default
  return <Form dealerId={id} />
}
