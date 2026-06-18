import Link from 'next/link'

const BODY_TYPES = [
  { icon: '🚙', label: 'SUV',       count: '45+ cars', href: '/new-cars/?body=suv'       },
  { icon: '🚗', label: 'Hatchback', count: '30+ cars', href: '/new-cars/?body=hatchback'  },
  { icon: '🚘', label: 'Sedan',     count: '20+ cars', href: '/new-cars/?body=sedan'      },
  { icon: '🚐', label: 'MPV',       count: '12+ cars', href: '/new-cars/?body=mpv'        },
  { icon: '👑', label: 'Luxury',    count: '15+ cars', href: '/new-cars/?body=luxury'     },
  { icon: '⚡', label: 'Electric',  count: '10+ cars', href: '/new-cars/?body=electric'   },
]

export default function BodyTypeNav() {
  return (
    <section style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div className="ap-section-title">Browse by body type</div>
          <Link href="/new-cars/" className="ap-section-link">All cars →</Link>
        </div>
        <div className="ap-body-grid">
          {BODY_TYPES.map(bt => (
            <Link key={bt.href} href={bt.href} className="ap-body-card">
              <span className="ap-body-icon">{bt.icon}</span>
              <div className="ap-body-label">{bt.label}</div>
              <div className="ap-body-count">{bt.count}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
