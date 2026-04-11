'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  className?: string
}

export default function DatePicker({ value, onChange, minDate, maxDate, placeholder = '日付を選択', className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + 'T00:00:00') : null
  const [viewMonth, setViewMonth] = useState(() => selected || new Date())

  const min = minDate ? startOfDay(new Date(minDate + 'T00:00:00')) : null
  const max = maxDate ? startOfDay(new Date(maxDate + 'T00:00:00')) : null

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isDisabled = (day: Date) => {
    if (min && isBefore(day, min)) return true
    if (max && isBefore(max, day)) return true
    return false
  }

  const handleSelect = (day: Date) => {
    if (isDisabled(day)) return
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-left hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        {selected ? (
          <span className="text-slate-900 font-medium">{format(selected, 'yyyy年M月d日（E）', { locale: ja })}</span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <span className="material-symbols-outlined text-[20px] text-slate-400">calendar_today</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-[320px] rounded-2xl bg-white shadow-xl border border-slate-100 p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">chevron_left</span>
              </button>
              <span className="text-sm font-bold text-slate-900">
                {format(viewMonth, 'yyyy年 M月', { locale: ja })}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">chevron_right</span>
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cn(
                  'text-center text-[11px] font-medium py-1',
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'
                )}>
                  {d}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map(day => {
                const inMonth = isSameMonth(day, viewMonth)
                const isSelected = selected && isSameDay(day, selected)
                const disabled = isDisabled(day)
                const today = isToday(day)
                const dayOfWeek = day.getDay()

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelect(day)}
                    disabled={disabled}
                    className={cn(
                      'relative flex items-center justify-center h-10 rounded-xl text-sm transition-all',
                      disabled && 'opacity-30 cursor-not-allowed',
                      !inMonth && 'opacity-20',
                      inMonth && !disabled && !isSelected && 'hover:bg-blue-50 hover:text-blue-600',
                      isSelected && 'bg-blue-600 text-white font-semibold shadow-sm',
                      !isSelected && today && 'font-bold',
                      !isSelected && !disabled && inMonth && dayOfWeek === 0 && 'text-red-500',
                      !isSelected && !disabled && inMonth && dayOfWeek === 6 && 'text-blue-500',
                    )}
                  >
                    {format(day, 'd')}
                    {today && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 今日ボタン */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  setViewMonth(today)
                  if (!isDisabled(today)) handleSelect(today)
                }}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                今日
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
