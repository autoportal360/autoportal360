'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

type SearchModel = {
  id: string; name: string; slug: string; type: string
  price_min: number | null; thumbnail_url: string | null
  brands: { name: string; slug: string }
}
type SearchBrand = {
  id: string; name: string; slug: string; type: string
  logo_url: string | null; price_min: number | null; price_max: number | null
}
type SearchResults = { models: SearchModel[]; brands: SearchBrand[]; total: number }

function brandUrl(slug: string, type: string) {
  const clean = slug.replace(/-bike$/, '').replace(/-scooter$/, '')
  const s = type === 'car' ? 'cars' : type === 'bike' ? 'bikes' : 'scooters'
  return `/${clean}-${s}/`
}
function modelUrl(brandSlug: string, modelSlug: string, type: string) {
  const clean = brandSlug.replace(/-bike$/, '').replace(/-scooter$/, '')
  const s = type === 'car' ? 'cars' : type === 'bike' ? 'bikes' : 'scooters'
  return `/${clean}-${s}/${modelSlug}/`
}

const TYPE_COLOR: Record<string, string> = { car: '#00D4FF', bike: '#FF6B35', scooter: '#A855F7' }
const TYPE_LABEL: Record<string, string> = { car: 'Car', bike: 'Bike', scooter: 'Scooter' }

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLOR[type] ?? '#8E99A8'
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
      background: `${c}1a`, border: `1px solid ${c}40`, color: c, whiteSpace: 'nowrap', flexShrink: 0,
    }}>{TYPE_LABEL[type] ?? type}</span>
  )
}

export default function SearchBox({ placeholder, autoFocus }: { placeholder: string; autoFocus?: boolean }) {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  // Debounced search
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults(null); setOpen(false); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json() as SearchResults
        setResults(data)
        setOpen(true)
      } catch { setResults(null) }
      finally  { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function go(href: string) {
    setOpen(false); setQuery(''); router.push(href)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* ── Input ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: 10, overflow: 'hidden',
        boxShadow: open ? '0 0 0 2px rgba(0,212,255,0.15)' : 'none',
      }}>
        <span style={{ padding: '0 12px', fontSize: 16, color: '#8E99A8', flexShrink: 0 }}>🔍</span>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && query.trim().length >= 2)
              go(`/search?q=${encodeURIComponent(query.trim())}`)
          }}
          onFocus={() => { if (results && results.total > 0) setOpen(true) }}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#FFFFFF', fontSize: 15, padding: '13px 0',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />
        {loading && (
          <div style={{ padding: '0 12px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 15, height: 15, borderRadius: '50%',
              border: '2px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF',
              animation: 'srch-spin .7s linear infinite',
            }} />
            <style>{`@keyframes srch-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults(null); setOpen(false); inputRef.current?.focus() }}
            style={{ padding: '0 12px', background: 'none', border: 'none', color: '#8E99A8', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >✕</button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && query.trim().length >= 2 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 6,
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          maxHeight: 420, overflowY: 'auto',
        }}>
          {(!results || results.total === 0) ? (
            <div style={{ padding: '22px 16px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Models */}
              {results.models.length > 0 && (
                <div>
                  <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 800, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Models
                  </div>
                  {results.models.map(m => (
                    <button key={m.id} onClick={() => go(modelUrl(m.brands.slug, m.slug, m.type))}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}>
                      <div style={{
                        width: 50, height: 36, borderRadius: 7, flexShrink: 0, position: 'relative',
                        background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {m.thumbnail_url
                          ? <Image src={m.thumbnail_url} alt={m.name} fill style={{ objectFit: 'contain', padding: 3 }} sizes="50px" />
                          : <span style={{ fontSize: 18 }}>{m.type === 'car' ? '🚗' : m.type === 'bike' ? '🏍️' : '🛵'}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#8E99A8', marginBottom: 1 }}>{m.brands.name}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                        {m.price_min && <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 700 }}>from {formatPrice(m.price_min)}</div>}
                      </div>
                      <TypeBadge type={m.type} />
                    </button>
                  ))}
                </div>
              )}

              {/* Brands */}
              {results.brands.length > 0 && (
                <div style={{ borderTop: results.models.length > 0 ? '1px solid rgba(0,212,255,0.08)' : 'none' }}>
                  <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 800, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Brands
                  </div>
                  {results.brands.map(b => (
                    <button key={b.id} onClick={() => go(brandUrl(b.slug, b.type))}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 9, flexShrink: 0, position: 'relative',
                        background: b.logo_url ? '#FFFFFF' : 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.15)',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: b.logo_url ? 4 : 0, boxSizing: 'border-box',
                      }}>
                        {b.logo_url
                          ? <Image src={b.logo_url} alt={b.name} fill style={{ objectFit: 'contain', padding: 4 }} sizes="38px" />
                          : <span style={{ fontSize: 12, fontWeight: 900, color: '#00D4FF', fontFamily: 'Montserrat, sans-serif' }}>{b.name.slice(0, 2).toUpperCase()}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>{b.name}</div>
                        {b.price_min && b.price_max && (
                          <div style={{ fontSize: 11, color: '#8E99A8' }}>{formatPrice(b.price_min)} – {formatPrice(b.price_max)}</div>
                        )}
                      </div>
                      <TypeBadge type={b.type} />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)', padding: '10px 16px' }}>
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => { setOpen(false); setQuery('') }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 600 }}>
                    View all results for &ldquo;{query}&rdquo; →
                  </span>
                  <span style={{ fontSize: 10, color: '#8E99A8' }}>{results.total} found</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
