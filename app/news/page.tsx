import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { getCanonicalUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Car News, Reviews & Updates 2026 | AutoPortal360',
  description: 'Latest car news, bike reviews, scooter updates and automotive industry news from India.',
  alternates: { canonical: getCanonicalUrl('/news/') },
  openGraph: {
    title: 'Car News, Reviews & Updates 2026 | AutoPortal360',
    description: 'Latest car news, bike reviews, scooter updates and automotive industry news from India.',
    url: getCanonicalUrl('/news/'),
    type: 'website',
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  author: string | null
  tags: string[] | null
  published_at: string | null
}

type Props = { searchParams: Promise<{ page?: string }> }

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function truncate(str: string | null, len: number): string {
  if (!str) return ''
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const from = (page - 1) * PER_PAGE
  const to   = from + PER_PAGE - 1

  const [countRes, postsRes] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, author, tags, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to),
  ])

  const totalPages   = Math.ceil((countRes.count ?? 0) / PER_PAGE)
  const posts        = (postsRes.data ?? []) as BlogPost[]
  const featuredPost = page === 1 && posts.length > 0 ? posts[0] : null
  // Exclude the featured post from the grid — slice(1) when featured, full list on page 2+
  const latestPosts  = featuredPost ? posts.slice(1) : posts

  return (
    <div>

      {/* ── Breadcrumb ── */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: '#8E99A8',
        }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>News & Reviews</span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <section style={{
        padding: '36px 24px 28px',
        background: 'linear-gradient(180deg,rgba(0,212,255,0.04) 0%,transparent 70%)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '10px', color: '#FFFFFF',
          }}>
            Car News & <span style={{ color: '#00D4FF' }}>Reviews</span>
          </h1>
          <p style={{ color: '#C0C0C0', fontSize: '15px', maxWidth: '640px', lineHeight: 1.7, margin: 0 }}>
            Latest automotive news, in-depth reviews and buying guides from India&apos;s trusted car portal.
          </p>
        </div>
      </section>

      {/* ── Hero Billboard ── */}
      <AdSlot zone="hero-billboard" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' }}>

        {posts.length === 0 ? (

          /* ── Coming Soon ── */
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📰</div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '12px',
            }}>
              Coming Soon
            </h2>
            <p style={{ color: '#8E99A8', fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: 1.7 }}>
              Our editorial team is working on articles. Check back soon for car news, reviews and buying guides.
            </p>
          </div>

        ) : (
          <>

            {/* ── Featured Post ── */}
            {featuredPost && (
              <section style={{ marginBottom: '52px' }}>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 800,
                  color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '1px',
                  marginBottom: '16px',
                }}>Featured</p>

                <Link href={`/news/${featuredPost.slug}/`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    background: '#0A1F44',
                    border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: '20px', overflow: 'hidden',
                  }}>
                    {featuredPost.cover_image_url ? (
                      <div style={{ height: '340px', overflow: 'hidden', position: 'relative', background: '#111' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featuredPost.cover_image_url}
                          alt={featuredPost.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(10,31,68,0.9) 0%, transparent 50%)',
                        }} />
                      </div>
                    ) : (
                      <div style={{
                        height: '180px',
                        background: 'linear-gradient(135deg,#0A1F44,#0d3a6e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px',
                      }}>📰</div>
                    )}

                    <div style={{ padding: '28px 32px 32px' }}>
                      {featuredPost.tags && featuredPost.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          {featuredPost.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                              color: '#00D4FF', fontSize: '11px', fontWeight: 700,
                              padding: '3px 10px', borderRadius: '20px',
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}

                      <h2 style={{
                        fontFamily: 'Montserrat, sans-serif', fontSize: '26px', fontWeight: 900,
                        color: '#FFFFFF', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.5px',
                      }}>
                        {featuredPost.title}
                      </h2>

                      {featuredPost.excerpt && (
                        <p style={{ color: '#C0C0C0', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
                          {featuredPost.excerpt}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#8E99A8' }}>
                          By {featuredPost.author ?? 'AutoPortal360 Editorial'}
                        </span>
                        <span style={{ color: '#444' }}>·</span>
                        <span style={{ fontSize: '12px', color: '#8E99A8' }}>{formatDate(featuredPost.published_at)}</span>
                        <span style={{
                          marginLeft: 'auto',
                          background: '#00D4FF', color: '#06142D',
                          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
                          fontSize: '12px', padding: '7px 18px', borderRadius: '8px',
                        }}>
                          Read More →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* ── Posts Grid (excludes featuredPost) ── */}
            {latestPosts.length > 0 && (
              <section style={{ marginBottom: '52px' }}>
                {featuredPost && (
                  <p style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 800,
                    color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '1px',
                    marginBottom: '20px',
                  }}>Latest Articles</p>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px',
                }}>
                  {latestPosts.map(post => (
                    <Link key={post.id} href={`/news/${post.slug}/`} style={{ textDecoration: 'none', display: 'flex' }}>
                      <article style={{
                        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
                        borderRadius: '16px', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', width: '100%',
                      }}>
                        <div style={{ height: '180px', background: '#111', overflow: 'hidden', flexShrink: 0 }}>
                          {post.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.cover_image_url} alt={post.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '100%', height: '100%',
                              background: 'linear-gradient(135deg,#0A1F44,#0d3a6e)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px',
                            }}>📰</div>
                          )}
                        </div>

                        <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {post.tags && post.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                              {post.tags.slice(0, 2).map(tag => (
                                <span key={tag} style={{
                                  background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                                  fontSize: '10px', fontWeight: 700,
                                  padding: '2px 8px', borderRadius: '20px',
                                  textTransform: 'uppercase', letterSpacing: '0.5px',
                                }}>{tag}</span>
                              ))}
                            </div>
                          )}

                          <h3 style={{
                            fontFamily: 'Montserrat, sans-serif', fontSize: '15px', fontWeight: 800,
                            color: '#FFFFFF', lineHeight: 1.3, marginBottom: '8px', flex: 1,
                          }}>
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p style={{ color: '#8E99A8', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>
                              {truncate(post.excerpt, 120)}
                            </p>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '11px', color: '#8E99A8' }}>{post.author ?? 'AutoPortal360'}</span>
                            <span style={{ color: '#333' }}>·</span>
                            <span style={{ fontSize: '11px', color: '#8E99A8' }}>{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginBottom: '48px', flexWrap: 'wrap',
              }}>
                {page > 1 && (
                  <Link href={`/news/?page=${page - 1}`} style={{
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00D4FF', padding: '8px 18px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  }}>← Prev</Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`/news/?page=${p}`} style={{
                    padding: '8px 14px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                    minWidth: '40px', textAlign: 'center',
                    background: p === page ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                    color: p === page ? '#06142D' : '#C0C0C0',
                    border: `1px solid ${p === page ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
                  }}>{p}</Link>
                ))}
                {page < totalPages && (
                  <Link href={`/news/?page=${page + 1}`} style={{
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00D4FF', padding: '8px 18px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  }}>Next →</Link>
                )}
              </div>
            )}

          </>
        )}
      </div>

      {/* ── Pre-footer Ad ── */}
      <AdSlot zone="pre-footer" />

    </div>
  )
}
