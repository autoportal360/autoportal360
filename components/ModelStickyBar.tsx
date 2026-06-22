'use client'

import GetOffersButton from '@/app/[brandSlug]/[model]/GetOffersButton'
import type { CalcVariant } from '@/app/[brandSlug]/[model]/OnRoadCalculator'

export default function ModelStickyBar({
  brandSlug: _,
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
      <GetOffersButton
        modelId={modelId}
        modelName={modelName}
        brandName={brandName}
        modelSlug={modelSlug}
        variants={variants}
        className="ap-sticky-cta-btn ap-sticky-cta-secondary"
        formTitle={`Contact ${brandName} Dealer for ${modelName}`}
      >
        Contact Dealer
      </GetOffersButton>
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
