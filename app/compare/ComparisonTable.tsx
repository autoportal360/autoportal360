import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { LoadedVehicle, SpecRow } from './compareUtils'
import { SPEC_ROWS, generateComparisonSummary } from './compareUtils'

// ─── helpers ──────────────────────────────────────────────────────────────────

function renderCell(
  raw: number | string | null,
  row: SpecRow,
  isBetter: boolean,
): React.ReactNode {
  if (raw === null || raw === undefined || raw === '') {
    return <span style={{ color: '#444E60' }}>—</span>
  }
  const formatted =
    typeof raw === 'number'
      ? row.isPrice
        ? formatPrice(raw)
        : `${raw}${row.unit ?? ''}`
      : `${raw}${row.unit ?? ''}`

  if (!isBetter) return <>{formatted}</>

  const colour = row.isPrice || row.higher === false ? '#00CC66' : '#00D4FF'
  return (
    <span style={{ color: colour, fontWeight: 800 }}>
      {formatted}{' '}
      <span style={{ fontSize: 10 }}>✓</span>
    </span>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ComparisonTable({
  vehicles,
  showSummary = true,
}: {
  vehicles: LoadedVehicle[]
  showSummary?: boolean
}) {
  const count = vehicles.length // 2 or 3

  // Pre-compute per-row winner indices
  const winners: (number | null)[] = SPEC_ROWS.map(row => {
    if (row.higher === undefined) return null
    const vals = vehicles.map(v => row.value(v))
    const nums = vals.map(v => (typeof v === 'number' ? v : null))
    if (nums.some(n => n === null)) return null
    const all = nums as number[]
    if (all.every(n => n === all[0])) return null
    const best = row.higher ? Math.max(...all) : Math.min(...all)
    const winIdx = all.indexOf(best)
    return winIdx
  })

  // Win counts
  const winCounts = vehicles.map((_, i) => winners.filter(w => w === i).length)

  const summary = showSummary ? generateComparisonSummary(vehicles) : ''

  const TH: React.CSSProperties = {
    padding: '14px 12px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: 13,
    color: '#FFFFFF',
    background: 'rgba(0,212,255,0.06)',
    textAlign: 'center',
    borderBottom: '1px solid rgba(0,212,255,0.12)',
  }
  const TD: React.CSSProperties = {
    padding: '11px 12px',
    fontSize: 13,
    color: '#C0C0C0',
    textAlign: 'center',
    verticalAlign: 'middle',
    borderBottom: '1px solid rgba(0,212,255,0.04)',
  }
  const SECTION_ROW: React.CSSProperties = {
    padding: '7px 16px',
    fontSize: 10,
    fontWeight: 800,
    color: '#00D4FF',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    background: 'rgba(0,212,255,0.03)',
    textAlign: 'left' as const,
  }

  const topWinner =
    winCounts.indexOf(Math.max(...winCounts)) !== -1 && Math.max(...winCounts) > 0
      ? winCounts.indexOf(Math.max(...winCounts))
      : null

  return (
    <div>
      {/* Summary text */}
      {summary && (
        <div style={{
          background: 'rgba(0,212,255,0.04)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 16,
          fontSize: 14,
          color: '#C0C0C0',
          lineHeight: 1.7,
        }}>
          {summary}
        </div>
      )}

      {/* Win bar */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 10,
        background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.14)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        {vehicles.map((v, i) => {
          const isWinner = i === topWinner
          return (
            <div key={v.modelId} style={{
              flex: 1, minWidth: 120,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {v.thumbnail_url && (
                <div style={{ width: 32, height: 24, position: 'relative', flexShrink: 0 }}>
                  <Image src={v.thumbnail_url} alt={v.modelName} fill style={{ objectFit: 'contain' }} sizes="32px" />
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: '#8E99A8' }}>{v.brandName}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: isWinner ? '#00D4FF' : '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>
                  {v.modelName}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                background: isWinner ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                color: isWinner ? '#00D4FF' : '#8E99A8',
                whiteSpace: 'nowrap',
              }}>
                {winCounts[i]} wins
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{
        background: '#0A1F44',
        border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 16,
        overflow: 'hidden',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: count === 3 ? 600 : 480 }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: 'left', width: count === 3 ? '28%' : '36%', background: 'transparent', borderBottom: '1px solid rgba(0,212,255,0.12)' }}></th>
              {vehicles.map((v, i) => (
                <th key={v.modelId} style={{
                  ...TH,
                  borderLeft: i > 0 ? '1px solid rgba(0,212,255,0.08)' : undefined,
                }}>
                  <div style={{ fontSize: 10, color: '#8E99A8', fontWeight: 600, marginBottom: 2 }}>{v.brandName}</div>
                  <div>{v.modelName}</div>
                  {v.price_min && (
                    <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 700, marginTop: 2 }}>
                      {formatPrice(v.price_min)}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row, ri) => {
              const vals = vehicles.map(v => row.value(v))
              const winner = winners[ri]

              return (
                <>
                  {row.section && (
                    <tr key={`sec-${ri}`}>
                      <td colSpan={count + 1} style={SECTION_ROW}>{row.section}</td>
                    </tr>
                  )}
                  <tr key={row.label} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{
                      ...TD,
                      textAlign: 'left',
                      color: '#8E99A8',
                      fontWeight: 600,
                      fontSize: 12,
                      paddingLeft: 18,
                    }}>
                      {row.label}
                    </td>
                    {vehicles.map((v, i) => (
                      <td key={v.modelId} style={{
                        ...TD,
                        borderLeft: i > 0 ? '1px solid rgba(0,212,255,0.04)' : undefined,
                        background: winner === i ? 'rgba(0,212,255,0.04)' : undefined,
                      }}>
                        {renderCell(vals[i], row, winner === i)}
                      </td>
                    ))}
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* View model CTAs */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {vehicles.map(v => (
          <Link key={v.modelId} href={`/${v.brandPageSlug}/${v.modelSlug}/`} style={{
            background: 'rgba(0,212,255,0.07)',
            color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.22)',
            borderRadius: 10,
            padding: '11px 20px',
            textDecoration: 'none',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 800,
            fontSize: 13,
          }}>
            View {v.brandName} {v.modelName} →
          </Link>
        ))}
      </div>
    </div>
  )
}
