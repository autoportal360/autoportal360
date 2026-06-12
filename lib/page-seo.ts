import { cache } from 'react'
import { supabase } from '@/lib/supabase'

export type PageSeo = {
  id: string
  page_key: string
  page_type: string
  meta_title: string | null
  meta_description: string | null
  h1: string | null
  intro_text: string | null
  seo_content: string | null
  faqs: Array<{ q: string; a: string }> | null
  schema_jsonld: string | null
}

export const getPageSeo = cache(async (pageKey: string): Promise<PageSeo | null> => {
  const { data } = await supabase
    .from('page_seo')
    .select('*')
    .eq('page_key', pageKey)
    .maybeSingle()
  return (data as PageSeo) ?? null
})
