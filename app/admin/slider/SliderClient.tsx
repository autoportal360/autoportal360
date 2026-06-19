'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { dbUpdate, dbBatch } from '@/lib/admin-db'
import Image from 'next/image'

type SlideRow = {
  id: string
  type: 'auto' | 'oem'
  is_active: boolean
  sort_order: number
  start_date: string | null
  end_date: string | null
  oem_advertiser: string | null
  oem_banner_url: string | null
  oem_headline: string | null
  models: {
    name: string
    slug: string
    thumbnail_url: string | null
    brands: { name: string } | null
  } | null
}

const TD: React.CSSProperties = {
  padding: '14px 16px', color: '#C0C0C0', verticalAlign: 'middle', fontSize: 13,
}
const TH: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', color: '#8E99A8',
  fontWeight: 700, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.5px', whiteSpace: 'nowrap',
}

export default function SliderClient() {
  const sbRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [slides, setSlides] = useState<SlideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const dragIdx = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }, [])

  async function load() {
    const { data } = await sb
      .from('slider_slides')
      .select(`
        id, type, is_active, sort_order, start_date, end_date,
        oem_advertiser, oem_banner_url, oem_headline,
        models(name, slug, thumbnail_url, brands(name))
      `)
      .order('sort_order')
    setSlides((data ?? []) as unknown as SlideRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveOrder(reordered: SlideRow[]) {
    setSaving(true)
    try {
      await dbBatch(
        reordered.map((s, i) => ({
          op: 'update' as const,
          table: 'slider_slides',
          payload: { sort_order: i },
          filter: { col: 'id', val: s.id },
        }))
      )
      showToast('Order saved', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  function handleDragStart(i: number) { dragIdx.current = i }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i) }
  function handleDragEnd() { setDragOver(null); dragIdx.current = null }

  function handleDrop(toIdx: number) {
    const fromIdx = dragIdx.current
    setDragOver(null)
    if (fromIdx === null || fromIdx === toIdx) return
    const next = [...slides]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    setSlides(next)
    saveOrder(next)
    dragIdx.current = null
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await dbUpdate('slider_slides', id, { is_active: !current })
      setSlides(s => s.map(r => r.id === id ? { ...r, is_active: !current } : r))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed', false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>Loading…</div>
  )

  return (
    <div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? 'rgba(0,204,102,0.12)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,204,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: toast.ok ? '#00CC66' : '#FF8080',
          padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.ok ? '✓' : '✗'}</span>{toast.msg}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 28, gap: 12,
      }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 26, fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Hero Slider
          </h1>
          <p style={{ fontSize: 13, color: '#8E99A8', margin: 0 }}>
            {slides.length} slide{slides.length !== 1 ? 's' : ''} · Drag to reorder
            {saving && <span style={{ color: '#FFB400', marginLeft: 8 }}>Saving…</span>}
          </p>
        </div>
        <Link href="/admin/slider/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
          fontSize: 13, padding: '11px 22px', borderRadius: 10,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add New Slide
        </Link>
      </div>

      {slides.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 16, color: '#8E99A8',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎞️</div>
          <p style={{ fontSize: 14, margin: '0 0 20px' }}>No slides yet.</p>
          <Link href="/admin/slider/new" style={{
            background: '#00D4FF', color: '#06142D', fontWeight: 900,
            fontSize: 13, padding: '10px 22px', borderRadius: 10, textDecoration: 'none',
            fontFamily: 'Montserrat,sans-serif',
          }}>
            Create First Slide →
          </Link>
        </div>
      ) : (
        <div style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={{ ...TH, width: 32 }}></th>
                <th style={TH}>Slide</th>
                <th style={TH}>Type</th>
                <th style={TH}>Status</th>
                <th style={TH}>Dates</th>
                <th style={TH}>Order</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide, i) => {
                const isDragTarget = dragOver === i && dragIdx.current !== null && dragIdx.current !== i
                return (
                  <tr
                    key={slide.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(i)}
                    style={{
                      borderBottom: '1px solid rgba(0,212,255,0.05)',
                      background: isDragTarget ? 'rgba(0,212,255,0.06)' : 'transparent',
                      cursor: 'grab',
                      transition: 'background 0.15s',
                      outline: isDragTarget ? '1px solid rgba(0,212,255,0.3)' : 'none',
                    }}
                  >
                    <td style={{ ...TD, color: '#8E99A8', fontSize: 16, paddingRight: 4, cursor: 'grab' }}>⠿</td>

                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 52, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                          background: '#06142D', border: '1px solid rgba(0,212,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                        }}>
                          {slide.type === 'auto' && slide.models?.thumbnail_url ? (
                            <Image src={slide.models.thumbnail_url} alt="" fill style={{ objectFit: 'contain' }} sizes="52px" />
                          ) : slide.type === 'oem' && slide.oem_banner_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slide.oem_banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: 18 }}>{slide.type === 'oem' ? '📢' : '🚗'}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>
                            {slide.type === 'auto'
                              ? `${slide.models?.brands?.name ?? '—'} ${slide.models?.name ?? '—'}`
                              : (slide.oem_headline ?? slide.oem_advertiser ?? '—')
                            }
                          </div>
                          {slide.type === 'oem' && slide.oem_advertiser && (
                            <div style={{ fontSize: 11, color: '#8E99A8' }}>{slide.oem_advertiser}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={TD}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                        letterSpacing: '0.5px', fontFamily: 'Montserrat,sans-serif',
                        background: slide.type === 'oem' ? 'rgba(255,180,0,0.1)' : 'rgba(0,212,255,0.08)',
                        color: slide.type === 'oem' ? '#FFB400' : '#00D4FF',
                        border: `1px solid ${slide.type === 'oem' ? 'rgba(255,180,0,0.25)' : 'rgba(0,212,255,0.2)'}`,
                      }}>
                        {slide.type === 'oem' ? 'OEM' : 'AUTO'}
                      </span>
                    </td>

                    <td style={TD}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleActive(slide.id, slide.is_active) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          fontSize: 11, fontWeight: 700,
                          color: slide.is_active ? '#00CC66' : '#8E99A8',
                        }}
                      >
                        {slide.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>

                    <td style={{ ...TD, fontSize: 11, color: '#8E99A8' }}>
                      {slide.start_date ?? '—'} → {slide.end_date ?? '∞'}
                    </td>

                    <td style={{ ...TD, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                      {slide.sort_order}
                    </td>

                    <td style={{ ...TD, textAlign: 'right' }}>
                      <Link
                        href={`/admin/slider/${slide.id}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          fontSize: 12, fontWeight: 700, color: '#00D4FF',
                          textDecoration: 'none', padding: '6px 14px',
                          border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#8E99A8', marginTop: 12 }}>
        Drag rows to reorder. Changes save automatically.
      </p>
    </div>
  )
}
