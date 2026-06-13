import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { email, password, name, role } = body as {
    email: string; password: string; name?: string; role: string
  }

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password and role are required' }, { status: 400 })
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: dbError } = await supabaseAdmin
    .from('admin_users')
    .insert({ email, name: name || null, role, is_active: true })

  if (dbError) {
    if (authData?.user?.id) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    }
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
