export const ROUTES = {
  // Auth
  LOGIN: '/entrar',
  REGISTER: '/cadastrar',
  FORGOT_PASSWORD: '/esqueci-senha',
  RESET_PASSWORD: '/redefinir-senha',

  // App
  FEED: '/',

  // Adega
  CELLAR: '/adega',
  CELLAR_ADD: '/adega/adicionar',
  CELLAR_WINE: '/adega/:id',

  // Catálogo
  CATALOG: '/catalogo',
  CATALOG_WINE: '/catalogo/:id',

  // Social
  SEARCH: '/buscar',
  NOTIFICATIONS: '/notificacoes',

  // Confrarias
  CONFRARIAS: '/confrarias',
  CONFRARIA: '/confrarias/:slug',
  CONFRARIA_NEW: '/confrarias/criar',

  // Perfil
  PROFILE: '/perfil/:username',
  PROFILE_EDIT: '/perfil/editar',
} as const

export function routeTo(route: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route,
  )
}
