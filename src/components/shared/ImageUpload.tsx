'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/storage'
import { toast } from 'sonner'

type ImageInfo = { width: number; height: number; size: number }

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/** 画像をリサイズする */
async function resizeImage(file: File, maxWidth: number, maxHeight: number, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w <= maxWidth && h <= maxHeight) { resolve(file); return }

      const ratio = Math.min(maxWidth / w, maxHeight / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        else resolve(file)
      }, 'image/jpeg', quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

/** 画像のサイズを取得 */
function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height, size: file.size })
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'images',
  className = '',
  placeholder = '画像をアップロード',
  height = 'h-32',
  recommendedSize,
  maxWidth = 1920,
  maxHeight = 1080,
}: {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  className?: string
  placeholder?: string
  height?: string
  recommendedSize?: string // 例: "1200×400px"
  maxWidth?: number
  maxHeight?: number
}) {
  const [uploading, setUploading] = useState(false)
  const [showResize, setShowResize] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('画像ファイルを選択してください'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('ファイルサイズは10MB以下にしてください'); return }

    const info = await getImageInfo(file)
    setImageInfo(info)
    setPendingFile(file)

    // リサイズが必要か判定
    if (info.width > maxWidth || info.height > maxHeight) {
      setShowResize(true)
    } else {
      await doUpload(file)
    }
  }

  const doUpload = async (file: File) => {
    setShowResize(false)
    setPendingFile(null)
    setUploading(true)
    const url = await uploadImage(file, folder)
    if (url) { onChange(url); toast.success('アップロードしました') }
    else toast.error('アップロードに失敗しました')
    setUploading(false)
  }

  const handleUploadOriginal = () => { if (pendingFile) doUpload(pendingFile) }

  const handleUploadResized = async () => {
    if (!pendingFile) return
    setShowResize(false)
    setUploading(true)
    const resized = await resizeImage(pendingFile, maxWidth, maxHeight)
    const resizedInfo = await getImageInfo(resized)
    toast.success(`${resizedInfo.width}×${resizedInfo.height}px にリサイズしました`)
    await doUpload(resized)
  }

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* リサイズ確認ダイアログ */}
      {showResize && imageInfo && pendingFile && (
        <div className="border rounded-xl p-4 bg-amber-50 border-amber-200 space-y-3 mb-3">
          <p className="text-sm font-medium text-amber-800">画像サイズが大きいです</p>
          <div className="text-xs text-amber-700 space-y-1">
            <p>元のサイズ: <strong>{imageInfo.width}×{imageInfo.height}px</strong>（{formatFileSize(imageInfo.size)}）</p>
            <p>推奨最大: <strong>{maxWidth}×{maxHeight}px</strong></p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUploadResized} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium">
              {maxWidth}×{maxHeight}に縮小してアップ
            </button>
            <button onClick={handleUploadOriginal} className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-600">
              そのままアップ
            </button>
          </div>
          <button onClick={() => { setShowResize(false); setPendingFile(null) }} className="text-xs text-slate-400 hover:text-slate-600">キャンセル</button>
        </div>
      )}

      {value ? (
        <div className={`relative ${height} rounded-xl overflow-hidden group`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-900">変更</button>
            <button onClick={() => onChange(null)} className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-600">削除</button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className={`flex flex-col items-center justify-center ${height} w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors`}>
          {uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          ) : (
            <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
          )}
          <p className="text-xs text-slate-400 mt-1">{uploading ? 'アップロード中...' : placeholder}</p>
          {recommendedSize && <p className="text-[10px] text-slate-300 mt-0.5">推奨: {recommendedSize}</p>}
        </button>
      )}
    </div>
  )
}
