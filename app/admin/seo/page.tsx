import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'
import SeoClient from './SeoClient'

export default async function SeoPage() {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'seo')) {
    return <AccessDenied section="SEO Settings" />
  }
  return <SeoClient />
}
