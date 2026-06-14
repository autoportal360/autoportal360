import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About AutoPortal360 — India\'s Automotive Research Portal',
  description: 'AutoPortal360 is India\'s independent automotive research portal helping car, bike and scooter buyers make informed decisions with unbiased reviews, real pricing, and a verified dealer network.',
  alternates: { canonical: 'https://autoportal360.vercel.app/about/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AutoPortal360',
  url: 'https://autoportal360.vercel.app',
  description: 'India\'s independent automotive research portal for cars, bikes and scooters',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chandigarh',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@autoportal360.com',
    contactType: 'customer support',
  },
}

const COVERS = [
  {
    icon: '🚗',
    title: 'Cars',
    desc: 'New car launches, ex-showroom prices across cities, detailed specs, real-world mileage data, feature comparisons, and EMI calculators — everything you need before buying.',
  },
  {
    icon: '🏍️',
    title: 'Bikes',
    desc: 'Motorcycles from 100cc commuters to 1200cc performance machines. Engine specs, real-world performance reviews, mileage benchmarks, and brand-by-brand comparisons.',
  },
  {
    icon: '🛵',
    title: 'Scooters',
    desc: 'Electric and petrol scooters for city commuters. Range tests, charging infrastructure guides, price-to-feature comparisons, and maintenance cost breakdowns.',
  },
]

const FEATURES = [
  {
    icon: '✅',
    title: 'Verified Dealer Network',
    desc: 'Every listing is cross-checked against manufacturer records. Dealers with fake contact details or unverified addresses are removed.',
  },
  {
    icon: '⚖️',
    title: 'Unbiased Research',
    desc: 'We have no advertising relationships with manufacturers. Our reviews and comparisons are editorially independent.',
  },
  {
    icon: '💰',
    title: 'Real Pricing Data',
    desc: 'Ex-showroom, on-road estimates, insurance, and RTO charges — broken down city by city so you know exactly what you\'ll pay.',
  },
  {
    icon: '🔄',
    title: 'All Vehicle Types',
    desc: 'Cars, motorcycles, and scooters under one roof. Compare across categories — electric vs petrol, car vs scooter — on a single platform.',
  },
]

const STATS = [
  { value: '28+',  label: 'Verified Dealers' },
  { value: '8+',   label: 'Cities Covered' },
  { value: '9+',   label: 'Brands Listed' },
  { value: '3',    label: 'Vehicle Types' },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: '#06142D', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ background: '#0A1F44', borderBottom: '1px solid #1e3a6e' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 24px' }}>
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
              <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
              <span style={{ color: '#444' }}>›</span>
              <span className="text-white">About Us</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section style={{ background: '#0A1F44', padding: '3rem 1.5rem 3.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="flex items-center mb-6" style={{ gap: '1.25rem' }}>
              <div className="ap-avatar-xl" style={{ userSelect: 'none' }}>A</div>
              <div>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: '.375rem' }}>
                  About AutoPortal360
                </h1>
                <p style={{ color: '#00D4FF', fontWeight: 600, fontSize: '1.1rem' }}>
                  India's Independent Automotive Research Portal
                </p>
              </div>
            </div>
            <p style={{ color: '#C0C0C0', fontSize: '1rem', lineHeight: 1.75, maxWidth: '680px' }}>
              We help Indian buyers research cars, bikes, and scooters without the noise. No dealer pressure,
              no manufacturer bias — just verified data, honest comparisons, and a trusted dealer network
              spanning 8+ cities.
            </p>
          </div>
        </section>

        {/* Body */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {/* Mission */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              Our Mission
            </h2>
            <div className="ap-card-p5">
              <p style={{ color: '#C0C0C0', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1rem' }}>
                Buying a vehicle in India is one of the most significant financial decisions a household makes.
                Yet most research tools are cluttered with ads, filled with outdated specs, or secretly
                sponsored by the brands they review.
              </p>
              <p style={{ color: '#C0C0C0', fontSize: '1rem', lineHeight: 1.8 }}>
                AutoPortal360 exists to fix that. Our mission is to give every Indian buyer — whether
                they're choosing a first scooter or upgrading to a premium car — access to accurate,
                unbiased, and comprehensive information so they can make confident decisions.
              </p>
            </div>
          </section>

          {/* What We Cover */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              What We Cover
            </h2>
            <div className="ap-grid-3">
              {COVERS.map(c => (
                <div key={c.title} className="ap-card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{c.icon}</div>
                  <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '.5rem' }}>
                    {c.title}
                  </h3>
                  <p style={{ color: '#C0C0C0', fontSize: '.875rem', lineHeight: 1.65 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              Why Choose AutoPortal360
            </h2>
            <div className="ap-grid-4">
              {FEATURES.map(f => (
                <div key={f.title} className="ap-card" style={{ padding: '1.25rem' }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '.625rem',
                    background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem', marginBottom: '.875rem',
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff', fontSize: '.9375rem', marginBottom: '.5rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ color: '#C0C0C0', fontSize: '.8125rem', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats bar */}
          <section style={{ marginBottom: '3rem' }}>
            <div className="ap-stat-group" style={{ justifyContent: 'center' }}>
              {STATS.map(s => (
                <div key={s.label} className="ap-stat" style={{ minWidth: '110px' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: '#00D4FF', fontFamily: 'Montserrat, sans-serif' }}>
                    {s.value}
                  </p>
                  <p style={{ color: '#C0C0C0', fontSize: '.75rem', marginTop: '.25rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Company info */}
          <section>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              About the Company
            </h2>
            <div className="ap-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div>
                  <p style={{ color: '#C0C0C0', fontSize: '.9375rem', lineHeight: 1.8 }}>
                    AutoPortal360 is an independent automotive research portal founded and operated from
                    <strong style={{ color: '#fff' }}> Chandigarh, India</strong>. We are not affiliated
                    with any vehicle manufacturer, dealer group, or automotive conglomerate.
                  </p>
                  <p style={{ color: '#C0C0C0', fontSize: '.9375rem', lineHeight: 1.8, marginTop: '1rem' }}>
                    Our team researches specifications directly from manufacturer sources, collects pricing
                    data from dealer networks, and maintains a verified database of authorized showrooms
                    across India.
                  </p>
                </div>
                <div className="flex flex-wrap" style={{ gap: '.75rem' }}>
                  <Link href="/dealers/" className="ap-btn-cyan">Find Dealers</Link>
                  <Link href="/compare/" className="ap-btn-outline">Compare Vehicles</Link>
                  <Link href="/contact/" className="ap-btn-ghost">Contact Us</Link>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
