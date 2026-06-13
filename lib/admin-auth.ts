export type { AdminRole } from './admin-auth-client'
export { ROLE_PERMISSIONS, hasPermission, ROLE_LABELS, ROLE_COLORS } from './admin-auth-client'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { AdminRole } from './admin-auth-client'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: AdminRole
  is_active: boolean
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
