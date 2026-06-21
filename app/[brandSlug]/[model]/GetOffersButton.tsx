'use client'

import { useState } from 'react'
import GetOffersModal from '@/components/GetOffersModal'
import type { CalcVariant } from './OnRoadCalculator'

export default function GetOffersButton({
  modelId,
  modelName,
  brandName,
  modelSlug,
  variants,
  style,
  className,
  children,
}: {
  modelId: string
  modelName: string
  brandName: string
  modelSlug: string
  variants: CalcVariant[]
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} style={style} className={className}>
        {children ?? 'Get Offers'}
      </button>
      <GetOffersModal
        isOpen={open}
        onClose={() => setOpen(false)}
        modelId={modelId}
        modelName={modelName}
        brandName={brandName}
        modelSlug={modelSlug}
        variants={variants}
      />
    </>
  )
}
