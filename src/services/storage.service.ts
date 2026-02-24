import { supabase } from './supabase'

const BUCKETS = {
  WINE_LABELS: 'wine-labels',
  USER_AVATARS: 'user-avatars',
  CONFRARIA_COVERS: 'confraria-covers',
} as const

function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const StorageService = {
  async uploadWinePhoto(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKETS.WINE_LABELS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) throw new Error(`Erro no upload: ${error.message}`)

    return getPublicUrl(BUCKETS.WINE_LABELS, fileName)
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage
      .from(BUCKETS.USER_AVATARS)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) throw new Error(`Erro no upload do avatar: ${error.message}`)

    return `${getPublicUrl(BUCKETS.USER_AVATARS, fileName)}?t=${Date.now()}`
  },

  async uploadCoverConfraria(file: File, confrariaId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${confrariaId}/cover.${ext}`

    const { error } = await supabase.storage
      .from(BUCKETS.CONFRARIA_COVERS)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) throw new Error(`Erro no upload da capa: ${error.message}`)

    return `${getPublicUrl(BUCKETS.CONFRARIA_COVERS, fileName)}?t=${Date.now()}`
  },

  async deleteWinePhoto(url: string): Promise<void> {
    const parts = url.split(`/${BUCKETS.WINE_LABELS}/`)
    if (parts.length < 2) return
    const path = parts[1].split('?')[0]
    await supabase.storage.from(BUCKETS.WINE_LABELS).remove([path])
  },
}
