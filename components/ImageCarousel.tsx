'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GalleryImage } from './ImageGallery'

const CATEGORY_ORDER = ['exterior', 'interior', 'colour', 'detail', 'road-test']

const CAT_LABEL: Record<string, string> = {
  exterior:    'Exterior',
  interior:    'Interior',
  colour:      'Colour',
  detail:      'Detail',
  'road-test': 'Road Test',
}

const INTERVAL     = 4000
const RESUME_DELAY = 6000

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIdx,
  onClose,
}: {
  images: GalleryImage[]
  startIdx: number
  onClose: () => void
}) {
  const [idx, setIdx]  = useState(startIdx)
  const thumbsRef      = useRef<HTMLDivElement>(null)
  const touchStart     = useRef<number | null>(null)
  const total          = images.length

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, next, prev])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const el = thumbsRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [idx])

  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const d = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(d) > 50) (d > 0 ? next : prev)()
    touchStart.current = null
  }

  return (
    <div className="ap-lightbox" onClick={onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button className="ap-lightbox-close" onClick={onClose} aria-label="Close">✕</button>

      {total > 1 && (
        <button
          className="ap-lightbox-nav ap-lightbox-prev"
          onClick={e => { e.stopPropagation(); prev() }}
          aria-label="Previous"
        >‹</button>
      )}

      <div className="ap-lightbox-img-wrap" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[idx].url} alt={images[idx].alt} />
      </div>

      {total > 1 && (
        <button
          className="ap-lightbox-nav ap-lightbox-next"
          onClick={e => { e.stopPropagation(); next() }}
          aria-label="Next"
        >›</button>
      )}

      <div className="ap-lightbox-counter">{idx + 1} / {total}</div>

      {total > 1 && (
        <div className="ap-lightbox-thumbs" ref={thumbsRef} onClick={e => e.stopPropagation()}>
          {images.map((img, ti) => (
            <div
              key={ti}
              className={`ap-lightbox-thumb${ti === idx ? ' active' : ''}`}
              onClick={() => setIdx(ti)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single category carousel ─────────────────────────────────────────────────

function SingleCarousel({ images, title }: { images: GalleryImage[]; title: string }) {
  const [current,     setCurrent]     = useState(0)
  const [isPaused,    setIsPaused]    = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbsRef   = useRef<HTMLDivElement>(null)
  const touchStart  = useRef<number | null>(null)
  const total       = images.length

  const scrollThumb = useCallback((idx: number) => {
    requestAnimationFrame(() => {
      const el = thumbsRef.current?.children[idx] as HTMLElement | undefined
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }, [])

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    scrollThumb(idx)
  }, [scrollThumb])

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo])
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo])

  useEffect(() => {
    if (total <= 1 || isPaused) return
    const id = setInterval(() => {
      setCurrent(c => {
        const n = (c + 1) % total
        scrollThumb(n)
        return n
      })
    }, INTERVAL)
    return () => clearInterval(id)
  }, [total, isPaused, scrollThumb])

  function handleMouseEnter() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    setIsPaused(true)
  }
  function handleMouseLeave() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setIsPaused(false), RESUME_DELAY)
  }

  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const d = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(d) > 50) (d > 0 ? next : prev)()
    touchStart.current = null
  }

  if (total === 0) return null

  return (
    <div className="ap-gallery-section">
      <h3 className="ap-gallery-section-title">
        {title}
        <span className="ap-gallery-section-count">({total} photos)</span>
      </h3>

      <div className="ap-carousel" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Main image */}
        <div
          className="ap-carousel-main"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightboxIdx(current)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[current].url} alt={images[current].alt} loading="eager" />

          {total > 1 && (
            <>
              <button
                className="ap-carousel-arrow ap-carousel-arrow-prev"
                onClick={e => { e.stopPropagation(); prev() }}
                aria-label="Previous"
              >‹</button>
              <button
                className="ap-carousel-arrow ap-carousel-arrow-next"
                onClick={e => { e.stopPropagation(); next() }}
                aria-label="Next"
              >›</button>
            </>
          )}

          <div className="ap-carousel-counter">{current + 1} / {total}</div>

          <button
            className="ap-carousel-expand"
            onClick={e => { e.stopPropagation(); setLightboxIdx(current) }}
            aria-label="View fullscreen"
          >
            ⛶ View Full
          </button>

          {total > 1 && (
            <div className="ap-carousel-progress">
              <div
                key={current}
                className={`ap-carousel-progress-bar${isPaused ? ' paused' : ''}`}
              />
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="ap-carousel-thumbs" ref={thumbsRef}>
            {images.map((img, ti) => (
              <div
                key={ti}
                className={`ap-carousel-thumb${ti === current ? ' active' : ''}`}
                onClick={() => { setIsPaused(true); goTo(ti) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  )
}

// ─── Main export: gallery with category tabs + stacked carousels ──────────────

export default function ImageCarousel({ images }: { images: GalleryImage[] }) {
  const categories = CATEGORY_ORDER.filter(cat => images.some(i => i.category === cat))
  const grouped: Record<string, GalleryImage[]> = {}
  for (const cat of categories) grouped[cat] = images.filter(i => i.category === cat)

  const [activeTab, setActiveTab] = useState('all')

  if (images.length === 0) {
    return (
      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)',
        borderRadius: '16px', padding: '64px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
        <p style={{ color: '#8E99A8', fontSize: '14px', margin: 0 }}>
          Images coming soon. Check back after the next update.
        </p>
      </div>
    )
  }

  const tabBtn = (key: string, label: string, count: number) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      style={{
        background:  activeTab === key ? '#00D4FF' : 'rgba(0,212,255,0.08)',
        border:      `1px solid ${activeTab === key ? '#00D4FF' : 'rgba(0,212,255,0.2)'}`,
        color:       activeTab === key ? '#06142D' : '#00D4FF',
        fontWeight:  700, fontSize: '12px',
        padding:     '5px 14px', borderRadius: '9999px',
        cursor:      'pointer', transition: 'all .15s',
      }}
    >
      {label} ({count})
    </button>
  )

  const visibleCats = activeTab === 'all' ? categories : (grouped[activeTab] ? [activeTab] : [])

  return (
    <>
      {categories.length > 1 && (
        <div className="ap-gallery-tabs">
          {tabBtn('all', 'All', images.length)}
          {categories.map(cat => tabBtn(cat, CAT_LABEL[cat] ?? cat, grouped[cat].length))}
        </div>
      )}

      {visibleCats.map(cat => (
        <SingleCarousel key={`${cat}-${activeTab}`} images={grouped[cat]} title={CAT_LABEL[cat] ?? cat} />
      ))}
    </>
  )
}
