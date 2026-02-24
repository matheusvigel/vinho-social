// ============================================================
// TIPOS DE DOMÍNIO — VinhoSocial
// ============================================================

export type WineType = 'tinto' | 'branco' | 'rose' | 'espumante' | 'sobremesa' | 'fortificado'
export type WineColor = 'tinto' | 'branco' | 'rose' | 'laranja'
export type ConfriariaPrivacy = 'publica' | 'privada' | 'oculta'
export type MemberRole = 'admin' | 'moderador' | 'membro'
export type ActivityType = 'wine_added' | 'wine_reviewed' | 'wine_shared' | 'joined_confraria' | 'event_checkin'
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'confraria_invite' | 'event_reminder'
export type InviteStatus = 'pendente' | 'aceito' | 'recusado'

// ============================================================
// PROFILE
// ============================================================

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  is_sommelier: boolean
  is_verified: boolean
  followers_count: number
  following_count: number
  wines_count: number
  created_at: string
  updated_at: string
}

// ============================================================
// WINE (Catálogo)
// ============================================================

export interface Wine {
  id: string
  name: string
  producer: string | null
  country: string
  region: string | null
  sub_region: string | null
  appellation: string | null
  vintage: number | null
  grape_varieties: string[] | null
  wine_type: WineType
  wine_color: WineColor | null
  alcohol_pct: number | null
  label_url: string | null
  description: string | null
  avg_rating: number
  ratings_count: number
  created_by: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// CELLAR WINE (Adega pessoal)
// ============================================================

export interface CellarWine {
  id: string
  user_id: string
  wine_id: string | null

  // Dados do catálogo (via join)
  wine?: Wine

  // Dados customizados
  custom_name: string | null
  custom_producer: string | null
  custom_country: string | null
  custom_region: string | null
  custom_vintage: number | null
  custom_grape_varieties: string[] | null
  custom_wine_type: WineType | null

  // Adega
  photo_url: string | null
  quantity: number
  purchase_price: number | null
  purchase_date: string | null
  drink_from: number | null
  drink_until: number | null
  storage_location: string | null

  // Avaliação (taças)
  rating: number | null
  tasting_notes: string | null
  pairing_notes: string | null
  is_favorite: boolean
  is_public: boolean

  added_at: string
  updated_at: string
}

// Nome resolvido (catálogo ou customizado)
export function getCellarWineName(wine: CellarWine): string {
  return wine.wine?.name ?? wine.custom_name ?? 'Vinho sem nome'
}

export function getCellarWineCountry(wine: CellarWine): string {
  return wine.wine?.country ?? wine.custom_country ?? '—'
}

export function getCellarWineVintage(wine: CellarWine): number | null {
  return wine.wine?.vintage ?? wine.custom_vintage ?? null
}

// ============================================================
// ACTIVITY (Feed)
// ============================================================

export interface Activity {
  id: string
  user_id: string
  activity_type: ActivityType
  cellar_wine_id: string | null
  wine_id: string | null
  confraria_id: string | null
  event_id: string | null
  metadata: Record<string, unknown>
  likes_count: number
  comments_count: number
  is_public: boolean
  created_at: string

  // Via joins
  author?: Profile
  cellar_wine?: CellarWine
  user_liked?: boolean
}

// ============================================================
// COMMENT
// ============================================================

export interface Comment {
  id: string
  activity_id: string
  user_id: string
  parent_id: string | null
  content: string
  likes_count: number
  created_at: string
  updated_at: string
  author?: Profile
  replies?: Comment[]
}

// ============================================================
// CONFRARIA
// ============================================================

export interface Confraria {
  id: string
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  privacy: ConfriariaPrivacy
  owner_id: string
  members_count: number
  wines_count: number
  events_count: number
  tags: string[] | null
  location: string | null
  created_at: string
  updated_at: string
  owner?: Profile
  user_role?: MemberRole | null // papel do usuário atual
}

export interface ConfrariaMember {
  confraria_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  profile?: Profile
}

export interface ConfrariaInvite {
  id: string
  confraria_id: string
  invited_by: string
  invited_user: string | null
  invite_token: string
  status: InviteStatus
  expires_at: string
  created_at: string
  confraria?: Confraria
  inviter?: Profile
}

// ============================================================
// EVENT
// ============================================================

export interface WineEvent {
  id: string
  confraria_id: string
  created_by: string
  title: string
  description: string | null
  cover_url: string | null
  location: string | null
  is_online: boolean
  online_link: string | null
  starts_at: string
  ends_at: string | null
  max_attendees: number | null
  attendees_count: number
  wines: string[] | null
  status: 'agendado' | 'em_andamento' | 'encerrado'
  created_at: string
  confraria?: Confraria
  user_attending?: boolean
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string
  recipient_id: string
  sender_id: string | null
  notification_type: NotificationType
  activity_id: string | null
  comment_id: string | null
  confraria_id: string | null
  message: string | null
  is_read: boolean
  created_at: string
  sender?: Profile
}

// ============================================================
// FORMS (react-hook-form)
// ============================================================

export interface AddWineFormData {
  // Catálogo ou customizado
  wine_id?: string
  custom_name?: string
  custom_producer?: string
  custom_country?: string
  custom_region?: string
  custom_vintage?: number
  custom_grape_varieties?: string
  custom_wine_type?: WineType

  quantity: number
  purchase_price?: number
  purchase_date?: string
  drink_from?: number
  drink_until?: number
  storage_location?: string
  rating?: number
  tasting_notes?: string
  pairing_notes?: string
  is_public: boolean
  is_favorite: boolean
}

export interface ConfrariaFormData {
  name: string
  description?: string
  privacy: ConfriariaPrivacy
  tags?: string
  location?: string
}

export interface EventFormData {
  title: string
  description?: string
  location?: string
  is_online: boolean
  online_link?: string
  starts_at: string
  ends_at?: string
  max_attendees?: number
}

// ============================================================
// UTILIDADES
// ============================================================

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  tinto: 'Tinto',
  branco: 'Branco',
  rose: 'Rosé',
  espumante: 'Espumante',
  sobremesa: 'Sobremesa',
  fortificado: 'Fortificado',
}

export const WINE_GLASS_LABELS: Record<number, string> = {
  1: 'Não vale a ressaca',
  2: 'Serve pra cozinhar',
  3: 'Tá bom pro dia a dia',
  4: 'Me traz a garrafa inteira',
  5: 'Me vê uma caixa!',
}

export const CONFRARIA_PRIVACY_LABELS: Record<ConfriariaPrivacy, string> = {
  publica: 'Pública',
  privada: 'Privada',
  oculta: 'Oculta',
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Administrador',
  moderador: 'Moderador',
  membro: 'Membro',
}
