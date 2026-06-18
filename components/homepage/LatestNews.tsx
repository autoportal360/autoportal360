import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Post = { title: string; slug: string; published_at: string | null; cover_image_url: string | null }

const PLACEHOLDERS: Post[] = [
  { title: 'Top 10 cars to buy in India under ₹10 lakh in 2026',           slug: '', published_at: null, cover_image_url: null },
  { title: 'Tata Curvv EV review: is this the best electric SUV in India?', slug: '', published_at: null, cover_image_url: null },
  { title: 'Royal Enfield Guerrilla 450 vs Classic 350: which to choose?',  slug: '', published_at: null, cover_image_url: null },
]

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function LatestNews() {
  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, published_at, cover_image_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  const posts: Post[] = (data && data.length >= 3) ? (data as Post[]) : PLACEHOLDERS

  return (
    <section style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div className="ap-section-title">Latest auto news</div>
          <Link href="/news/" className="ap-section-link">All news →</Link>
        </div>

        <div className="ap-news-grid">
          {posts.map((post, i) => {
            const href = post.slug ? `/news/${post.slug}/` : '/news/'
            return (
              <Link key={i} href={href} className="ap-news-card">
                <div className="ap-news-img">
                  {post.cover_image_url
                    ? <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📰'
                  }
                </div>
                <div className="ap-news-body">
                  <div className="ap-news-title">{post.title}</div>
                  {post.published_at && (
                    <div className="ap-news-date">{formatDate(post.published_at)}</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
