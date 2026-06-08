'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

function buildFaqs({
  brandName, modelName, vehicleLabel,
  priceMin, variantCount, mileage, engineCc,
}: {
  brandName: string
  modelName: string
  vehicleLabel: string
  priceMin: number | null
  variantCount: number
  mileage: number | null
  engineCc: number | null
}) {
  const singular = vehicleLabel.endsWith('s') ? vehicleLabel.slice(0, -1) : vehicleLabel
  return [
    {
      q: `What is the on-road price of ${brandName} ${modelName}?`,
      a: `The ${brandName} ${modelName} ex-showroom price ${priceMin ? `starts at ${formatPrice(priceMin)}` : 'varies by variant'}. On-road costs add RTO registration (8–15% depending on state), ~3.5% insurance, handling, and FastTag. Use the On-Road Price Calculator on this page to get the exact price for your city.`,
    },
    {
      q: `How many variants does the ${brandName} ${modelName} have?`,
      a: `The ${brandName} ${modelName} is available in ${variantCount} variant${variantCount !== 1 ? 's' : ''}. Each variant differs in features, powertrain, and price. See the full breakdown in the Variants section above.`,
    },
    {
      q: `What is the mileage of ${brandName} ${modelName}?`,
      a: mileage
        ? `The ARAI-certified mileage of the ${brandName} ${modelName} is ${mileage} km/l for the base petrol variant. Real-world mileage is typically 10–15% lower depending on traffic, load, and tyre pressure.`
        : `Mileage figures for the ${brandName} ${modelName} vary by variant and powertrain. ARAI-certified values are listed in the Mileage section and on the Specs page.`,
    },
    {
      q: `What engine does the ${brandName} ${modelName} have?`,
      a: engineCc
        ? `The ${brandName} ${modelName} uses a ${engineCc}cc engine. Full details — power output, torque, transmission options — are on the Specs page.`
        : `The ${brandName} ${modelName} is available with multiple powertrain options. Engine specifications are listed on the Specs page for each variant.`,
    },
    {
      q: `Is the ${brandName} ${modelName} worth buying in 2026?`,
      a: `The ${brandName} ${modelName} is a strong contender in its segment. Compare it against rivals using the Compare tool, review the safety rating, and evaluate variant-wise features for the best value at your budget. The On-Road Price Calculator gives you the exact cost in your city before you visit a dealership.`,
    },
  ]
}

export default function ModelFaq(props: {
  brandName: string
  modelName: string
  vehicleLabel: string
  priceMin: number | null
  variantCount: number
  mileage: number | null
  engineCc: number | null
}) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = buildFaqs(props)

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
              flexShrink: 0, lineHeight: 1,
              display: 'inline-block',
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
