'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type GalleryImage = {
  url: string
  alt: string
  category: string
}

interface Props {
  images: GalleryImage[]
}

const CAT_LABEL: Record<string, string> = {
  exterior:   'Exterior',
  interior:   'Interior',
  colour:     'Colour',
  detail:     'Detail',
  'road-test': 'Road Test',
}

export default function ImageGallery({ images }: Props) {
  const [activeTab,     setActiveTab]     = useState('all')
  const [lightboxOpen,  setLightboxOpen]  = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const thumbsRef   = useRef<HTMLDivElement>(null)

  const categories = Array.from(new Set(images.map(img => img.category)))
  const filtered   = activeTab === 'all' ? images : images.filter(img => img.category === activeTab)

  const open  = useCallback((idx: number) => { setLightboxIndex(idx); setLightboxOpen(true) }, [])
  const close = useCallback(() => setLightboxOpen(false), [])
  const prev  = useCallback(() => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length])
  const next  = useCallback(() => setLightboxIndex(i => (i + 1) % filtered.length),                   [filtered.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close()
      if (e.key === 'ArrowRight')  next()
      if (e.key === 'ArrowLeft')   prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, close, next, prev])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  // Scroll active thumb into view
  useEffect(() => {
    if (!thumbsRef.current) return
    const el = thumbsRef.current.children[lightboxIndex] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [lightboxIndex])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  if (images.length === 0) {
    return (
      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
        <p style={{ color: '#8E99A8', fontSize: '14px', margin: 0 }}>Images coming soon. Check back after the next update.</p>
      </div>
    )
  }

  const tabBtn = (cat: string, label: string, count: number) => (
    <button
      key={cat}
      onClick={() => { setActiveTab(cat); setLightboxIndex(0) }}
      style={{
        background:  activeTab === cat ? '#00D4FF' : 'rgba(0,212,255,0.08)',
        border:      `1px solid ${activeTab === cat ? '#00D4FF' : 'rgba(0,212,255,0.2)'}`,
        color:       activeTab === cat ? '#06142D' : '#00D4FF',
        fontWeight:  700, fontSize: '12px',
        padding:     '5px 14px', borderRadius: '9999px',
        cursor:      'pointer', transition: 'all .15s',
      }}
    >
      {label} ({count})
    </button>
  )

  return (
    <>
      {/* Category tabs — only shown when there are multiple categories */}
      {categories.length > 1 && (
        <div className="ap-gallery-tabs">
          {tabBtn('all', 'All', images.length)}
          {categories.map(cat => tabBtn(cat, CAT_LABEL[cat] ?? cat, images.filter(i => i.category === cat).length))}
        </div>
      )}

      {/* Grid */}
      <div className="ap-gallery-grid">
        {filtered.map((img, idx) => (
          <div
            key={`${activeTab}-${idx}`}
            className={`ap-gallery-item${idx === 0 && filtered.length > 1 ? ' ap-gallery-featured' : ''}`}
            onClick={() => open(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} loading={idx < 3 ? 'eager' : 'lazy'} />
            {idx === 0 && filtered.length > 1 && (
              <span className="ap-gallery-count">{filtered.length} photos</span>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="ap-lightbox"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button className="ap-lightbox-close" onClick={close} aria-label="Close">✕</button>

          {filtered.length > 1 && (
            <button
              className="ap-lightbox-nav ap-lightbox-prev"
              onClick={e => { e.stopPropagation(); prev() }}
              aria-label="Previous"
            >‹</button>
          )}

          <div className="ap-lightbox-img-wrap" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={filtered[lightboxIndex].url} alt={filtered[lightboxIndex].alt} />
          </div>

          {filtered.length > 1 && (
            <button
              className="ap-lightbox-nav ap-lightbox-next"
              onClick={e => { e.stopPropagation(); next() }}
              aria-label="Next"
            >›</button>
          )}

          <div className="ap-lightbox-counter">{lightboxIndex + 1} / {filtered.length}</div>

          {filtered.length > 1 && (
            <div className="ap-lightbox-thumbs" ref={thumbsRef} onClick={e => e.stopPropagation()}>
              {filtered.map((thumb, ti) => (
                <div
                  key={ti}
                  className={`ap-lightbox-thumb${ti === lightboxIndex ? ' active' : ''}`}
                  onClick={() => setLightboxIndex(ti)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb.url} alt={thumb.alt} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
