import { createBrowserClient } from '@supabase/ssr'

const BUCKET = 'uploads'

// Storage APIはanon keyが必要（publishable keyでは動かない場合がある）
function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  return createBrowserClient(url, key)
}

/**
 * Supabase Storageに画像をアップロード
 * @returns 公開URL or null
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<string | null> {
  const supabase = getStorageClient()
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
