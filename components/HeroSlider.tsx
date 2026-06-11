'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPriceRange, formatPrice } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroAutoSlide = {
  type: 'auto'
  brandName: string
  brandSlug: string
  brandType: 'car' | 'bike' | 'scooter'
  modelName: string
  modelSlug: string
  priceMin: number | null
  priceMax: number | null
  fuelTypes: string[]
  thumbnail: string | null
}

export type HeroOemSlide = {
  type: 'oem'
  advertiser: string | null
  bannerUrl: string
  destinationUrl: string | null
  impressionPixel: string | null
  clickTrackingUrl: string | null
  headline: string | null
  subline: string | null
  ctaText: string | null
}

export type HeroSlide = HeroAutoSlide | HeroOemSlide

// ─── Auto slide ───────────────────────────────────────────────────────────────

function AutoSlide({ slide, isMobile }: { slide: HeroAutoSlide; isMobile: boolean }) {
  const suffix = slide.brandType === 'car' ? 'cars' : slide.brandType === 'bike' ? 'bikes' : 'scooters'
  const modelHref = `/${slide.brandSlug}-${suffix}/${slide.modelSlug}/`
  const priceLabel = slide.priceMin && slide.priceMax
    ? formatPriceRange(slide.priceMin, slide.priceMax)
    : slide.priceMin
    ? `From ${formatPrice(slide.priceMin)}`
    : null
  const typeEmoji = slide.brandType === 'bike' ? '🏍️' : slide.brandType === 'scooter' ? '🛵' : '🚗'
  const uniqueFuels = [...new Set(slide.fuelTypes.filter(Boolean))]

  // ── Mobile: column (image top, text bottom) ──
  if (isMobile) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,#0d2855 0%,#06142D 100%)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Image — top section */}
        <div style={{ height: '110px', position: 'relative', flexShrink: 0 }}>
          {slide.thumbnail ? (
            <Image
              src={slide.thumbnail}
              alt={`${slide.brandName} ${slide.modelName}`}
              fill
              sizes="100vw"
              style={{
                objectFit: 'contain', objectPosition: 'center bottom',
                padding: '8px 32px 0',
                filter: 'drop-shadow(0 4px 16px rgba(0,212,255,0.15))',
              }}
              priority
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '60px',
            }}>
              {typeEmoji}
            </div>
          )}
          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(transparent,#06142D)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Text — bottom section */}
        <div style={{ flex: 1, padding: '8px 16px 10px', overflow: 'hidden', zIndex: 2 }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: '#00D4FF',
            fontFamily: 'Montserrat,sans-serif', marginBottom: '4px',
          }}>
            {slide.brandName}
          </div>

          <h2 style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: '20px',
            fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px',
            color: '#FFFFFF', margin: '0 0 5px',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {slide.modelName}
          </h2>

          {priceLabel && (
            <div style={{
              fontSize: '13px', fontWeight: 800, color: '#00D4FF',
              fontFamily: 'Montserrat,sans-serif', marginBottom: '6px',
            }}>
              {priceLabel}
            </div>
          )}

          {uniqueFuels.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '8px' }}>
              {uniqueFuels.slice(0, 2).map(f => (
                <span key={f} style={{
                  fontSize: 9, fontWeight: 700,
                  background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
                  color: '#00D4FF', padding: '2px 8px', borderRadius: 20,
                  fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase',
                }}>{f}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={modelHref} style={{
              background: '#00D4FF', color: '#06142D',
              fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
              fontSize: '11px', padding: '7px 14px',
              borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Get Offers →
            </Link>
            <Link href={modelHref} style={{
              background: 'transparent', border: '1px solid rgba(0,212,255,0.35)',
              color: '#C0C0C0', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
              fontSize: '11px', padding: '7px 14px',
              borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop: row (text left, image right) ──
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(135deg,#06142D 0%,#0d2855 55%,#091e3f 100%)',
      display: 'flex', alignItems: 'center', overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', right: '35%', top: '50%',
        transform: 'translate(50%,-50%)',
        width: '40vw', height: '40vw', maxWidth: 400, maxHeight: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(0,212,255,0.08) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left: text */}
      <div style={{ flex: '0 0 55%', padding: 'clamp(20px,4vw,64px)', zIndex: 2, minWidth: 0 }}>
        <div style={{
          fontSize: 'clamp(9px,1.2vw,11px)', fontWeight: 800, letterSpacing: '2px',
          textTransform: 'uppercase', color: '#00D4FF',
          fontFamily: 'Montserrat,sans-serif', marginBottom: '8px',
        }}>
          {slide.brandName}
        </div>

        <h2 style={{
          fontFamily: 'Montserrat,sans-serif',
          fontSize: 'clamp(22px,3.8vw,52px)',
          fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px',
          color: '#FFFFFF', margin: '0 0 12px', overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
        }}>
          {slide.modelName}
        </h2>

        {priceLabel && (
          <div style={{
            fontSize: 'clamp(13px,1.8vw,20px)', fontWeight: 800,
            color: '#00D4FF', fontFamily: 'Montserrat,sans-serif', marginBottom: '12px',
          }}>
            {priceLabel}
          </div>
        )}

        {uniqueFuels.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '20px' }}>
            {uniqueFuels.slice(0, 3).map(f => (
              <span key={f} style={{
                fontSize: 'clamp(9px,1.1vw,11px)', fontWeight: 700,
                background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
                color: '#00D4FF', padding: '3px 10px', borderRadius: 20,
                fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>{f}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={modelHref} style={{
            background: '#00D4FF', color: '#06142D',
            fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
            fontSize: 'clamp(11px,1.3vw,14px)',
            padding: 'clamp(8px,1.2vw,12px) clamp(14px,2vw,24px)',
            borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Get Offers →
          </Link>
          <Link href={modelHref} style={{
            background: 'transparent', border: '1px solid rgba(0,212,255,0.35)',
            color: '#C0C0C0', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
            fontSize: 'clamp(11px,1.3vw,14px)',
            padding: 'clamp(8px,1.2vw,12px) clamp(14px,2vw,24px)',
            borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            View Details
          </Link>
        </div>
      </div>

      {/* Right: image */}
      <div style={{ flex: '0 0 45%', position: 'relative', height: '100%', overflow: 'hidden' }}>
        {slide.thumbnail ? (
          <Image
            src={slide.thumbnail}
            alt={`${slide.brandName} ${slide.modelName}`}
            fill
            sizes="45vw"
            style={{
              objectFit: 'contain', objectPosition: 'center bottom',
              padding: 'clamp(16px,3vw,40px) clamp(8px,2vw,24px) 0',
              filter: 'drop-shadow(0 8px 32px rgba(0,212,255,0.12))',
            }}
            priority
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(60px,10vw,120px)',
          }}>
            {typeEmoji}
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(transparent,rgba(6,20,45,0.6))',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

// ─── OEM slide ────────────────────────────────────────────────────────────────

function OemSlide({ slide, isMobile }: { slide: HeroOemSlide; isMobile: boolean }) {
  function handleClick() {
    if (slide.clickTrackingUrl) {
      const t = new window.Image(); t.src = slide.clickTrackingUrl
    }
    if (slide.destinationUrl) {
      window.open(slide.destinationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute', inset: 0,
        cursor: slide.destinationUrl ? 'pointer' : 'default',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#06142D 0%,#0A1F44 100%)',
      }}
    >
      {slide.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.bannerUrl}
          alt={slide.advertiser ?? 'Advertisement'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg,rgba(6,20,45,0.75) 0%,rgba(6,20,45,0.15) 100%)',
      }} />

      {(slide.headline || slide.subline || slide.ctaText) && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          padding: isMobile ? '0 20px' : 'clamp(20px,4vw,64px)',
        }}>
          <div style={{ maxWidth: isMobile ? '90%' : '55%' }}>
            {slide.headline && (
              <h2 style={{
                fontFamily: 'Montserrat,sans-serif',
                fontSize: isMobile ? '18px' : 'clamp(20px,3.2vw,44px)',
                fontWeight: 900, lineHeight: 1.1, color: '#FFFFFF',
                margin: '0 0 8px',
              }}>
                {slide.headline}
              </h2>
            )}
            {slide.subline && !isMobile && (
              <p style={{
                color: '#C0C0C0', margin: '0 0 18px',
                fontSize: 'clamp(12px,1.4vw,16px)', lineHeight: 1.6,
              }}>
                {slide.subline}
              </p>
            )}
            {slide.ctaText && (
              <button
                onClick={e => { e.stopPropagation(); handleClick() }}
                style={{
                  background: '#00D4FF', color: '#06142D',
                  fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
                  fontSize: isMobile ? '12px' : 'clamp(11px,1.3vw,14px)',
                  padding: isMobile ? '8px 16px' : 'clamp(8px,1.2vw,12px) clamp(16px,2.2vw,28px)',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  marginTop: isMobile ? '8px' : 0,
                }}
              >
                {slide.ctaText}
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', top: 14, right: 14,
        background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
        color: '#FFFFFF', fontSize: 9, fontWeight: 800,
        padding: '2px 8px', borderRadius: 4,
        letterSpacing: '1.5px', fontFamily: 'system-ui,sans-serif',
      }}>
        AD
      </div>
    </div>
  )
}

// ─── Arrow button ─────────────────────────────────────────────────────────────

function Arrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Previous slide' : 'Next slide'}
      style={{
        position: 'absolute', top: '50%',
        [dir]: 8,
        transform: 'translateY(-50%)',
        zIndex: 20, background: 'rgba(6,20,45,0.65)',
        border: '1px solid rgba(0,212,255,0.25)',
        color: '#FFFFFF', width: 'clamp(28px,3.5vw,40px)', height: 'clamp(28px,3.5vw,40px)',
        borderRadius: '50%', cursor: 'pointer',
        fontSize: 'clamp(14px,2vw,20px)', lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {dir === 'left' ? '‹' : '›'}
    </button>
  )
}

// ─── Main slider ──────────────────────────────────────────────────────────────

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const total = slides.length

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const go = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total)
  }, [total])

  const next = useCallback(() => go(current + 1), [current, go])
  const prev = useCallback(() => go(current - 1), [current, go])

  useEffect(() => {
    if (paused || total <= 1) return
    timerRef.current = setInterval(next, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, next, total])

  useEffect(() => {
    const slide = slides[current]
    if (slide?.type === 'oem' && slide.impressionPixel) {
      const img = new window.Image(); img.src = slide.impressionPixel
    }
  }, [current, slides])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev()
    touchStartX.current = null
  }

  if (total === 0) return null

  return (
    <div
      style={{
        position: 'relative', width: '100%', maxWidth: '100vw',
        overflow: 'hidden', userSelect: 'none',
        background: 'linear-gradient(135deg,#06142D 0%,#0A1F44 100%)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide viewport */}
      <div style={{
        position: 'relative',
        height: isMobile ? '280px' : 'clamp(300px,38vw,420px)',
        overflow: 'hidden',
        width: '100%',
      }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.6s ease',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            {slide.type === 'auto'
              ? <AutoSlide slide={slide} isMobile={isMobile} />
              : <OemSlide slide={slide} isMobile={isMobile} />
            }
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <Arrow dir="left" onClick={prev} />
          <Arrow dir="right" onClick={next} />
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 5, zIndex: 20,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 20 : 7, height: 7,
                borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                background: i === current ? '#00D4FF' : 'rgba(255,255,255,0.35)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
