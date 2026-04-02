'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type Menu = { id: string; name: string; description: string | null; durationMinutes: number; basePrice: number; priceRange: string; menuOptions: { id: string; name: string; price: number; durationMinutes: number }[]; pricingRules: { price: number }[] }
type Staff = { id: string; name: string; role: string; nominationFee: number; bio: string | null }
type TimeSlot = { startsAt: string; endsAt: string; availableStaff: { id: string; name: string; nominationFee: number }[] }

function formatPrice(p: number) { return `¥${p.toLocaleString()}` }
function getPriceRange(base: number, rules: { price: number }[]) {
  const prices = [base, ...rules.map(r => r.price)]
  const min = Math.min(...prices), max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)}〜${formatPrice(max)}`
}

const STEPS = ['メニュー', 'オプション', 'スタッフ', '日時', '情報', '確認']

export default function BookingPage() {
  const { slug } = useParams()
  const [step, setStep] = useState(0)
  const [menus, setMenus] = useState<Menu[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState('none')
  const [selectedDate, setSelectedDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState({ name: '', kana: '', email: '', phone: '', memo: '' })
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // メニュー読み込み
  useEffect(() => {
    fetch(`/api/public/${slug}/menus`).catch(() => fetch('/api/menus'))
      .then(r => r.json())
      .then(r => {
        const data = (r.data || []).map((m: Menu & { pricingRules: { price: number }[] }) => ({ ...m, priceRange: getPriceRange(m.basePrice, m.pricingRules || []) }))
        setMenus(data)
        setLoading(false)
      })
      .catch(() => { setLoading(false) })
  }, [slug])

  // スタッフ読み込み
  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(r => setStaffList(r.data || []))
  }, [])

  // 空き枠読み込み
  useEffect(() => {
    if (!selectedMenu || !selectedDate) return
    const params = new URLSearchParams({ tenantSlug: slug as string, menuId: selectedMenu, date: selectedDate })
    if (selectedStaff !== 'none') params.set('staffId', selectedStaff)
    if (selectedOptions.length > 0) params.set('optionIds', selectedOptions.join(','))
    fetch(`/api/reservations/availability?${params}`)
      .then(r => r.json())
      .then(r => setSlots(r.slots || []))
      .catch(() => setSlots([]))
  }, [selectedMenu, selectedDate, selectedStaff, selectedOptions, slug])

  const menu = menus.find(m => m.id === selectedMenu)
  const staff = staffList.find(s => s.id === selectedStaff)
  const options = menu?.menuOptions.filter(o => selectedOptions.includes(o.id)) || []
  const slot = slots.find(s => s.startsAt === selectedTime)

  const menuPrice = menu?.basePrice || 0
  const optionTotal = options.reduce((s, o) => s + o.price, 0)
  const nominationFee = staff?.nominationFee || 0
  const totalPrice = menuPrice + optionTotal + nominationFee

  const canProceed = () => {
    if (step === 0) return !!selectedMenu
    if (step === 3) return !!selectedTime
    if (step === 4) return customerInfo.name && customerInfo.email && customerInfo.phone
    return true
  }

  const handleSubmit = async () => {
    if (!selectedMenu || !selectedTime) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenu,
          staffId: selectedStaff === 'none' ? null : selectedStaff,
          startsAt: selectedTime,
          optionIds: selectedOptions,
          customer: customerInfo,
        }),
      })
      if (res.ok) { setCompleted(true) }
      else { const data = await res.json(); toast.error(data.error || '予約に失敗しました') }
    } catch { toast.error('通信エラーが発生しました') }
    finally { setSubmitting(false) }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-sm"><CardContent className="p-8 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto"><span className="material-symbols-outlined text-3xl text-green-600">check</span></div>
          <h1 className="text-xl font-bold text-slate-900">ご予約が確定しました</h1>
          <p className="text-sm text-slate-500">確認メールを {customerInfo.email} に送信しました。</p>
        </CardContent></Card>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {step > 0 && <button onClick={() => setStep(step - 1)}><span className="material-symbols-outlined text-[20px] text-slate-500">arrow_back</span></button>}
          <span className="font-semibold text-slate-900">予約</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}`}>{i < step ? '✓' : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`w-4 sm:w-8 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Menu */}
        {step === 0 && <div className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">メニューを選ぶ</h2>
          {menus.map(m => (
            <button key={m.id} onClick={() => setSelectedMenu(m.id)} className="w-full text-left">
              <Card className={`border transition-all ${selectedMenu === m.id ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}><CardContent className="p-4">
                <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-900">{m.name}</p>{m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}<p className="text-xs text-slate-400 mt-1">{m.durationMinutes}分</p></div><p className="text-sm font-semibold text-slate-900 shrink-0 ml-4">{m.priceRange}</p></div>
              </CardContent></Card>
            </button>
          ))}
        </div>}

        {/* Step 2: Options */}
        {step === 1 && menu && <div className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">オプションを追加</h2><button onClick={() => setStep(2)} className="text-xs text-blue-600">スキップ</button></div>
          {menu.menuOptions.length === 0 ? <Card><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">オプションはありません</p></CardContent></Card> :
            menu.menuOptions.map(o => (
              <button key={o.id} onClick={() => setSelectedOptions(prev => prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id])} className="w-full text-left">
                <Card className={`border transition-all ${selectedOptions.includes(o.id) ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-900">{o.name}</p><p className="text-xs text-slate-400">+{o.durationMinutes}分</p></div><p className="text-sm font-semibold">+{formatPrice(o.price)}</p></CardContent></Card>
              </button>
            ))}
        </div>}

        {/* Step 3: Staff */}
        {step === 2 && <div className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">スタッフを選ぶ</h2>
          <button onClick={() => setSelectedStaff('none')} className="w-full text-left"><Card className={`border transition-all ${selectedStaff === 'none' ? 'border-blue-600 bg-blue-50/50' : ''}`}><CardContent className="p-4"><p className="text-sm font-medium">指名なし</p><p className="text-xs text-slate-400">空いているスタッフが担当</p></CardContent></Card></button>
          {staffList.map(s => (
            <button key={s.id} onClick={() => setSelectedStaff(s.id)} className="w-full text-left"><Card className={`border transition-all ${selectedStaff === s.id ? 'border-blue-600 bg-blue-50/50' : ''}`}><CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 shrink-0">{s.name[0]}</div>
              <div className="flex-1"><p className="text-sm font-medium">{s.name}</p>{s.bio && <p className="text-xs text-slate-400">{s.bio}</p>}</div>
              {s.nominationFee > 0 && <p className="text-xs text-slate-500">+{formatPrice(s.nominationFee)}</p>}
            </CardContent></Card></button>
          ))}
        </div>}

        {/* Step 4: DateTime */}
        {step === 3 && <div className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">日時を選ぶ</h2>
          <div className="space-y-2"><Label>日付</Label><Input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(null) }} min={new Date().toISOString().split('T')[0]} /></div>
          <h3 className="text-sm font-semibold text-slate-900">{selectedDate} の空き時間</h3>
          {slots.length === 0 ? <Card><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">空き枠がありません</p></CardContent></Card> :
            <div className="space-y-2">{slots.map(s => {
              const time = new Date(s.startsAt)
              const timeStr = `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}`
              return (
                <button key={s.startsAt} onClick={() => setSelectedTime(s.startsAt)} className="w-full text-left">
                  <Card className={`border transition-all ${selectedTime === s.startsAt ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}><CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{timeStr}</span>
                    <span className="text-xs text-slate-400">{s.availableStaff.length}名対応可</span>
                  </CardContent></Card>
                </button>
              )
            })}</div>}
        </div>}

        {/* Step 5: Info */}
        {step === 4 && <div className="space-y-5"><h2 className="text-lg font-semibold text-slate-900">お客様情報</h2>
          <div className="space-y-2"><Label>お名前 *</Label><Input value={customerInfo.name} onChange={e => setCustomerInfo(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-2"><Label>フリガナ</Label><Input value={customerInfo.kana} onChange={e => setCustomerInfo(p => ({ ...p, kana: e.target.value }))} /></div>
          <div className="space-y-2"><Label>メールアドレス *</Label><Input type="email" value={customerInfo.email} onChange={e => setCustomerInfo(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="space-y-2"><Label>電話番号 *</Label><Input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo(p => ({ ...p, phone: e.target.value }))} /></div>
          <div className="space-y-2"><Label>備考</Label><Textarea value={customerInfo.memo} onChange={e => setCustomerInfo(p => ({ ...p, memo: e.target.value }))} /></div>
        </div>}

        {/* Step 6: Confirm */}
        {step === 5 && <div className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">予約内容の確認</h2>
          <Card><CardContent className="p-4 space-y-3 text-sm">
            <div><span className="text-slate-400">メニュー:</span> <span className="text-slate-900">{menu?.name}</span></div>
            {options.length > 0 && <div><span className="text-slate-400">オプション:</span> {options.map(o => o.name).join(', ')}</div>}
            {staff && staff.id !== 'none' && <div><span className="text-slate-400">担当:</span> {staff.name}</div>}
            {selectedTime && <div><span className="text-slate-400">日時:</span> {new Date(selectedTime).toLocaleString('ja-JP')}</div>}
            <Separator />
            <div className="flex justify-between"><span className="text-slate-500">メニュー</span><span>{formatPrice(menuPrice)}</span></div>
            {optionTotal > 0 && <div className="flex justify-between"><span className="text-slate-500">オプション</span><span>+{formatPrice(optionTotal)}</span></div>}
            {nominationFee > 0 && <div className="flex justify-between"><span className="text-slate-500">指名料</span><span>+{formatPrice(nominationFee)}</span></div>}
            <Separator />
            <div className="flex justify-between font-semibold text-base"><span>合計</span><span className="text-xl">{formatPrice(totalPrice)}</span></div>
            <Separator />
            <div><span className="text-slate-400">お名前:</span> {customerInfo.name}</div>
            <div><span className="text-slate-400">メール:</span> {customerInfo.email}</div>
          </CardContent></Card>
        </div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {step >= 1 && <div><p className="text-xs text-slate-400">合計</p><p className="text-lg font-bold">{formatPrice(totalPrice)}</p></div>}
          <Button className={step < 1 ? 'w-full' : 'ml-auto'} disabled={!canProceed() || submitting} onClick={() => { step === 5 ? handleSubmit() : setStep(step + 1) }}>
            {step === 5 ? (submitting ? '予約中...' : '予約を確定する') : '次へ進む'}
          </Button>
        </div>
      </div>
    </div>
  )
}
