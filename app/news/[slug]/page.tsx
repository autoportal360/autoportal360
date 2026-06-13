import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import SchemaMarkup from '@/components/SchemaMarkup'
import { getCanonicalUrl } from '@/lib/seo'
import { breadcrumbSchema, articleSchema } from '@/lib/schema'

type Props = { params: Promise<{ slug: string }> }

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string | null
  cover_image_url: string | null
  author: string | null
  tags: string[] | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string | null
  meta_title: string | null
  meta_description: string | null
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  tags: string[] | null
  published_at: string | null
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return (data as BlogPost) ?? null
})

function readingTime(html: string | null): number {
  if (!html) return 1
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  return (data ?? []).map(p => ({ slug: p.slug as string }))
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || '',
    alternates: { canonical: getCanonicalUrl(`/news/${post.slug}/`) },
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      authors: post.author ? [post.author] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [relatedRes] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, title, slug, cover_image_url, tags, published_at')
      .eq('status', 'published')
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3),
  ])
  const related = (relatedRes.data ?? []) as RelatedPost[]

  const mins    = readingTime(post.content_html)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoportal360.vercel.app'

  const schemas = [
    breadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'News', url: `${siteUrl}/news/` },
      { name: post.title, url: `${siteUrl}/news/${post.slug}/` },
    ]),
    articleSchema({
      title:         post.meta_title || post.title,
      description:   post.meta_description || post.excerpt || '',
      imageUrl:      post.cover_image_url,
      datePublished: post.published_at || post.created_at,
      dateModified:  post.updated_at   || post.published_at || post.created_at,
      author:        post.author       || 'AutoPortal360 Editorial',
      url:           getCanonicalUrl(`/news/${post.slug}/`),
    }),
  ]

  return (
    <>
      <SchemaMarkup schemas={schemas} />

      <div>
        {/* ── Breadcrumb ── */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <div style={{
            maxWidth: '820px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', color: '#8E99A8', flexWrap: 'wrap',
          }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/news/" style={{ color: '#8E99A8', textDecoration: 'none' }}>News</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>{post.title}</span>
          </div>
        </div>

        {/* ── Hero Billboard ── */}
        <AdSlot zone="hero-billboard" />

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px' }}>

          {/* ── Article Header ── */}
          <header style={{ marginBottom: '32px' }}>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{
                    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00D4FF', fontSize: '11px', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '20px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{tag}</span>
                ))}
              </div>
            )}

            <h1 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
              color: '#FFFFFF', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.5px',
            }}>
              {post.title}
            </h1>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              flexWrap: 'wrap', color: '#8E99A8', fontSize: '13px',
              paddingBottom: '20px', borderBottom: '1px solid rgba(0,212,255,0.08)',
            }}>
              <span>
                By <strong style={{ color: '#C0C0C0' }}>{post.author ?? 'AutoPortal360 Editorial'}</strong>
              </span>
              <span style={{ color: '#333' }}>·</span>
              <span>{formatDate(post.published_at)}</span>
              <span style={{ color: '#333' }}>·</span>
              <span>{mins} min read</span>
            </div>
          </header>

          {/* ── Cover Image ── */}
          {post.cover_image_url && (
            <div style={{
              borderRadius: '16px', overflow: 'hidden',
              marginBottom: '36px', background: '#111',
              border: '1px solid rgba(0,212,255,0.1)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* ── Article Content ── */}
          {post.content_html ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
              style={{ marginBottom: '48px' }}
            />
          ) : (
            <div style={{
              color: '#8E99A8', fontSize: '15px', marginBottom: '48px',
              padding: '32px', background: '#0A1F44', borderRadius: '12px', textAlign: 'center',
            }}>
              Content coming soon.
            </div>
          )}

          {/* ── Mid-feed Ad ── */}
          <div style={{ marginBottom: '48px' }}>
            <AdSlot zone="mid-feed-1" />
          </div>

          {/* ── Author Box ── */}
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '16px', padding: '24px', marginBottom: '52px',
            display: 'flex', alignItems: 'flex-start', gap: '16px',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,212,255,0.05))',
              border: '1px solid rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>✍️</div>
            <div>
              <p style={{
                fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '15px',
                color: '#FFFFFF', marginBottom: '4px',
              }}>
                {post.author ?? 'AutoPortal360 Editorial'}
              </p>
              <p style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 600, marginBottom: '8px' }}>
                AutoPortal360 Editorial Team
              </p>
              <p style={{ fontSize: '13px', color: '#8E99A8', lineHeight: 1.7, margin: 0 }}>
                Our editorial team covers the latest developments in India&apos;s automotive industry —
                from road tests and long-term reviews to buying guides and industry news.
              </p>
            </div>
          </div>

          {/* ── Related Articles ── */}
          {related.length > 0 && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800,
                color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.3px',
              }}>
                Related <span style={{ color: '#00D4FF' }}>Articles</span>
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}>
                {related.map(r => (
                  <Link key={r.id} href={`/news/${r.slug}/`} style={{ textDecoration: 'none' }}>
                    <article style={{
                      background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
                      borderRadius: '12px', overflow: 'hidden',
                    }}>
                      <div style={{ height: '130px', background: '#111', overflow: 'hidden' }}>
                        {r.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.cover_image_url} alt={r.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(135deg,#0A1F44,#0d3a6e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                          }}>📰</div>
                        )}
                      </div>
                      <div style={{ padding: '14px' }}>
                        {r.tags && r.tags.length > 0 && (
                          <span style={{
                            background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                            fontSize: '10px', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
                            marginBottom: '8px', display: 'inline-block',
                          }}>{r.tags[0]}</span>
                        )}
                        <p style={{
                          fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700,
                          color: '#FFFFFF', lineHeight: 1.3, marginTop: '6px', marginBottom: '8px',
                        }}>{r.title}</p>
                        <span style={{ fontSize: '11px', color: '#8E99A8' }}>{formatDate(r.published_at)}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── Pre-footer Ad ── */}
        <AdSlot zone="pre-footer" />

      </div>
    </>
  )
}
