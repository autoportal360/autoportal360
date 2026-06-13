import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import SliderClient from './SliderClient'

export default async function SliderPage() {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'slider')) {
    return <AccessDenied section="Slider" />
  }
  return <SliderClient />
}
