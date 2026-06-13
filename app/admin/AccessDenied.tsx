import Link from 'next/link'

export default function AccessDenied({ section }: { section: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 800,
        color: '#FFFFFF', marginBottom: '12px',
      }}>
        Access Denied
      </h2>
      <p style={{
        fontSize: '14px', color: '#8E99A8', maxWidth: '360px',
        margin: '0 auto 24px', lineHeight: 1.7,
      }}>
        You don&apos;t have permission to view{' '}
        <strong style={{ color: '#FFFFFF' }}>{section}</strong>.
        Contact your administrator to request access.
      </p>
      <Link href="/admin" style={{
        background: '#00D4FF', color: '#06142D',
        fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
        fontSize: '13px', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none',
      }}>
        ← Back to Dashboard
      </Link>
    </div>
  )
}
