'use client'

import { useParams } from 'next/navigation'
import BrandForm from '../BrandForm'

export default function EditBrandPage() {
  const { id } = useParams() as { id: string }
  return <BrandForm brandId={id} />
}
