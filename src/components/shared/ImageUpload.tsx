'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/storage'
import { toast } from 'sonner'

export default function ImageUpload({
  value,
  onChange,
  folder = 'images',
  className = '',
  placeholder = '画像をアップロード',
  height = 'h-32',
}: {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  className?: string
  placeholder?: string
  height?: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください')
      return
    }

    setUploading(true)
    const url = await uploadImage(file, folder)
    if (url) {
      onChange(url)
      toast.success('アップロードしました')
    } else {
      toast.error('アップロードに失敗しました')
    }
    setUploading(false)
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {value ? (
        <div className={`relative ${height} rounded-xl overflow-hidden group`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-900"
            >
              変更
            </button>
            <button
              onClick={() => onChange(null)}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-600"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center justify-center ${height} w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors`}
        >
          <div className="text-center">
            {uploading ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            ) : (
              <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
            )}
            <p className="text-xs text-slate-400 mt-1">{uploading ? 'アップロード中...' : placeholder}</p>
          </div>
        </button>
      )}
    </div>
  )
}
