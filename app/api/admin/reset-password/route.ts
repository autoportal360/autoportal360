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

  const { email, newPassword } = await request.json() as {
    email: string; newPassword: string
  }

  if (!email || !newPassword) {
    return NextResponse.json({ error: 'email and newPassword are required' }, { status: 400 })
  }

  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 })
  }

  const authUser = users.find(u => u.email === email)
  if (!authUser) {
    return NextResponse.json(
      { error: `No Supabase Auth account found for ${email}` },
      { status: 404 }
    )
  }

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    authUser.id,
    { password: newPassword }
  )

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
