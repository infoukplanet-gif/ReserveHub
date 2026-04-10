'use client'

import { THEMES, type ThemeId } from '@/lib/themes'
import { useTheme } from './ThemeProvider'

type Props = {
  onSelect?: (theme: ThemeId) => void
}

export function ThemeSwitcher({ onSelect }: Props) {
  const { theme, setTheme } = useTheme()

  const handleSelect = (id: ThemeId) => {
    setTheme(id)
    onSelect?.(id)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          className={`rounded-xl border-2 p-3 text-left transition-all ${
            theme === t.id
              ? 'border-blue-600 ring-2 ring-blue-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Preview swatch */}
          <div
            className="h-16 rounded-lg mb-2 flex items-center justify-center"
            style={{ background: t.preview.bg }}
          >
            <div
              className="w-3/4 h-8 rounded-md"
              style={{
                background: t.preview.card,
                border: `1px solid ${t.preview.border}`,
                boxShadow: t.id === 'neumorphic'
                  ? '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(0,0,0,0.1)'
                  : t.id === 'glassmorphic' || t.id === 'liquid-glass'
                    ? '0 4px 16px rgba(0,0,0,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                backdropFilter: t.id === 'glassmorphic' ? 'blur(8px)' : t.id === 'liquid-glass' ? 'blur(20px) saturate(180%)' : undefined,
              }}
            />
          </div>
          <p className="text-xs font-medium text-slate-900">{t.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{t.description}</p>
        </button>
      ))}
    </div>
  )
}
