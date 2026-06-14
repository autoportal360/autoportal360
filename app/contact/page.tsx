import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact AutoPortal360 — Get in Touch',
  description: 'Contact AutoPortal360 for general inquiries, dealer listing requests, partnership opportunities, or to report incorrect vehicle data. We respond within 1 business day.',
  alternates: { canonical: 'https://autoportal360.vercel.app/contact/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact AutoPortal360',
  url: 'https://autoportal360.vercel.app/contact/',
  description: 'Get in touch with AutoPortal360 for inquiries, dealer listings, partnerships or feedback',
  mainEntity: {
    '@type': 'Organization',
    name: 'AutoPortal360',
    email: 'contact@autoportal360.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chandigarh',
      addressCountry: 'IN',
    },
  },
}

const FAQS = [
  {
    q: 'How do I list my dealership on AutoPortal360?',
    a: 'Email dealers@autoportal360.com with your showroom name, address, contact number, brands you sell, and your authorization certificate. We verify all listings before publishing and respond within 2 business days.',
  },
  {
    q: 'Is the vehicle pricing data accurate?',
    a: 'We source ex-showroom prices directly from manufacturer websites and update them monthly. On-road estimates include approximate RTO, insurance, and handling charges — but exact figures vary by city and change with government revisions. Always confirm the final price with your dealer.',
  },
  {
    q: 'Is AutoPortal360 free to use?',
    a: 'Yes, completely free. We do not charge buyers for any research, comparison, or dealer lookup tool on the platform. Dealer listings are also free during our launch period.',
  },
  {
    q: 'How do I report incorrect vehicle information?',
    a: 'Use the contact form on this page and select "Bug Report" as the subject, or email contact@autoportal360.com with the page URL and the specific data that needs correction. We typically fix verified errors within 24 hours.',
  },
]

export default function ContactPage() {
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
              <span className="text-white">Contact Us</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section style={{ background: '#0A1F44', padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: '.5rem' }}>
              Get in Touch
            </h1>
            <p style={{ color: '#C0C0C0', fontSize: '1rem', maxWidth: '540px' }}>
              Questions, feedback, dealer inquiries, or partnership ideas — we read every message
              and respond within 1 business day.
            </p>
          </div>
        </section>

        {/* Body */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {/* Two-column: form + info */}
          <div className="ap-contact-layout" style={{ marginBottom: '3rem' }}>

            {/* Contact Form */}
            <div className="ap-card-p5">
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '1.25rem' }}>
                Send a Message
              </h2>
              <form action="#" method="POST">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.125rem' }}>
                  <div>
                    <label className="ap-label" htmlFor="name">Your Name</label>
                    <input id="name" name="name" type="text" placeholder="Rajesh Kumar" className="ap-input" required />
                  </div>
                  <div>
                    <label className="ap-label" htmlFor="email">Email Address</label>
                    <input id="email" name="email" type="email" placeholder="rajesh@example.com" className="ap-input" required />
                  </div>
                </div>
                <div className="ap-form-group">
                  <label className="ap-label" htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" className="ap-select-field">
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="dealer">Dealer Listing</option>
                    <option value="partnership">Partnership</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="ap-form-group">
                  <label className="ap-label" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help..."
                    className="ap-textarea"
                    required
                  />
                </div>
                <button type="submit" className="ap-btn-cyan" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Message →
                </button>
                <p style={{ color: '#666', fontSize: '.75rem', marginTop: '.75rem', textAlign: 'center' }}>
                  We respond within 1 business day
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div className="ap-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '.5rem' }}>
                  Contact Details
                </h3>

                <div className="ap-info-row">
                  <div className="ap-info-icon">✉️</div>
                  <div>
                    <p style={{ color: '#C0C0C0', fontSize: '.75rem', marginBottom: '.25rem' }}>General</p>
                    <a href="mailto:contact@autoportal360.com" style={{ color: '#00D4FF', fontSize: '.9rem', fontWeight: 600 }}>
                      contact@autoportal360.com
                    </a>
                  </div>
                </div>

                <div className="ap-info-row">
                  <div className="ap-info-icon">📍</div>
                  <div>
                    <p style={{ color: '#C0C0C0', fontSize: '.75rem', marginBottom: '.25rem' }}>Location</p>
                    <p style={{ color: '#fff', fontSize: '.9rem', fontWeight: 500 }}>Chandigarh, India</p>
                  </div>
                </div>

                <div className="ap-info-row">
                  <div className="ap-info-icon">🕒</div>
                  <div>
                    <p style={{ color: '#C0C0C0', fontSize: '.75rem', marginBottom: '.25rem' }}>Working Hours</p>
                    <p style={{ color: '#fff', fontSize: '.9rem', fontWeight: 500 }}>Mon–Fri: 9 AM – 6 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="ap-card-p5" style={{ borderColor: 'rgba(0,212,255,.3)' }}>
                <p style={{ color: '#00D4FF', fontWeight: 700, fontSize: '.875rem', marginBottom: '.5rem' }}>
                  🏪 For Dealers
                </p>
                <p style={{ color: '#C0C0C0', fontSize: '.875rem', lineHeight: 1.6, marginBottom: '.875rem' }}>
                  Want to list your authorized showroom? Reach out directly and we'll verify and publish your listing for free.
                </p>
                <a href="mailto:dealers@autoportal360.com" className="ap-btn-outline" style={{ fontSize: '.8125rem' }}>
                  dealers@autoportal360.com
                </a>
              </div>

            </div>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              Frequently Asked Questions
            </h2>
            <div className="ap-panel" style={{ padding: '1.25rem 1.5rem' }}>
              {FAQS.map(faq => (
                <div key={faq.q} className="ap-faq-item">
                  <p className="ap-faq-q">{faq.q}</p>
                  <p className="ap-faq-a">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
