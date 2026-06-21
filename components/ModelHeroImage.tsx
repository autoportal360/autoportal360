'use client'

import { useState, useEffect, useRef } from 'react'

const INTERVAL = 4500

export default function ModelHeroImage({
  images,
  alt,
  fallback = '🚗',
}: {
  images: string[]
  alt: string
  fallback?: string
}) {
  const [current, setCurrent] = useState(0)
  const touchStart = useRef<number | null>(null)
  const total = images.length

  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % total), INTERVAL)
    return () => clearInterval(id)
  }, [total])

  function prev() { setCurrent(c => (c - 1 + total) % total) }
  function next() { setCurrent(c => (c + 1) % total) }

  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const d = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(d) > 40) (d > 0 ? next : prev)()
    touchStart.current = null
  }

  if (total === 0) {
    return (
      <div className="ap-model-hero-carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' }}>
        {fallback}
      </div>
    )
  }

  return (
    <div className="ap-model-hero-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[current]} alt={alt} loading="eager" />

      {total > 1 && (
        <>
          <button className="ap-model-hero-arrow ap-model-hero-arrow-l" onClick={prev} aria-label="Previous">‹</button>
          <button className="ap-model-hero-arrow ap-model-hero-arrow-r" onClick={next} aria-label="Next">›</button>
          <div className="ap-model-hero-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`ap-model-hero-dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
