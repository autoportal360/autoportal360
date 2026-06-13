import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type AdminRole = 'super_admin' | 'catalogue' | 'editor' | 'seo'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: AdminRole
  is_active: boolean
}

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  catalogue:   ['brands', 'models', 'slider', 'cities', 'states'],
  editor:      ['blog', 'pages'],
  seo:         ['seo', 'pages'],
}

export function hasPermission(role: AdminRole, section: string): boolean {
  const perms = ROLE_PERMISSIONS[role]
  return perms.includes('*') || perms.includes(section)
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  catalogue:   'Catalogue',
  editor:      'Editor',
  seo:         'SEO',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: '#FF4D4D',
  catalogue:   '#FFB400',
  editor:      '#00D4FF',
  seo:         '#00CC66',
}

export async function getAdminUser(): Promise<AdminUser | null> {
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

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user?.email) return null

  const { data } = await supabase
    .from('admin_users')
    .select('id, email, name, role, is_active')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  return (data as AdminUser | null)
}
