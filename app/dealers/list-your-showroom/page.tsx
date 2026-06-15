import type { Metadata } from 'next'
import Link from 'next/link'
import ListShowroomForm from './ListShowroomForm'

export const metadata: Metadata = {
  title: 'List Your Showroom | AutoPortal360',
  description: 'Submit your dealership for free listing on AutoPortal360. Reach thousands of car and bike buyers searching in your city. No charges ever.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'List Your Showroom on AutoPortal360',
  description: 'Free dealer listing submission for showrooms across India. Get verified and reach buyers in your city.',
  url: 'https://www.autoportal360.com/dealers/list-your-showroom/',
}

export default function ListYourShowroomPage() {
  return (
    <div className="min-h-screen bg-[#06142D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section style={{ background: '#0A1F44', borderBottom: '1px solid #1e3a6e', padding: '3rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '.75rem' }}>
            <Link href="/dealers/" style={{ color: '#8E99A8', fontSize: '.875rem' }}>
              ← Back to Dealers
            </Link>
          </div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '.75rem' }}>
            List Your Showroom on <span style={{ color: '#00D4FF' }}>AutoPortal360</span>
          </h1>
          <p style={{ color: '#C0C0C0', fontSize: '1.0625rem', maxWidth: '600px', lineHeight: 1.7 }}>
            Get your dealership listed for free. Reach thousands of car and bike buyers searching in your city.
          </p>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <ListShowroomForm />
      </div>
    </div>
  )
}
