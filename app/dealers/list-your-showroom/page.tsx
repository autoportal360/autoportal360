import type { Metadata } from 'next'
import Link from 'next/link'
import ListShowroomForm from './ListShowroomForm'
import SeoAndFaqSection from './SeoAndFaqSection'

export const metadata: Metadata = {
  title: 'List Your Showroom for Free | AutoPortal360 Dealer Directory',
  description: 'Get your car, bike or scooter dealership listed for free on AutoPortal360. Reach thousands of buyers searching in your city. Quick verification, permanent listing.',
  alternates: {
    canonical: 'https://autoportal360.vercel.app/dealers/list-your-showroom/',
  },
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'List Your Showroom on AutoPortal360',
  description: 'Get your car, bike or scooter dealership listed for free on India\'s growing automotive research portal.',
  url: 'https://autoportal360.vercel.app/dealers/list-your-showroom',
  publisher: {
    '@type': 'Organization',
    name: 'AutoPortal360',
    url: 'https://autoportal360.vercel.app',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is it free to list my showroom on AutoPortal360?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, listing your dealership on AutoPortal360 is completely free. There are no hidden charges, subscription fees, or premium listing costs. Every dealer gets the same visibility.' },
    },
    {
      '@type': 'Question',
      name: 'How long does it take for my listing to go live?',
      acceptedAnswer: { '@type': 'Answer', text: 'Our team reviews submissions within 24-48 hours. Once verified, your showroom appears immediately on all relevant city and brand pages.' },
    },
    {
      '@type': 'Question',
      name: 'What information do I need to provide?',
      acceptedAnswer: { '@type': 'Answer', text: "You'll need your showroom name, brand affiliation, full address, contact number, email, and the types of vehicles you sell (cars, bikes, or scooters). Additional details like Google Maps link and working hours help buyers find you more easily." },
    },
    {
      '@type': 'Question',
      name: 'Can I list multiple showrooms?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! Submit a separate form for each location, or email dealers@autoportal360.com for bulk listing support if you operate multiple outlets.' },
    },
    {
      '@type': 'Question',
      name: 'Can I update my listing details later?',
      acceptedAnswer: { '@type': 'Answer', text: "Absolutely. Once your listing is live, email us at dealers@autoportal360.com with the changes and we'll update your information within 24 hours." },
    },
    {
      '@type': 'Question',
      name: 'Which cities does AutoPortal360 cover?',
      acceptedAnswer: { '@type': 'Answer', text: 'We currently cover all major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Jaipur, Lucknow, Chandigarh, Ahmedabad, Kolkata, and more. New cities are added regularly based on dealer submissions.' },
    },
  ],
}

export default function ListYourShowroomPage() {
  return (
    <div className="min-h-screen bg-[#06142D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── HERO ── */}
      <section style={{ background: '#0A1F44', borderBottom: '1px solid #1e3a6e', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        <ListShowroomForm />
        <SeoAndFaqSection />
      </div>
    </div>
  )
}
