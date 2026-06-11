import Link from 'next/link'
import SliderForm from '../SliderForm'

export default function NewSlidePage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/slider" style={{
          fontSize: 12, color: '#8E99A8', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
        }}>
          ← Back to Slider
        </Link>
        <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 26, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
          New Slide
        </h1>
      </div>
      <SliderForm />
    </div>
  )
}
