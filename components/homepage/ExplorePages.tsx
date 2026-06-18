import Link from 'next/link'

const PAGES = [
  { icon: '🔥', label: 'Popular Cars',    href: '/pages/popular-cars-in-india/'   },
  { icon: '⚡', label: 'Electric Cars',   href: '/pages/electric-cars-in-india/'  },
  { icon: '🏍️', label: 'Best Bikes',     href: '/pages/best-bikes-in-india/'     },
  { icon: '🛵', label: 'Best Scooters',   href: '/pages/best-scooters-in-india/'  },
  { icon: '🆕', label: 'Latest Launches', href: '/pages/latest-cars-in-india/'    },
]

export default function ExplorePages() {
  return (
    <section style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div className="ap-section-title">Explore guides</div>
        </div>
        <div className="ap-explore-grid">
          {PAGES.map(p => (
            <Link key={p.href} href={p.href} className="ap-explore-card">
              <span className="ap-explore-icon">{p.icon}</span>
              <div className="ap-explore-label">{p.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
