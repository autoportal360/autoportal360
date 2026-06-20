'use client'

import { useState } from 'react'

export interface Faq {
  question: string
  answer: string
}

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <div className="ap-faq-list">
      {faqs.map((faq, i) => (
        <div key={i} className="ap-faq-item">
          <button
            className="ap-faq-question"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{faq.question}</span>
            <span className="ap-faq-icon">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="ap-faq-answer">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  )
}
