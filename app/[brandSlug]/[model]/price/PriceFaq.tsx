'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

function buildGeneralFaqs({
  brandName, modelName, priceMin, priceMax, baseOnRoad,
}: {
  brandName: string
  modelName: string
  priceMin: number | null
  priceMax: number | null
  baseOnRoad: number | null
}) {
  const emi = baseOnRoad ? Math.round(baseOnRoad * 0.8 * 0.02058) : null
  const hasTcs = priceMin && priceMin > 1000000

  return [
    {
      q: `What is the on-road price of ${brandName} ${modelName} in India?`,
      a: `The on-road price of ${brandName} ${modelName} varies by city due to different state RTO rates. The ex-showroom price ${priceMin ? `starts at ${formatPrice(priceMin)}` : 'varies by variant'}${priceMax && priceMin && priceMax !== priceMin ? ` and goes up to ${formatPrice(priceMax)}` : ''}. On-road price adds RTO (8–15% by state), insurance (~3.5%), handling charges, and FastTag ₹500. Use the calculator above for your city.`,
    },
    {
      q: `How is the on-road price of ${brandName} ${modelName} calculated?`,
      a: `On-road price = Ex-showroom + RTO registration (varies by state, typically 8–15% for cars) + Comprehensive insurance (~3.5% of ex-showroom) + Handling charges (₹3,000–₹10,000 depending on dealer) + FastTag ₹500${hasTcs ? ' + TCS 1% (since the price exceeds ₹10 Lakh)' : ''}. Select your city in the calculator above to see the exact breakdown.`,
    },
    {
      q: `Does the ${brandName} ${modelName} attract TCS?`,
      a: priceMin && priceMin > 1000000
        ? `Yes. TCS (Tax Collected at Source) at 1% applies to all ${modelName} variants since the ex-showroom price exceeds ₹10 Lakh. TCS can be claimed as a tax credit when filing your income tax return.`
        : priceMax && priceMax > 1000000
        ? `TCS (Tax Collected at Source) at 1% applies only to ${modelName} variants with an ex-showroom price above ₹10 Lakh. Lower variants are exempt. TCS can be claimed as a tax credit.`
        : `No. TCS (Tax Collected at Source) does not apply to the ${modelName} since all variants are priced below ₹10 Lakh ex-showroom.`,
    },
    {
      q: `Which city has the lowest on-road price for ${brandName} ${modelName}?`,
      a: `On-road prices vary by state RTO rate. States like Himachal Pradesh, Uttarakhand, and Goa often have lower registration rates (8–10%), making on-road prices cheaper there. The city-wise price table on this page shows the on-road price across all major cities. The ex-showroom price is the same nationally.`,
    },
    {
      q: `What is the monthly EMI for ${brandName} ${modelName}?`,
      a: emi
        ? `At an on-road price of approximately ${formatPrice(baseOnRoad!)}, financing 80% (${formatPrice(Math.round(baseOnRoad! * 0.8))}) at 8.5% p.a. for 60 months works out to roughly ₹${emi.toLocaleString('en-IN')}/month EMI. Actual EMI depends on your loan amount, tenure, and bank rate. Compare car loan offers before visiting the showroom.`
        : `Your monthly EMI depends on the on-road price, down payment, loan tenure, and interest rate. At typical bank rates of 8–9% p.a. for 5 years, EMI is roughly ₹1,650–₹2,100 per lakh borrowed. Use the price calculator to find your city's on-road price, then calculate EMI accordingly.`,
    },
  ]
}

function buildCityFaqs({
  brandName, modelName, cityName, stateName, rtoPercentage, baseOnRoad, baseVariantName,
}: {
  brandName: string
  modelName: string
  cityName: string
  stateName: string
  rtoPercentage: number
  baseOnRoad: number | null
  baseVariantName: string
}) {
  const emi = baseOnRoad ? Math.round(baseOnRoad * 0.8 * 0.02058) : null

  return [
    {
      q: `What is the on-road price of ${brandName} ${modelName} in ${cityName}?`,
      a: `The on-road price of ${brandName} ${modelName} (${baseVariantName}) in ${cityName} is ${baseOnRoad ? formatPrice(baseOnRoad) : 'calculated above'}. This includes ex-showroom price + RTO at ${rtoPercentage}% (${stateName}) + ~3.5% insurance + handling charges + FastTag ₹500. Higher variants will have a proportionally higher on-road price.`,
    },
    {
      q: `What is the RTO charge for ${brandName} ${modelName} in ${stateName}?`,
      a: `The Road Tax (RTO registration) in ${stateName} is ${rtoPercentage}% of the ex-showroom price for private cars. This is paid once at the time of registration and is valid for 15 years. After 15 years, a renewal tax applies.`,
    },
    {
      q: `How much is the insurance for ${brandName} ${modelName} in ${cityName}?`,
      a: `Comprehensive insurance for ${brandName} ${modelName} in ${cityName} is approximately 3.5% of the ex-showroom price for the first year. This typically includes own-damage cover + third-party liability. Add-ons like zero depreciation, roadside assistance, and return-to-invoice cover add to the premium.`,
    },
    {
      q: `How do I register ${brandName} ${modelName} in ${cityName}?`,
      a: `Your dealership handles RTO registration in ${cityName} as part of the on-road price. You need Aadhaar, PAN, address proof, and passport-size photos. The registration certificate (RC) is issued digitally via DigiLocker within a few weeks of purchase.`,
    },
    {
      q: `Are there any offers or discounts on ${brandName} ${modelName} in ${cityName}?`,
      a: `Dealers in ${cityName} periodically offer exchange bonuses, corporate discounts, loyalty benefits, and festival offers that can reduce the effective on-road price by ₹20,000–₹1,50,000. The best deals typically come at financial quarter-ends (March, June, September, December). Click "Get Offers" to check current offers.`,
    },
  ]
}

type Props =
  | {
      mode: 'general'
      brandName: string
      modelName: string
      priceMin: number | null
      priceMax: number | null
      baseOnRoad: number | null
    }
  | {
      mode: 'city'
      brandName: string
      modelName: string
      cityName: string
      stateName: string
      rtoPercentage: number
      baseOnRoad: number | null
      baseVariantName: string
    }

export default function PriceFaq(props: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = props.mode === 'general' ? buildGeneralFaqs(props) : buildCityFaqs(props)

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
