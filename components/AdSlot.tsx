'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface AdSlotProps {
  zone: 'hero-billboard' | 'mid-feed-1' | 'mid-feed-2' | 'in-feed-native' | 'pre-footer'
}

interface AdData {
  headline:   string
  subline:    string
  cta:        string
  href:       string
  advertiser: string
  bg:         string
  customHtml: string | null
  adType:     string
}

// Hardcoded fallbacks — used until DB loads, and if zone is inactive/missing
const FALLBACK: Record<string, AdData> = {
  'hero-billboard': {
    headline:   '🛡️ Car Insurance from ₹2,094/year',
    subline:    'Zero depreciation · Instant policy · Cashless garages across India',
    cta:        'Get Free Quote →',
    href:       'https://www.acko.com/?utm_source=autoportal360&utm_medium=hero_banner&utm_campaign=car_insurance',
    advertiser: 'Acko Insurance',
    bg:         'linear-gradient(135deg,#0A1F44 0%,#0d3a6e 60%,rgba(0,212,255,0.1) 100%)',
    customHtml: null,
    adType:     'affiliate',
  },
  'mid-feed-1': {
    headline:   '💰 Compare Car Loans — EMI from ₹1,499/Lakh',
    subline:    'SBI · HDFC · ICICI · Axis — Best rates in 2 minutes',
    cta:        'Check EMI →',
    href:       'https://www.policybazaar.com/motor-insurance/?utm_source=autoportal360&utm_medium=mid_banner_1',
    advertiser: 'Policybazaar',
    bg:         'linear-gradient(90deg,#06142D,#0A2A5E)',
    customHtml: null,
    adType:     'affiliate',
  },
  'mid-feed-2': {
    headline:   '🏍️ Two-Wheeler Loan — No Processing Fee',
    subline:    'Get bike loan approved in 24 hours · 100+ lender network',
    cta:        'Apply Now →',
    href:       'https://www.bankbazaar.com/two-wheeler-loan.html?utm_source=autoportal360&utm_medium=mid_banner_2',
    advertiser: 'BankBazaar',
    bg:         'linear-gradient(90deg,#06142D,#0d2550)',
    customHtml: null,
    adType:     'affiliate',
  },
  'in-feed-native': {
    headline:   '⚡ EV Insurance — Designed for Electric',
    subline:    'Covers battery · Charging damage · Roadside assist',
    cta:        'Explore →',
    href:       'https://www.acko.com/electric-car-insurance/?utm_source=autoportal360&utm_medium=in_feed_native',
    advertiser: 'Acko',
    bg:         'linear-gradient(135deg,#111111,#1a1f2e)',
    customHtml: null,
    adType:     'affiliate',
  },
  'pre-footer': {
    headline:   '🚗 Get Pre-Approved Car Loan in 2 Minutes',
    subline:    'No documents needed · Starting 7.9% p.a.',
    cta:        'Check Eligibility →',
    href:       'https://www.bankbazaar.com/car-loan.html?utm_source=autoportal360&utm_medium=pre_footer',
    advertiser: 'BankBazaar',
    bg:         'linear-gradient(90deg,#0A1F44,#06142D)',
    customHtml: null,
    adType:     'affiliate',
  },
}

export default function AdSlot({ zone }: AdSlotProps) {
  const [ad, setAd] = useState<AdData>(FALLBACK[zone])

  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    sb.from('ad_campaigns')
      .select('headline,subline,cta_text,destination_url,advertiser,custom_html,ad_type,is_active')
      .eq('zone', zone)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || !data.is_active) return
        const r = data as Record<string, unknown>
        if (r.ad_type === 'adsense' || r.ad_type === 'custom') {
          setAd(prev => ({ ...prev, adType: r.ad_type as string, customHtml: (r.custom_html as string) ?? null }))
          return
        }
        setAd(prev => ({
          ...prev,
          headline:   (r.headline    as string) || prev.headline,
          subline:    (r.subline     as string) || prev.subline,
          cta:        (r.cta_text    as string) || prev.cta,
          href:       (r.destination_url as string) || prev.href,
          advertiser: (r.advertiser  as string) || prev.advertiser,
          adType:     (r.ad_type     as string) || prev.adType,
          customHtml: null,
        }))
      })
      .catch(() => { /* silently keep fallback */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone])

  if (!ad) return null

  // ── Custom / AdSense HTML ─────────────────────────────────────────────────────
  if ((ad.adType === 'adsense' || ad.adType === 'custom') && ad.customHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: ad.customHtml }}
        style={{ width: '100%' }}
      />
    )
  }

  // ── IN-FEED NATIVE — card style ───────────────────────────────────────────────
  if (zone === 'in-feed-native') {
    return (
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        style={{
          background: ad.bg,
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '14px',
          overflow: 'hidden',
          textDecoration: 'none',
          display: 'block',
          position: 'relative',
        }}
      >
        <div style={{
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,0,0,0.5))',
        }}>🛡️</div>
        <div style={{ padding: '11px 13px 13px' }}>
          <div style={{
            fontSize: '10px', color: '#00D4FF',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            marginBottom: '3px', fontWeight: 700,
          }}>Sponsored</div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px', fontWeight: 800,
            color: '#FFFFFF', marginBottom: '4px', lineHeight: 1.3,
          }}>{ad.headline}</div>
          <div style={{
            fontSize: '11px', color: '#8E99A8',
            marginBottom: '8px', lineHeight: 1.4,
          }}>{ad.subline}</div>
          <span style={{
            background: '#00D4FF', color: '#06142D',
            fontWeight: 800, fontSize: '11px',
            padding: '5px 12px', borderRadius: '6px',
            fontFamily: 'Montserrat, sans-serif',
          }}>{ad.cta}</span>
        </div>
        <span style={{
          position: 'absolute', top: '6px', right: '8px',
          fontSize: '9px', color: '#8E99A8',
          background: 'rgba(0,0,0,0.4)',
          padding: '1px 6px', borderRadius: '4px',
        }}>Ad · {ad.advertiser}</span>
      </a>
    )
  }

  // ── HERO BILLBOARD — full-width tall banner ───────────────────────────────────
  if (zone === 'hero-billboard') {
    return (
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        style={{
          display: 'block',
          background: ad.bg,
          borderBottom: '1px solid rgba(0,212,255,0.15)',
          padding: '14px 24px',
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px', fontWeight: 900,
              color: '#FFFFFF', marginBottom: '4px',
            }}>{ad.headline}</div>
            <div style={{ fontSize: '13px', color: '#C0C0C0' }}>{ad.subline}</div>
          </div>
          <span style={{
            background: '#00D4FF', color: '#06142D',
            fontWeight: 900, fontSize: '13px',
            padding: '10px 22px', borderRadius: '8px',
            fontFamily: 'Montserrat, sans-serif',
            whiteSpace: 'nowrap',
          }}>{ad.cta}</span>
        </div>
        <span style={{
          position: 'absolute', top: '6px', right: '8px',
          fontSize: '9px', color: '#8E99A8',
          background: 'rgba(0,0,0,0.3)',
          padding: '1px 6px', borderRadius: '4px',
        }}>Ad · {ad.advertiser}</span>
      </a>
    )
  }

  // ── LEADERBOARD STRIP — mid-feed-1, mid-feed-2, pre-footer ───────────────────
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      style={{
        display: 'block',
        background: ad.bg,
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '12px',
        padding: '16px 20px',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '15px', fontWeight: 800,
            color: '#FFFFFF', marginBottom: '3px',
          }}>{ad.headline}</div>
          <div style={{ fontSize: '12px', color: '#C0C0C0' }}>{ad.subline}</div>
        </div>
        <span style={{
          background: '#00D4FF', color: '#06142D',
          fontWeight: 900, fontSize: '12px',
          padding: '9px 20px', borderRadius: '8px',
          fontFamily: 'Montserrat, sans-serif',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>{ad.cta}</span>
      </div>
      <span style={{
        position: 'absolute', top: '6px', right: '8px',
        fontSize: '9px', color: '#8E99A8',
        background: 'rgba(0,0,0,0.3)',
        padding: '1px 6px', borderRadius: '4px',
      }}>Ad · {ad.advertiser}</span>
    </a>
  )
}
