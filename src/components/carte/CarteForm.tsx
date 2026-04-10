'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CarteFieldRenderer } from './CarteFieldRenderer'
import { toast } from 'sonner'

type Template = {
  id: string
  name: string
  fields: {
    id: string
    name: string
    fieldType: string
    options: string[] | null
    isRequired: boolean
    displayOrder: number
  }[]
}

type Props = {
  customerId: string
  onSaved: () => void
  onCancel: () => void
}

export function CarteForm({ customerId, onSaved, onCancel }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(r => {
        const tpls = r.data?.carteTemplates || []
        setTemplates(tpls)
        if (tpls.length > 0) setSelectedTemplateId(tpls[0].id)
      })
  }, [])

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const sortedFields = selectedTemplate?.fields.slice().sort((a, b) => a.displayOrder - b.displayOrder) || []

  const handleSave = async () => {
    if (!selectedTemplateId) {
      toast.error('テンプレートを選択してください')
      return
    }

    // 必須チェック
    for (const field of sortedFields) {
      if (field.isRequired) {
        const v = fieldValues[field.id]
        if (!v || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0)) {
          toast.error(`「${field.name}」は必須です`)
          return
        }
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/cartes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          data: fieldValues,
          memo: memo || undefined,
        }),
      })
      if (res.ok) {
        toast.success('カルテを記録しました')
        onSaved()
      } else {
        const err = await res.json()
        toast.error(err.message || '保存に失敗しました')
      }
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {templates.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-sm text-slate-400">カルテテンプレートがありません</p>
          <p className="text-xs text-slate-400">設定 &gt; カルテ設定からテンプレートを作成してください</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">テンプレート</Label>
            <Select value={selectedTemplateId} onValueChange={v => { if (v) { setSelectedTemplateId(v); setFieldValues({}) } }}>
              <SelectTrigger>
                <SelectValue placeholder="テンプレートを選択" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sortedFields.map(field => (
            <CarteFieldRenderer
              key={field.id}
              field={field}
              value={fieldValues[field.id]}
              onChange={v => setFieldValues(prev => ({ ...prev, [field.id]: v }))}
            />
          ))}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">メモ（自由記述）</Label>
            <Textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="追加メモがあれば記入" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>キャンセル</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存する'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
