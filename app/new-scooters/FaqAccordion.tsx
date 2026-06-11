'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Which is the best scooter in India in 2026?',
    a: 'Honda Activa 6G leads scooter sales with over 4 million units sold annually, making it the best-selling two-wheeler in India. For reliability and service network, Activa remains the top choice. TVS Jupiter and Suzuki Access 125 are strong alternatives with better fuel efficiency. For electric scooters, Ola S1 Pro and Ather 450X lead the segment.',
  },
  {
    q: 'Honda Activa vs TVS Jupiter — which is better?',
    a: 'Honda Activa 6G (₹77,900) offers unmatched service network with 6,000+ service centres and bulletproof reliability. TVS Jupiter 125 (₹82,500) offers better mileage (50+ km/l vs 48 km/l), larger boot space, and more features. Jupiter wins on value and features; Activa wins on resale value, service access, and brand trust. Both are excellent for daily commuting.',
  },
  {
    q: 'Which is the best electric scooter in India 2026?',
    a: 'Ather 450X (₹1.55L) leads on performance, build quality, and over-the-air software updates with 146 km/charge. Ola S1 Pro (₹1.45L) offers more range (195 km/charge) and features at a competitive price. TVS iQube S (₹1.42L) has the strongest service network among EV scooters. For budget EV, the Bajaj Chetak 35 Series (₹1.15L) is reliable and well-supported.',
  },
  {
    q: 'What is the real-world range of the Ather 450X?',
    a: 'The Ather 450X (Gen 3) is certified for 146 km (IDC range) but delivers approximately 85–110 km in real-world city riding depending on Eco/Sport mode and conditions. Highway range drops to around 70–80 km due to higher speed. The Ather 450S offers 108 km IDC range at a lower price point of ₹1.30L.',
  },
  {
    q: 'Is the Ola S1 Pro reliable in 2026?',
    a: 'Ola Electric has significantly improved its service network and software stability after early teething issues. The S1 Pro Gen 2 and Gen 3 show improved reliability over the original launch batch. Ola has expanded to 500+ experience centres. For daily city commuting, current-generation S1 Pro is considered reliable, but service experience varies by city. Always check local service availability before purchasing.',
  },
  {
    q: 'What is the difference between Automatic and CVT in scooters?',
    a: 'All modern scooters use a CVT (Continuously Variable Transmission) — a type of automatic transmission with a belt-and-pulley system. There are no gears to shift, making them easy to ride. The "automatic" term is used loosely to describe scooters. CVT scooters offer smooth acceleration, low maintenance, and easy city riding. Premium scooters like Aprilia SXR use a more refined CVT for better performance.',
  },
  {
    q: 'Which scooter has the best boot space in India?',
    a: 'The Honda Dio 125 offers 18L of under-seat storage, among the highest in the 125cc segment. Suzuki Burgman Street 125 provides 21.5L — the largest boot space in any Indian scooter. TVS Ntorq 125 offers 22L with a race-inspired design. For family use with grocery runs, the Burgman Street\'s boot space is the best available under ₹1 Lakh.',
  },
  {
    q: 'How do I maintain a scooter properly?',
    a: 'Key maintenance steps: oil change every 3,000 km (petrol scooters); clean air filter every 6,000 km; check tyre pressure monthly (28–32 PSI front, 32–36 PSI rear); inspect brake pads every 12,000 km; replace V-belt every 25,000–30,000 km. For electric scooters: charge between 20–80% for battery longevity; avoid full discharge; keep software updated. Always follow the service schedule in the owner\'s manual.',
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
