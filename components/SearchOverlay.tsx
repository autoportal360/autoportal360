'use client'

import { useEffect } from 'react'
import SearchBox from './SearchBox'

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

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
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 620 }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#555', letterSpacing: '0.8px', marginBottom: 14, textTransform: 'uppercase' }}>
          Press <kbd style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>Esc</kbd> to close
        </p>
        <SearchBox placeholder="Search cars, bikes, brands, models…" autoFocus />
      </div>
    </div>
  )
}
