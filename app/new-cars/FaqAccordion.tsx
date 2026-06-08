'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Which is the best-selling car in India in 2026?',
    a: 'Maruti Suzuki dominates Indian car sales with over 42% market share. The Swift, Dzire, and Brezza consistently rank among the top 10 best-sellers. The Brezza leads the compact SUV segment, while the Swift is the best-selling hatchback.',
  },
  {
    q: 'What is the cheapest new car available in India?',
    a: 'The Maruti Suzuki Alto K10 starts at around ₹3.99 Lakh (ex-showroom) and is the most affordable new car in India. Other budget options include the Renault Kwid (₹4.7L) and Tata Punch (₹6L), which offer more features at slightly higher prices.',
  },
  {
    q: 'How is on-road price calculated in India?',
    a: 'On-road price = Ex-showroom + RTO registration (8–15% depending on state) + Insurance (3–5% for comprehensive) + TCS (1% on cars above ₹10 Lakh) + Handling charges + FastTag (₹500). AutoPortal360 calculates this automatically for your city.',
  },
  {
    q: 'What are the most fuel-efficient cars in India?',
    a: 'The Maruti Suzuki Baleno and Ciaz offer the best petrol mileage at 22–23 km/l. For diesel, the Honda Amaze and Hyundai Aura top the charts at 24–25 km/l. Electric cars like the Tata Tiago EV offer 315 km of range per charge with near-zero running costs.',
  },
  {
    q: 'Which cars have 5-star safety ratings in India?',
    a: 'Cars with 5-star Global NCAP ratings include the Tata Punch, Nexon, and Altroz, Mahindra XUV 3XO and BE 6e, and Hyundai Verna. Bharat NCAP (launched 2023) has also tested several popular models — always check the rating before buying.',
  },
  {
    q: 'What is the difference between ex-showroom and on-road price?',
    a: "Ex-showroom is the manufacturer's price before taxes and registration. On-road price adds RTO registration fees (varies by state), comprehensive insurance, TCS for cars above ₹10 Lakh, handling charges, and FastTag. The gap is typically 15–25% of the ex-showroom price.",
  },
  {
    q: 'Can I get a car loan for 100% of the on-road price?',
    a: 'Most banks finance 80–90% of the on-road price. Some lenders offer up to 100% financing for salaried applicants with a good credit score (750+). EMIs start from approximately ₹1,499 per Lakh for 84-month tenures at 8.5–9.5% interest rate.',
  },
  {
    q: 'Which electric car has the longest range in India?',
    a: 'The Mahindra BE 6e offers up to 683 km (MIDC range) — the longest-range EV in India as of 2026. Other strong options: Hyundai Ioniq 5 (631 km), Kia EV6 (528 km), and BYD Atto 3 (521 km MIDC). For budget EVs, the Tata Nexon EV offers 465 km.',
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
