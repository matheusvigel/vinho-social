export const queryKeys = {
  // Feed
  feed: (userId: string) => ['feed', userId] as const,

  // Adega
  cellar: (userId: string) => ['cellar', userId] as const,
  cellarWine: (id: string) => ['cellar', 'wine', id] as const,
  cellarStats: (userId: string) => ['cellar', userId, 'stats'] as const,

  // Catálogo
  catalog: (filters: object) => ['catalog', filters] as const,
  catalogWine: (id: string) => ['catalog', 'wine', id] as const,

  // Perfil
  profile: (username: string) => ['profile', username] as const,
  profileById: (id: string) => ['profile', 'id', id] as const,
  followers: (userId: string) => ['followers', userId] as const,
  following: (userId: string) => ['following', userId] as const,
  isFollowing: (followerId: string, followingId: string) =>
    ['isFollowing', followerId, followingId] as const,

  // Confrarias
  confrarias: (filters?: object) => ['confrarias', filters] as const,
  confraria: (slug: string) => ['confraria', slug] as const,
  confrariaMembers: (id: string) => ['confraria', id, 'members'] as const,
  confrariaEvents: (id: string) => ['confraria', id, 'events'] as const,
  myConfrarias: (userId: string) => ['confrarias', 'mine', userId] as const,

  // Atividades e comentários
  activity: (id: string) => ['activity', id] as const,
  comments: (activityId: string) => ['comments', activityId] as const,

  // Notificações
  notifications: (userId: string) => ['notifications', userId] as const,
  unreadCount: (userId: string) => ['notifications', userId, 'unread'] as const,

  // Busca
  search: (query: string, type: string) => ['search', type, query] as const,
}
