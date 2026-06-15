'use client'

import { useState } from 'react'

const PARAS = [
  'AutoPortal360 is India\'s comprehensive automotive research platform, designed to help you make informed decisions when buying a new car, bike, or scooter. Whether you\'re a first-time buyer exploring budget hatchbacks under ₹5 lakh or an enthusiast comparing premium SUVs above ₹30 lakh, our platform provides the unbiased data you need — ex-showroom prices, on-road costs, specifications, mileage figures, safety ratings, and detailed variant comparisons for every model available in India.',
  'The Indian automotive market in 2026 offers more choice than ever before. With over 320 car models from 12+ brands, 280+ bike models, and 120+ scooters available, finding the right vehicle requires careful research. AutoPortal360 simplifies this by organizing every model with standardized specifications, real pricing data sourced directly from manufacturers, and side-by-side comparison tools that highlight the differences that matter most — ground clearance for Indian roads, boot space for family trips, fuel efficiency for daily commutes, and safety features like airbags, ABS, and NCAP ratings.',
  'For car buyers, our budget-based browsing makes it easy to discover options within your price range. The most popular segments in India remain compact SUVs (₹10-15 lakh), where models like the Tata Nexon, Hyundai Venue, Kia Sonet, and Maruti Brezza compete fiercely, and premium hatchbacks (₹6-10 lakh) dominated by the Maruti Swift, Hyundai i20, and Tata Altroz. The electric vehicle segment is growing rapidly, with the Tata Nexon EV leading sales, followed by newer entrants like the Mahindra XUV400 and MG ZS EV.',
  'Two-wheeler buyers benefit equally from our research tools. India\'s bike market spans everything from commuter motorcycles under ₹80,000 (Hero Splendor, Honda Shine) to performance machines above ₹2 lakh (KTM Duke, Royal Enfield Interceptor). The scooter segment has been transformed by electric options from Ola Electric, Ather Energy, and TVS iQube, competing alongside trusted petrol scooters like the Honda Activa and TVS Jupiter.',
  'Beyond research, AutoPortal360 connects you with authorized dealers across India. Our verified dealer directory covers 8+ major cities with 28+ showrooms, and is growing rapidly. Each dealer listing includes phone numbers, addresses, working hours, and Google Maps directions — so you can go from research to showroom visit in minutes.',
  'Every piece of data on AutoPortal360 is updated regularly to reflect the latest manufacturer price revisions, new variant launches, and specification changes. We don\'t accept payment from manufacturers to influence our content or recommendations — what you see is objective automotive data, presented clearly, to help you buy with confidence.',
]

export default function HomeSeoContent() {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? PARAS : PARAS.slice(0, 1)

  return (
    <section style={{
      padding: '36px 24px',
      borderTop: '1px solid rgba(0,212,255,0.07)',
      background: 'transparent',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800,
          color: '#fff', marginBottom: '16px', letterSpacing: '-0.4px',
        }}>
          Your Complete Guide to Buying Cars, Bikes &amp; Scooters in India
        </h2>

        <div style={{ position: 'relative' }}>
          {visible.map((para, i) => (
            <p key={i} className="ap-seo-para">{para}</p>
          ))}
          {!expanded && <div className="ap-seo-fade" style={{ background: 'linear-gradient(transparent,#06142D)' }} />}
        </div>

        <button className="ap-seo-toggle" onClick={() => setExpanded(v => !v)}>
          {expanded ? 'Show Less ↑' : 'Read More ↓'}
        </button>
      </div>
    </section>
  )
}
