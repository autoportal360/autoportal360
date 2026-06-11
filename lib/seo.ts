export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoportal360.vercel.app'
  return `${baseUrl}${path}`
}

export function getRobotsDirective(noindex: boolean = false): string {
  return noindex ? 'noindex, nofollow' : 'index, follow'
}
