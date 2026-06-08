'use client'

import { useState } from 'react'

function buildFaqs(brandName: string, vehicleLabel: string) {
  const singular = vehicleLabel.endsWith('s') ? vehicleLabel.slice(0, -1) : vehicleLabel
  const plural = vehicleLabel
  return [
    {
      q: `Which is the best ${brandName} ${singular.toLowerCase()} in India in 2026?`,
      a: `The best ${brandName} ${singular.toLowerCase()} depends on your budget and use case. Use the filter above to narrow down by body type or fuel variant, then compare on-road prices across cities.`,
    },
    {
      q: `What is the starting price of ${brandName} ${plural.toLowerCase()} in India?`,
      a: `${brandName} ${plural.toLowerCase()} are available across a range of budgets. The ex-showroom prices shown on this page are the manufacturer's list prices. On-road prices — which include RTO registration, insurance, handling charges, and FastTag — are typically 15–22% higher depending on your state.`,
    },
    {
      q: `Does ${brandName} offer electric variants?`,
      a: `Several ${brandName} models are available with electric powertrains. Look for the fuel-type chips on each model card above, or use the Fuel filter at the top of this page. Electric variants may qualify for FAME-II or state subsidies.`,
    },
    {
      q: `Which ${brandName} ${singular.toLowerCase()} has the best fuel efficiency?`,
      a: `Fuel efficiency varies by powertrain and variant. Open the Specs page for any model to see the ARAI-certified mileage figures for a fair comparison.`,
    },
    {
      q: `How do I get the best price on a ${brandName} ${singular.toLowerCase()}?`,
      a: `Negotiate ex-showroom discounts at the end of the financial quarter (March, June, September, December) when dealers target monthly targets. Always compare dealer quotes using our on-road price calculator. Some variants carry corporate discounts, exchange bonuses, and loyalty benefits that can reduce the effective price significantly.`,
    },
  ]
}

export default function BrandFaq({
  brandName,
  vehicleLabel,
}: {
  brandName: string
  vehicleLabel: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = buildFaqs(brandName, vehicleLabel)

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '18px 0',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '16px',
            }}
          >
            <span style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
              fontWeight: 700, lineHeight: 1.5,
              color: open === i ? '#00D4FF' : '#FFFFFF',
            }}>{faq.q}</span>
            <span style={{
              color: '#00D4FF', fontSize: '20px', fontWeight: 300,
              flexShrink: 0, lineHeight: 1, display: 'inline-block',
              transform: open === i ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.2s',
            }}>+</span>
          </button>
          {open === i && (
            <div style={{ paddingBottom: '20px', color: '#C0C0C0', fontSize: '14px', lineHeight: 1.8 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
