import Link from 'next/link'

const PAIRS = [
  {
    a: { name: 'Nexon',   price: '₹8.10L' },
    b: { name: 'Creta',   price: '₹11.00L' },
    slug: '/compare/tata-nexon-vs-hyundai-creta/',
  },
  {
    a: { name: 'Swift',   price: '₹6.49L' },
    b: { name: 'Baleno',  price: '₹6.64L' },
    slug: '/compare/maruti-suzuki-swift-vs-maruti-suzuki-baleno/',
  },
  {
    a: { name: 'Punch',   price: '₹6.13L' },
    b: { name: 'Venue',   price: '₹7.94L' },
    slug: '/compare/tata-punch-vs-hyundai-venue/',
  },
]

export default function QuickCompare() {
  return (
    <section style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div>
            <div className="ap-section-title">Quick compare</div>
            <div className="ap-section-subtitle">Most searched head-to-heads</div>
          </div>
          <Link href="/compare/" className="ap-section-link">Full compare tool →</Link>
        </div>

        <div className="ap-compare-grid">
          {PAIRS.map(pair => (
            <Link key={pair.slug} href={pair.slug} className="ap-compare-card">
              <div className="ap-compare-vs">
                <span className="ap-compare-model">{pair.a.name}</span>
                <span className="ap-compare-badge">VS</span>
                <span className="ap-compare-model">{pair.b.name}</span>
              </div>
              <div className="ap-compare-prices">
                {pair.a.price} &nbsp;·&nbsp; {pair.b.price}
              </div>
              <span className="ap-car-card-link">Compare →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
