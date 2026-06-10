import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/app/components/ConditionalLayout'

export const metadata: Metadata = {
  title: {
    default: 'AutoPortal360 — Cars, Bikes & Scooters in India',
    template: '%s | AutoPortal360',
  },
  description: 'Research new cars, bikes and scooters in India. Compare prices, specs and reviews.',
  metadataBase: new URL('https://autoportal360.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}