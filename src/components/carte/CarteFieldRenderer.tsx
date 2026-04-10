'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type CarteFieldDef = {
  id: string
  name: string
  fieldType: string
  options: string[] | null
  isRequired: boolean
}

type Props = {
  field: CarteFieldDef
  value: unknown
  onChange: (value: unknown) => void
}

export function CarteFieldRenderer({ field, value, onChange }: Props) {
  const options = Array.isArray(field.options) ? field.options : []

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-700">
        {field.name}
        {field.isRequired && <span className="text-red-400 ml-0.5">*</span>}
      </Label>

      {field.fieldType === 'text' && (
        <Input
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.name}
        />
      )}

      {field.fieldType === 'textarea' && (
        <Textarea
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder={field.name}
        />
      )}

      {field.fieldType === 'number' && (
        <Input
          type="number"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.name}
        />
      )}

      {field.fieldType === 'date' && (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
        />
      )}

      {field.fieldType === 'select' && (
        <Select value={(value as string) || ''} onValueChange={v => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.fieldType === 'multi_select' && (
        <div className="flex flex-wrap gap-1.5">
          {options.map(opt => {
            const selected = Array.isArray(value) && value.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const current = Array.isArray(value) ? value : []
                  onChange(selected ? current.filter((v: string) => v !== opt) : [...current, opt])
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {field.fieldType === 'image' && (
        <Input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onChange(file.name)
          }}
        />
      )}
    </div>
  )
}
