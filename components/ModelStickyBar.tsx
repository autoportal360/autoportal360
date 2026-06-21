'use client'

import Link from 'next/link'
import GetOffersButton from '@/app/[brandSlug]/[model]/GetOffersButton'
import type { CalcVariant } from '@/app/[brandSlug]/[model]/OnRoadCalculator'

export default function ModelStickyBar({
  brandSlug,
  modelSlug,
  modelId,
  modelName,
  brandName,
  variants,
}: {
  brandSlug: string
  modelSlug: string
  modelId: string
  modelName: string
  brandName: string
  variants: CalcVariant[]
}) {
  return (
    <div className="ap-sticky-cta">
      <Link href={`/dealers/?brand=${brandSlug}`} className="ap-sticky-cta-btn ap-sticky-cta-secondary">
        Contact Dealer
      </Link>
      <GetOffersButton
        modelId={modelId}
        modelName={modelName}
        brandName={brandName}
        modelSlug={modelSlug}
        variants={variants}
        className="ap-sticky-cta-btn ap-sticky-cta-primary"
      >
        Get Best Offers
      </GetOffersButton>
    </div>
  )
}
