'use client'

import { useState } from 'react'

const SEO_PARAS = [
  'AutoPortal360 is India\'s fastest-growing automotive research platform, connecting verified dealers with thousands of car, bike, and scooter buyers every month. By listing your showroom on AutoPortal360, you gain direct visibility to buyers actively searching for dealerships in your city — at absolutely zero cost.',
  'Whether you\'re an authorized dealer for brands like Tata Motors, Maruti Suzuki, Hyundai, Mahindra, Hero MotoCorp, or Bajaj Auto, our platform ensures your showroom appears prominently when buyers search by brand and city. Each dealer listing includes your full address, phone number, working hours, Google Maps directions, and customer ratings — everything a buyer needs to walk through your doors.',
  'Our dealer directory currently covers major cities across India including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Jaipur, Lucknow, Chandigarh, Ahmedabad, and Kolkata, with new cities being added regularly. Unlike classified platforms that bury dealer listings under paid promotions, AutoPortal360 gives every verified dealer equal visibility based on location relevance and customer ratings.',
  'The listing process is simple: submit your showroom details through the form above, and our team verifies the information within 24-48 hours. Once approved, your dealership goes live with a permanent listing that includes your showroom in city-level dealer pages, brand-specific dealer searches, and our upcoming dealer comparison features.',
  'For multi-location dealers and dealer groups, we offer bulk listing support — simply email dealers@autoportal360.com with your locations and we\'ll set everything up. Whether you operate a single showroom or a network of outlets across multiple cities, AutoPortal360 helps you reach the right buyers at the right time.',
]

const FAQS = [
  {
    q: 'Is it free to list my showroom on AutoPortal360?',
    a: 'Yes, listing your dealership on AutoPortal360 is completely free. There are no hidden charges, subscription fees, or premium listing costs. Every dealer gets the same visibility.',
  },
  {
    q: 'How long does it take for my listing to go live?',
    a: 'Our team reviews submissions within 24-48 hours. Once verified, your showroom appears immediately on all relevant city and brand pages.',
  },
  {
    q: 'What information do I need to provide?',
    a: "You'll need your showroom name, brand affiliation, full address, contact number, email, and the types of vehicles you sell (cars, bikes, or scooters). Additional details like Google Maps link and working hours help buyers find you more easily.",
  },
  {
    q: 'Can I list multiple showrooms?',
    a: 'Yes! Submit a separate form for each location, or email dealers@autoportal360.com for bulk listing support if you operate multiple outlets.',
  },
  {
    q: 'Can I update my listing details later?',
    a: 'Absolutely. Once your listing is live, email us at dealers@autoportal360.com with the changes and we\'ll update your information within 24 hours.',
  },
  {
    q: 'Which cities does AutoPortal360 cover?',
    a: 'We currently cover all major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Jaipur, Lucknow, Chandigarh, Ahmedabad, Kolkata, and more. New cities are added regularly based on dealer submissions.',
  },
]

const cardStyle: React.CSSProperties = {
  background: '#0A1F44',
  border: '1px solid #1e3a6e',
  borderRadius: '1rem',
  padding: '1.75rem 2rem',
  marginBottom: '1.5rem',
}

export default function SeoAndFaqSection() {
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)

  return (
    <div style={{ marginTop: '3rem' }}>

      {/* ── SEO TEXT ── */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', lineHeight: 1.3 }}>
          List Your Dealership on India&apos;s Growing Automotive Portal
        </h2>

        <div style={{ position: 'relative' }}>
          {SEO_PARAS.slice(0, seoExpanded ? undefined : 1).map((para, i) => (
            <p key={i} className="ap-seo-para">{para}</p>
          ))}

          {!seoExpanded && (
            <div className="ap-seo-fade" />
          )}
        </div>

        <button
          className="ap-seo-toggle"
          onClick={() => setSeoExpanded(v => !v)}
        >
          {seoExpanded ? 'Show Less ↑' : 'Read More ↓'}
        </button>
      </div>

      {/* ── FAQ ── */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
          Frequently Asked Questions
        </h2>

        {FAQS.map((faq, i) => (
          <div key={i} className="ap-faq-item">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: '1rem', cursor: 'pointer', padding: 0,
              }}
            >
              <span className="ap-faq-q" style={{ textAlign: 'left' }}>{faq.q}</span>
              <span style={{ color: '#00D4FF', fontSize: '1.125rem', flexShrink: 0, marginTop: '2px', fontWeight: 400 }}>
                {openFaq === i ? '−' : '+'}
              </span>
            </button>
            {openFaq === i && (
              <p className="ap-faq-a" style={{ marginTop: '.625rem' }}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
