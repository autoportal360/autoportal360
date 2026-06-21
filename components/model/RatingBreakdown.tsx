const DEFAULT_CATS = [
  { label: 'Exterior',     score: 4.6 },
  { label: 'Comfort',      score: 4.5 },
  { label: 'Performance',  score: 4.3 },
  { label: 'Fuel Economy', score: 4.4 },
  { label: 'Value',        score: 4.5 },
  { label: 'Safety',       score: 4.2 },
]

export default function RatingBreakdown({
  overall = 4.5,
  categories,
  reviewCount = 0,
  ratingCount = 0,
  modelName,
  positivePct = 85,
}: {
  overall?: number
  categories?: { label: string; score: number }[]
  reviewCount?: number
  ratingCount?: number
  modelName: string
  positivePct?: number
}) {
  const cats = categories ?? DEFAULT_CATS
  const fullStars = Math.floor(overall)
  const halfStar = overall - fullStars >= 0.5

  return (
    <div className="ap-rating-card">
      <div className="ap-rating-overall">
        <div>
          <div className="ap-rating-big">
            {overall}<span className="ap-rating-big-sub">/5</span>
          </div>
          <div style={{ color: '#FFB400', fontSize: '0.9375rem', marginTop: '2px', letterSpacing: '1px' }}>
            {'★'.repeat(fullStars)}{halfStar ? '½' : ''}{'☆'.repeat(5 - fullStars - (halfStar ? 1 : 0))}
          </div>
        </div>
        <div className="ap-rating-meta">
          {ratingCount > 0
            ? <div><strong>{ratingCount.toLocaleString()}</strong> ratings</div>
            : <div>Based on owner reviews</div>
          }
          {reviewCount > 0 && <div><strong>{reviewCount.toLocaleString()}</strong> user reviews</div>}
        </div>
      </div>

      <div className="ap-rating-cats">
        {cats.map(cat => (
          <div key={cat.label} className="ap-rating-cat">
            <div className="ap-rating-cat-score">{cat.score}</div>
            <div className="ap-rating-cat-label">{cat.label}</div>
          </div>
        ))}
      </div>

      <div className="ap-rating-summary">
        <div className="ap-rating-summary-title">What Customers Say</div>
        <div className="ap-rating-summary-text">
          Most {modelName} owners praise its fuel efficiency, comfortable ride quality and value-for-money positioning. Common concerns include cabin noise at highway speeds and feature availability limited to higher variants.
        </div>
        <div className="ap-rating-sentiment">
          <span className="ap-rating-positive">😊 {positivePct}%</span>
          <div className="ap-rating-bar">
            <div className="ap-rating-bar-fill" style={{ width: `${positivePct}%` }} />
          </div>
          <span className="ap-rating-negative">{100 - positivePct}% 😞</span>
        </div>
      </div>
    </div>
  )
}
