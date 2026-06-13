export type AdminRole = 'super_admin' | 'catalogue' | 'editor' | 'seo'

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  catalogue:   ['brands', 'models', 'slider', 'cities', 'states'],
  editor:      ['blog', 'pages'],
  seo:         ['seo', 'pages'],
}

export function hasPermission(role: AdminRole, section: string): boolean {
  const perms = ROLE_PERMISSIONS[role]
  return perms.includes('*') || perms.includes(section)
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  catalogue:   'Catalogue',
  editor:      'Editor',
  seo:         'SEO',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: '#FF4D4D',
  catalogue:   '#FFB400',
  editor:      '#00D4FF',
  seo:         '#00CC66',
}
