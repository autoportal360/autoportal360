'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import type { AdminRole } from '@/lib/admin-auth-client'
import { ROLE_LABELS } from '@/lib/admin-auth-client'

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.15)',
  borderRadius: '10px', padding: '10px 14px',
  color: '#FFFFFF', fontSize: '14px', outline: 'none',
  fontFamily: 'system-ui, sans-serif',
}
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#8E99A8', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.8px',
}
const FIELD: React.CSSProperties = { marginBottom: '20px' }

interface Props {
  userId?: string
  initial?: { email: string; name: string | null; role: AdminRole; is_active: boolean }
}

export default function UserForm({ userId, initial }: Props) {
  const sbRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current
  const router = useRouter()

  const [email,    setEmail]    = useState(initial?.email    ?? '')
  const [name,     setName]     = useState(initial?.name     ?? '')
  const [role,     setRole]     = useState<AdminRole>(initial?.role ?? 'editor')
  const [active,   setActive]   = useState(initial?.is_active ?? true)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleSave() {
    if (!email.trim()) { showToast('Email is required', false); return }
    setSaving(true)
    try {
      if (userId) {
        const { error } = await sb
          .from('admin_users')
          .update({ name: name || null, role, is_active: active })
          .eq('id', userId)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await sb
          .from('admin_users')
          .insert({ email: email.trim().toLowerCase(), name: name || null, role, is_active: active })
        if (error) throw new Error(error.message)
      }
      showToast(userId ? 'User updated' : 'User created', true)
      setTimeout(() => router.push('/admin/users'), 1000)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!userId) return
    if (!confirm('Delete this user? They will lose admin access immediately.')) return
    setDeleting(true)
    const { error } = await sb.from('admin_users').delete().eq('id', userId)
    if (error) { showToast(error.message, false); setDeleting(false); return }
    router.push('/admin/users')
  }

  return (
    <div style={{ maxWidth: '560px' }}>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? 'rgba(0,204,102,0.12)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,204,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: toast.ok ? '#00CC66' : '#FF8080',
          padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.ok ? '✓' : '✗'}</span>{toast.msg}
        </div>
      )}

      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', padding: '32px',
      }}>

        {!userId && (
          <div style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#C0C0C0',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: '#00D4FF' }}>How to create a new admin user:</strong><br/>
            1. First create the user in{' '}
            <a href="https://supabase.com/dashboard/project/qmhnfdyjisxjhhrdfvqp/auth/users"
               target="_blank"
               rel="noopener noreferrer"
               style={{ color: '#00D4FF' }}>
              Supabase Auth →
            </a>
            {' '}with their email and password.<br/>
            2. Then add their email here and assign a role.<br/>
            3. They can login at /admin/login with the password you set in Supabase.
          </div>
        )}

        <div style={FIELD}>
          <label style={LABEL}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={!!userId}
            style={{ ...INPUT, ...(userId ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
          />
          {!userId && (
            <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>
              Must match their Supabase Auth account email exactly.
            </p>
          )}
        </div>

        <div style={FIELD}>
          <label style={LABEL}>Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            style={INPUT}
          />
        </div>

        <div style={FIELD}>
          <label style={LABEL}>Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            style={{
              ...INPUT,
              appearance: 'none', WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238E99A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
              paddingRight: '36px', cursor: 'pointer',
            }}
          >
            {(Object.keys(ROLE_LABELS) as AdminRole[]).map(r => (
              <option key={r} value={r} style={{ background: '#0A1F44' }}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <div style={{
            fontSize: 11, color: '#8E99A8', margin: '8px 0 0',
            lineHeight: 1.7,
          }}>
            <strong style={{ color: '#C0C0C0' }}>super_admin</strong> — full access &nbsp;·&nbsp;
            <strong style={{ color: '#C0C0C0' }}>catalogue</strong> — brands, models, slider, locations &nbsp;·&nbsp;
            <strong style={{ color: '#C0C0C0' }}>editor</strong> — blog, pages &nbsp;·&nbsp;
            <strong style={{ color: '#C0C0C0' }}>seo</strong> — seo settings, pages
          </div>
        </div>

        <div style={{ ...FIELD, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setActive(a => !a)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: active ? '#00CC66' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.2s', position: 'relative', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: active ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: 13, color: active ? '#00CC66' : '#8E99A8', fontWeight: 600 }}>
            {active ? 'Active — can log in' : 'Inactive — access revoked'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
            color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 14, padding: '12px 28px', borderRadius: '10px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : (userId ? 'Save Changes' : 'Create User')}
          </button>
          <button onClick={() => router.push('/admin/users')} style={{
            background: 'transparent', color: '#8E99A8',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
            fontSize: 14, padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
          }}>
            Cancel
          </button>
          {userId && (
            <button onClick={handleDelete} disabled={deleting} style={{
              marginLeft: 'auto', background: 'rgba(255,80,80,0.08)', color: '#FF5050',
              border: '1px solid rgba(255,80,80,0.25)',
              fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
              fontSize: 14, padding: '12px 20px', borderRadius: '10px',
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
