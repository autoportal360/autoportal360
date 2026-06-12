import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'

const TRACKED_KEYS = [
  'ga4_id',
  'gtm_id',
  'gsc_verification',
  'facebook_pixel_id',
  'custom_head_scripts',
  'custom_body_scripts',
] as const

export type TrackingKey = typeof TRACKED_KEYS[number]
export type TrackingSettings = Partial<Record<TrackingKey, string>>

export const getTrackingSettings = unstable_cache(
  async (): Promise<TrackingSettings> => {
    const { data } = await supabase
      .from('seo_settings')
      .select('key, value')
      .in('key', [...TRACKED_KEYS])

    const settings: TrackingSettings = {}
    data?.forEach(row => {
      const k = row.key as TrackingKey
      if (row.value) settings[k] = row.value as string
    })
    return settings
  },
  ['tracking-settings'],
  { revalidate: 3600 }
)

// Parses an HTML string of <script> tags into injectable segments.
// Falls back to treating the whole string as raw JS if no tags are found.
export function parseCustomScripts(
  html: string
): Array<{ src?: string; content?: string; isAsync?: boolean }> {
  const results: Array<{ src?: string; content?: string; isAsync?: boolean }> = []
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let match
  while ((match = re.exec(html)) !== null) {
    const attrs = match[1]
    const body = (match[2] ?? '').trim()
    const srcMatch = attrs.match(/src=["']([^"']+)["']/)
    if (srcMatch) {
      results.push({ src: srcMatch[1], isAsync: /\basync\b/.test(attrs) })
    } else if (body) {
      results.push({ content: body })
    }
  }
  // No recognised script tags — treat as raw JS
  if (results.length === 0 && html.trim()) {
    results.push({ content: html.trim() })
  }
  return results
}
