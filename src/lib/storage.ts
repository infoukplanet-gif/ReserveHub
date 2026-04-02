import { createClient } from '@/lib/supabase/client'

const BUCKET = 'uploads'

/**
 * Supabase Storageに画像をアップロード
 * @returns 公開URL or null
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}
