import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPriceRange } from '@/lib/utils'
import type { Brand } from '@/types'

// Fetch car brands from Supabase
async function getCarBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('type', 'car')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }
  return data || []
}

export default async function HomePage() {
  const carBrands = await getCarBrands()

  return (
    <div>

      {/* HERO */}
      <section style={{
        padding: '56px 24px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(0,212,255,0.05) 0%, transparent 60%)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          color: '#00D4FF',
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 14px',
          borderRadius: '20px',
          marginBottom: '20px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
        }}>
          🇮🇳 Cars · Bikes · Scooters — All in One Place
        </div>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '46px',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-1.5px',
          marginBottom: '14px',
          color: '#FFFFFF',
        }}>
          Research Smarter.<br />
          <span style={{ color: '#00D4FF' }}>Drive Better.</span>
        </h1>

        <p style={{
          color: '#C0C0C0',
          fontSize: '16px',
          maxWidth: '460px',
          margin: '0 auto 32px',
          lineHeight: 1.7,
        }}>
          Specs, prices, reviews and comparisons for every car, bike and scooter
          in India — unbiased, always updated.
        </p>

        {/* SEARCH BOX */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'var(--midnight)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '16px',
          padding: '18px',
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <select style={{
              flex: 1,
              minWidth: '140px',
              background: 'var(--deep-navy)',
              border: '1px solid rgba(0,212,255,0.15)',
              color: '#C0C0C0',
              fontSize: '13px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}>
              <option>Select Brand</option>
              {carBrands.map(brand => (
                <option key={brand.id} value={brand.slug}>{brand.name}</option>
              ))}
            </select>
            <select style={{
              flex: 1,
              minWidth: '140px',
              background: 'var(--deep-navy)',
              border: '1px solid rgba(0,212,255,0.15)',
              color: '#C0C0C0',
              fontSize: '13px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}>
              <option>Select City</option>
              <option>Chandigarh</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
            </select>
            <button style={{
              background: '#00D4FF',
              color: '#06142D',
              fontWeight: 900,
              fontSize: '13px',
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              Search →
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        flexWrap: 'wrap',
      }}>
        {[
          { num: '320+', lbl: 'Car Models' },
          { num: '280+', lbl: 'Bike Models' },
          { num: '120+', lbl: 'Scooters' },
          { num: '60+',  lbl: 'Brands' },
          { num: '48',   lbl: 'Cities' },
        ].map(stat => (
          <div key={stat.lbl} style={{
            textAlign: 'center',
            padding: '18px 32px',
            borderRight: '1px solid rgba(0,212,255,0.08)',
          }}>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '22px',
              fontWeight: 900,
              color: '#00D4FF',
            }}>{stat.num}</div>
            <div style={{
              fontSize: '11px',
              color: '#8E99A8',
              marginTop: '2px',
            }}>{stat.lbl}</div>
          </div>
        ))}
      </div>

      {/* CAR BRANDS FROM SUPABASE */}
      <section style={{
        padding: '38px 24px',
        borderBottom: '1px solid rgba(0,212,255,0.07)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}>
              Browse by <span style={{ color: '#00D4FF' }}>Car Brand</span>
            </h2>
            <div style={{ fontSize: '12px', color: '#8E99A8', marginTop: '4px' }}>
              {carBrands.length} brands available
            </div>
          </div>
          <Link href="/new-cars/" style={{
            fontSize: '13px',
            color: '#00D4FF',
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            All Brands →
          </Link>
        </div>

        {carBrands.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#8E99A8',
            background: '#111111',
            borderRadius: '14px',
            border: '1px solid rgba(0,212,255,0.12)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚗</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
              No brands yet
            </div>
            <div style={{ fontSize: '13px' }}>
              Add brands in your Supabase database to see them here.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
          }}>
            {carBrands.map(brand => (
              <Link
                key={brand.id}
                href={`/${brand.slug}-cars/`}
                style={{
                  background: '#111111',
                  border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: '14px',
                  padding: '18px 10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {/* Brand Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#00D4FF',
                }}>
                  {brand.name.slice(0, 2).toUpperCase()}
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#C0C0C0',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  {brand.name}
                </div>

                {brand.price_min && brand.price_max && (
                  <div style={{
                    fontSize: '10px',
                    color: '#00D4FF',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                    textAlign: 'center',
                  }}>
                    {formatPriceRange(brand.price_min, brand.price_max)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BODY TYPE */}
      <section style={{
        padding: '38px 24px',
        borderBottom: '1px solid rgba(0,212,255,0.07)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '22px',
          fontWeight: 800,
          marginBottom: '18px',
        }}>
          Cars by <span style={{ color: '#00D4FF' }}>Body Type</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
        }}>
          {[
            { icon: '🚙', name: 'SUV',       count: '82', href: '/suv-cars/' },
            { icon: '🚗', name: 'Hatchback', count: '44', href: '/hatchback-cars/' },
            { icon: '🚘', name: 'Sedan',     count: '28', href: '/sedan-cars/' },
            { icon: '🚐', name: 'MPV',       count: '16', href: '/mpv-cars/' },
            { icon: '⚡', name: 'Electric',  count: '24', href: '/electric-cars/' },
            { icon: '🏎️', name: 'Luxury',   count: '38', href: '/luxury-cars/' },
          ].map(bt => (
            <Link key={bt.href} href={bt.href} style={{
              background: '#111111',
              border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: '12px',
              padding: '18px 8px 13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: '26px' }}>{bt.icon}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#C0C0C0',
                fontFamily: 'Montserrat, sans-serif',
              }}>{bt.name}</span>
              <span style={{ fontSize: '10px', color: '#8E99A8' }}>{bt.count} cars</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}