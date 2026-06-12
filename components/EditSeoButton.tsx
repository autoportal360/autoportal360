'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function EditSeoButton({
  pageKey,
  existingId,
}: {
  pageKey: string
  existingId?: string | null
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    sb.auth.getUser().then(({ data }) => setShow(!!data.user))
  }, [])

  if (!show) return null

  const href = existingId
    ? `/admin/pages/${existingId}`
    : `/admin/pages/new?key=${encodeURIComponent(pageKey)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#00D4FF',
        color: '#06142D',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 800,
        fontSize: '13px',
        padding: '10px 18px',
        borderRadius: '100px',
        textDecoration: 'none',
        zIndex: 9999,
        boxShadow: '0 4px 24px rgba(0,212,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      ✏️ Edit SEO
    </a>
  )
}
