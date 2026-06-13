'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBox from './SearchBox'

const POPULAR = [
  'Tata Punch',
  'Maruti Swift',
  'Royal Enfield',
  'Honda Activa',
  'Hyundai Creta',
  'KTM Duke',
]

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [hasInput, setHasInput] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  function goPopular(term: string) {
    onClose()
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(6,20,45,0.93)', backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '72px 20px 20px',
      }}
    >
      <div
        ref={wrapperRef}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 600 }}
      >
        <p style={{
          textAlign: 'center', fontSize: 11, color: '#445', letterSpacing: '0.8px',
          marginBottom: 14, textTransform: 'uppercase',
        }}>
          Press{' '}
          <kbd style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, padding: '1px 6px', fontSize: 10,
          }}>Esc</kbd>{' '}
          to close
        </p>

        {/* SearchBox — we track whether it has input via a wrapper trick */}
        <div onChange={(e) => {
          const val = (e.target as HTMLInputElement).value
          setHasInput(val.length >= 2)
        }}>
          <SearchBox placeholder="Search cars, bikes, brands, models…" autoFocus />
        </div>

        {/* Popular searches — only when no input yet */}
        {!hasInput && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 11, color: '#8E99A8', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10,
            }}>
              Popular searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {POPULAR.map(term => (
                <button
                  key={term}
                  onClick={() => goPopular(term)}
                  style={{
                    background: 'rgba(0,212,255,0.07)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: '#C0C0C0', padding: '7px 14px', borderRadius: 20,
                    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,212,255,0.15)'
                    e.currentTarget.style.color = '#00D4FF'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,212,255,0.07)'
                    e.currentTarget.style.color = '#C0C0C0'
                  }}
                >
                  🔍 {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
