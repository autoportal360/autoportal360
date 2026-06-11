'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Which is the best-selling bike in India in 2026?',
    a: 'Hero Splendor+ is India\'s best-selling bike for over a decade, with annual sales exceeding 3 million units. In the sports segment, Bajaj Pulsar 150 leads. For premium bikes (250cc+), the Royal Enfield Classic 350 is the dominant model with a strong community and resale value.',
  },
  {
    q: 'What is the cheapest new bike available in India?',
    a: 'The Hero HF 100 starts at around ₹63,000 (ex-showroom) and is among the most affordable bikes in India. Bajaj CT100 and TVS Radeon are also available under ₹70,000. These 100cc commuters offer 60+ km/l mileage making them ideal for daily city use.',
  },
  {
    q: 'How is mileage calculated for bikes in India?',
    a: 'ARAI-certified mileage is tested under controlled conditions on a dynamometer. Real-world mileage is typically 15–20% lower than ARAI figures. Riding style, road conditions, tyre pressure, load, and engine health significantly affect fuel efficiency. AutoPortal360 shows both ARAI and estimated real-world mileage.',
  },
  {
    q: 'Which bike has the best mileage in India 2026?',
    a: 'The Hero Splendor+ offers up to 60 km/l (ARAI), making it the most fuel-efficient petrol commuter. Honda CB Shine and Bajaj CT110X also exceed 55 km/l. For electric bikes, the Revolt RV400 and Tork Kratos R offer approximately 7–8 km per unit of electricity charged.',
  },
  {
    q: 'What is ABS and do I need it on a bike?',
    a: 'ABS (Anti-lock Braking System) prevents wheel lockup during sudden hard braking, dramatically reducing stopping distance on wet or slippery roads. The Government of India mandated ABS for all bikes above 125cc from April 2019 and CBS (Combined Braking System) for 125cc and below. ABS is highly recommended for highway riding and monsoon conditions.',
  },
  {
    q: 'What is the difference between 125cc and 150cc bikes?',
    a: '125cc bikes produce 8–10 bhp with 40–50 km/l mileage — ideal for city commuting and learners. 150cc bikes produce 12–15 bhp with 40–45 km/l — better acceleration for city and light highway use. 150cc bikes cost ₹15,000–30,000 more but feel noticeably quicker. For highways or two-up riding, 150cc is the better choice.',
  },
  {
    q: 'Which is better — Royal Enfield or Bajaj Pulsar?',
    a: 'Royal Enfield (Classic 350 from ₹1.93L, Meteor 350 from ₹2.17L) excels at relaxed highway touring, premium lifestyle appeal, and long-distance comfort. Bajaj Pulsar (150–220cc, ₹1–1.8L) is better for spirited city riding, performance riding, and value. Choose Royal Enfield for cruising and heritage; choose Bajaj for sportier city use and better value-for-money.',
  },
  {
    q: 'How can I get the best price on a new bike?',
    a: 'Compare on-road prices across at least 2–3 authorised dealers, negotiate on free accessories and extended warranty instead of cash discount. Buy during festive season (October–November) or financial year-end (March) for maximum schemes. Always insist on itemised invoice showing insurance cost separately. Check for exchange bonuses and state-level subsidy for electric bikes.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {FAQS.map((faq, i) => (
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
              fontWeight: 700, color: open === i ? '#00D4FF' : '#FFFFFF',
              lineHeight: 1.5,
            }}>
              {faq.q}
            </span>
            <span style={{
              color: '#00D4FF', fontSize: '20px', fontWeight: 300,
              flexShrink: 0, lineHeight: 1,
              display: 'inline-block',
              transform: open === i ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.2s',
            }}>+</span>
          </button>
          {open === i && (
            <div style={{
              paddingBottom: '20px',
              color: '#C0C0C0', fontSize: '14px', lineHeight: 1.8,
            }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
