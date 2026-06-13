export default function ComparisonSkeleton() {
  const pulse: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(0,212,255,0.05) 25%, rgba(0,212,255,0.1) 50%, rgba(0,212,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-pulse 1.4s ease-in-out infinite',
    borderRadius: 8,
  }

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '28px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`@keyframes skeleton-pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* breadcrumb */}
        <div style={{ ...pulse, height: 14, width: 220, marginBottom: 22 }} />

        {/* h1 */}
        <div style={{ ...pulse, height: 32, width: '70%', marginBottom: 10 }} />
        <div style={{ ...pulse, height: 16, width: '40%', marginBottom: 28 }} />

        {/* thumbnail strip */}
        <div style={{
          display: 'flex', gap: 12, padding: 16, marginBottom: 24,
          background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 14,
        }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px' }}>
              {i > 0 && <div style={{ ...pulse, width: 20, height: 14 }} />}
              <div style={{ ...pulse, width: 80, height: 56, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...pulse, height: 10, width: 60, marginBottom: 6 }} />
                <div style={{ ...pulse, height: 18, width: 100, marginBottom: 6 }} />
                <div style={{ ...pulse, height: 14, width: 70 }} />
              </div>
            </div>
          ))}
        </div>

        {/* spec table rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, padding: '10px 0',
            borderBottom: '1px solid rgba(0,212,255,0.06)',
          }}>
            <div style={{ ...pulse, height: 14, width: '30%' }} />
            <div style={{ ...pulse, height: 14, width: '28%' }} />
            <div style={{ ...pulse, height: 14, width: '28%' }} />
          </div>
        ))}

      </div>
    </div>
  )
}
