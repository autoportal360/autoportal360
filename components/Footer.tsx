'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--deep-navy)',
      borderTop: '1px solid rgba(0,212,255,0.1)',
      padding: '36px 24px 24px',
      marginTop: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
      }}>

        {/* TOP GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}>

          {/* BRAND COL */}
          <div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 900,
              marginBottom: '10px',
              color: '#FFFFFF',
            }}>
              Auto<span style={{ color: '#00D4FF' }}>Portal</span>360
            </div>
            <p style={{
              fontSize: '13px',
              color: '#8E99A8',
              lineHeight: 1.6,
              maxWidth: '200px',
            }}>
              India's premium automotive research portal for cars, bikes and scooters.
            </p>
          </div>

          {/* CARS COL */}
          <div>
            <h4 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}>Cars</h4>
            {[
              { label: 'All Car Brands',    href: '/new-cars/' },
              { label: 'SUV Cars',          href: '/suv-cars/' },
              { label: 'Electric Cars',     href: '/electric-cars/' },
              { label: 'Under ₹8 Lakh',     href: '/new-cars-under-8-lakh/' },
              { label: 'Tata Cars',         href: '/tata-cars/' },
              { label: 'Hyundai Cars',      href: '/hyundai-cars/' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontSize: '13px',
                color: '#8E99A8',
                textDecoration: 'none',
                marginBottom: '6px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00D4FF'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E99A8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* BIKES COL */}
          <div>
            <h4 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}>Bikes</h4>
            {[
              { label: 'All Bike Brands',   href: '/new-bikes/' },
              { label: 'Royal Enfield',     href: '/royal-enfield-bikes/' },
              { label: 'Bajaj',             href: '/bajaj-bikes/' },
              { label: 'KTM',               href: '/ktm-bikes/' },
              { label: 'Hero',              href: '/hero-bikes/' },
              { label: 'Honda Bikes',       href: '/honda-bikes/' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontSize: '13px',
                color: '#8E99A8',
                textDecoration: 'none',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00D4FF'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E99A8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* SCOOTERS COL */}
          <div>
            <h4 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}>Scooters</h4>
            {[
              { label: 'All Scooters',      href: '/new-scooters/' },
              { label: 'Honda Scooters',    href: '/honda-scooters/' },
              { label: 'Ather',             href: '/ather-scooters/' },
              { label: 'Ola Electric',      href: '/ola-electric-scooters/' },
              { label: 'TVS Scooters',      href: '/tvs-scooters/' },
              { label: 'Yamaha Scooters',   href: '/yamaha-scooters/' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontSize: '13px',
                color: '#8E99A8',
                textDecoration: 'none',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00D4FF'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E99A8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* MORE COL */}
          <div>
            <h4 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 800,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}>More</h4>
            {[
              { label: 'Compare',           href: '/compare/' },
              { label: 'Find Dealers',      href: '/dealers/' },
              { label: 'News & Reviews',    href: '/news/' },
              { label: 'About Us',          href: '/about/' },
              { label: 'Contact',           href: '/contact/' },
              { label: 'Sitemap',           href: '/sitemap' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontSize: '13px',
                color: '#8E99A8',
                textDecoration: 'none',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00D4FF'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#8E99A8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(0,212,255,0.08)',
        }}>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '15px',
            fontWeight: 900,
            color: '#FFFFFF',
          }}>
            Auto<span style={{ color: '#00D4FF' }}>Portal</span>360
          </div>
          <div style={{ fontSize: '12px', color: '#8E99A8' }}>
            © 2025–2026 AutoPortal360 · Chandigarh, India · All prices ex-showroom unless stated
          </div>
        </div>

      </div>
    </footer>
  )
}