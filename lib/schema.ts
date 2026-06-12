const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoportal360.vercel.app'

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AutoPortal360',
    url: SITE_URL,
    description: "India's trusted automotive research portal for cars, bikes and scooters",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AutoPortal360',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function vehicleProductSchema({
  name,
  brand,
  description,
  imageUrl,
  priceMin,
  priceMax,
  url,
  modelYear,
  bodyType,
  fuelType,
  offerOverride,
}: {
  name: string
  brand: string
  description: string
  imageUrl?: string | null
  priceMin: number
  priceMax: number
  url: string
  modelYear?: number
  bodyType?: string | null
  fuelType?: string | null
  offerOverride?: object
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${brand} ${name}`,
    brand: { '@type': 'Brand', name: brand },
    description,
    ...(imageUrl ? { image: imageUrl } : {}),
    url,
    ...(modelYear ? { modelDate: modelYear.toString() } : {}),
    ...(bodyType ? { bodyType } : {}),
    ...(fuelType ? { fuelType } : {}),
    offers: offerOverride ?? {
      '@type': 'AggregateOffer',
      lowPrice: priceMin / 100000,
      highPrice: priceMax / 100000,
      priceCurrency: 'INR',
      offerCount: 1,
    },
  }
}

export function articleSchema({
  title,
  description,
  imageUrl,
  datePublished,
  dateModified,
  author,
  url,
}: {
  title: string
  description: string
  imageUrl?: string | null
  datePublished: string
  dateModified: string
  author: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished,
    dateModified,
    author: { '@type': 'Person', name: author },
    publisher: {
      '@type': 'Organization',
      name: 'AutoPortal360',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    url,
  }
}
