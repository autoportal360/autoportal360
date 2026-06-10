'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#06142D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, color: '#FFFFFF' }}>
            Auto<span style={{ color: '#00D4FF' }}>Portal</span><span style={{ color: '#8E99A8' }}>360</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8E99A8', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Admin Panel
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#0A1F44',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: '20px', padding: '36px',
        }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px',
          }}>
            Sign In
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: '0 0 28px' }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8',
                marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '10px', padding: '12px 14px',
                  color: '#FFFFFF', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8',
                marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '10px', padding: '12px 14px',
                  color: '#FFFFFF', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.25)',
                borderRadius: '10px', padding: '12px 14px',
                marginBottom: '20px', fontSize: '13px', color: '#FF6B6B',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(0,212,255,0.4)' : '#00D4FF',
                color: '#06142D',
                fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
                fontSize: '14px', padding: '13px',
                borderRadius: '10px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
