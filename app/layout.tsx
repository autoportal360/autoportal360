import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/app/components/ConditionalLayout'
import { getTrackingSettings, parseCustomScripts } from '@/lib/tracking'

export const metadata: Metadata = {
  title: {
    default: 'AutoPortal360 — Cars, Bikes & Scooters in India',
    template: '%s | AutoPortal360',
  },
  description: 'Research new cars, bikes and scooters in India. Compare prices, specs and reviews.',
  metadataBase: new URL('https://autoportal360.com'),
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const s = await getTrackingSettings()

  const ga4Init = s.ga4_id
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga4_id}',{page_path:window.location.pathname});`
    : ''

  const gtmHead = s.gtm_id
    ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtm_id}');`
    : ''

  const gtmNoScript = s.gtm_id
    ? `<iframe src="https://www.googletagmanager.com/ns.html?id=${s.gtm_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    : ''

  const fbPixel = s.facebook_pixel_id
    ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.facebook_pixel_id}');fbq('track','PageView');`
    : ''

  const headScripts = s.custom_head_scripts
    ? parseCustomScripts(s.custom_head_scripts)
    : []

  const bodyScripts = s.custom_body_scripts
    ? parseCustomScripts(s.custom_body_scripts)
    : []

  return (
    <html lang="en">
      <head>
        {/* Google Search Console */}
        {s.gsc_verification && (
          <meta name="google-site-verification" content={s.gsc_verification} />
        )}

        {/* GA4 */}
        {s.ga4_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4_id}`} />
            <script dangerouslySetInnerHTML={{ __html: ga4Init }} />
          </>
        )}

        {/* GTM (head portion) */}
        {s.gtm_id && (
          <script dangerouslySetInnerHTML={{ __html: gtmHead }} />
        )}

        {/* Facebook Pixel */}
        {s.facebook_pixel_id && (
          <script dangerouslySetInnerHTML={{ __html: fbPixel }} />
        )}

        {/* Custom head scripts */}
        {headScripts.map((sc, i) =>
          sc.src
            ? <script key={i} src={sc.src} async={sc.isAsync} />
            : <script key={i} dangerouslySetInnerHTML={{ __html: sc.content! }} />
        )}
      </head>

      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* GTM (noscript fallback — immediately after <body>) */}
        {s.gtm_id && (
          <noscript dangerouslySetInnerHTML={{ __html: gtmNoScript }} />
        )}

        <ConditionalLayout>{children}</ConditionalLayout>

        {/* Custom body scripts */}
        {bodyScripts.map((sc, i) =>
          sc.src
            ? <script key={i} src={sc.src} async={sc.isAsync} />
            : <script key={i} dangerouslySetInnerHTML={{ __html: sc.content! }} />
        )}
      </body>
    </html>
  )
}
