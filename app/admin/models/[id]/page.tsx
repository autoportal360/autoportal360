'use client'

import { useParams } from 'next/navigation'
import ModelForm from '../ModelForm'

export default function EditModelPage() {
  const { id } = useParams() as { id: string }
  return <ModelForm modelId={id} />
}
