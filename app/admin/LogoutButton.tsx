'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'rgba(255,80,80,0.08)',
        border: '1px solid rgba(255,80,80,0.2)',
        color: '#FF8080',
        fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
        fontSize: '12px', padding: '8px 16px',
        borderRadius: '8px', cursor: 'pointer',
      }}
    >
      Logout
    </button>
  )
}
