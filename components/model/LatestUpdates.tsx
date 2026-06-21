import { formatPrice } from '@/lib/utils'

export default function LatestUpdates({
  modelName,
  brandName,
  priceMin,
}: {
  modelName: string
  brandName: string
  priceMin?: number | null
}) {
  const priceStr = priceMin ? formatPrice(priceMin) : null

  const updates = [
    {
      date: 'Jun 2026',
      text: `${brandName} announces price revision for the ${modelName} lineup — hike of up to ₹10,000 across most variants.`,
    },
    {
      date: 'Apr 2026',
      text: `${modelName} records best-ever monthly dispatch figures in India. Waiting periods extend to 4–6 weeks in major metros.`,
    },
    {
      date: 'Jan 2026',
      text: `${brandName} ${modelName} facelift officially revealed — updated front fascia, new infotainment system with wireless Apple CarPlay and Android Auto.`,
    },
    {
      date: 'Oct 2025',
      text: priceStr
        ? `${modelName} base variant now priced from ${priceStr} (ex-showroom India) following mid-year revision.`
        : `${brandName} ${modelName} receives mid-year update with new colour options and added safety features as standard.`,
    },
  ]

  return (
    <div className="ap-timeline">
      {updates.map((u, i) => (
        <div key={i} className="ap-timeline-item">
          <div className="ap-timeline-dot" />
          <div className="ap-timeline-date">{u.date}</div>
          <div className="ap-timeline-text">{u.text}</div>
        </div>
      ))}
    </div>
  )
}
