'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// 仮データ
const MENUS = [
  { id: '1', name: 'ボディケア60分コース', description: '肩こり・腰痛にお悩みの方に', duration: 60, priceRange: '¥8,000〜¥10,000', options: [
    { id: 'o1', name: 'ヘッドスパ追加', price: 1500, duration: 15 },
    { id: 'o2', name: 'アロマ変更', price: 500, duration: 0 },
    { id: 'o3', name: '延長15分', price: 2000, duration: 15 },
  ]},
  { id: '2', name: 'ボディケア90分コース', description: 'じっくり全身ケア', duration: 90, priceRange: '¥11,000〜¥13,000', options: [] },
  { id: '3', name: 'フェイシャル45分', description: '小顔・リフトアップ', duration: 45, priceRange: '¥6,000〜', options: [] },
]

const STAFF = [
  { id: 'none', name: '指名なし', role: '空いているスタッフが担当', fee: 0 },
  { id: 's1', name: '山田 花子', role: 'チーフセラピスト', fee: 500 },
  { id: 's2', name: '佐藤 健太', role: 'セラピスト', fee: 0 },
  { id: 's3', name: '鈴木 美咲', role: 'セラピスト', fee: 500 },
]

const TIME_SLOTS = [
  { time: '10:00', price: 10000, label: '休日料金' },
  { time: '11:30', price: 10000, label: '休日料金' },
  { time: '13:00', price: 10000, label: '休日料金' },
  { time: '14:30', price: 10000, label: '休日料金' },
  { time: '16:00', price: 10000, label: '休日料金' },
]

const STEPS = ['メニュー', 'オプション', 'スタッフ', '日時', '情報', '確認']

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

export default function BookingPage() {
  const [step, setStep] = useState(0)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState('none')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState({ name: '', kana: '', email: '', phone: '', memo: '' })

  const menu = MENUS.find((m) => m.id === selectedMenu)
  const staff = STAFF.find((s) => s.id === selectedStaff)
  const options = menu?.options.filter((o) => selectedOptions.includes(o.id)) || []
  const slot = TIME_SLOTS.find((s) => s.time === selectedTime)

  const menuPrice = slot?.price || 8000
  const optionTotal = options.reduce((sum, o) => sum + o.price, 0)
  const nominationFee = staff?.fee || 0
  const totalPrice = menuPrice + optionTotal + nominationFee

  const canProceed = () => {
    if (step === 0) return !!selectedMenu
    if (step === 1) return true
    if (step === 2) return true
    if (step === 3) return !!selectedTime
    if (step === 4) return customerInfo.name && customerInfo.email && customerInfo.phone
    return true
  }

  const [completed, setCompleted] = useState(false)

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <span className="material-symbols-outlined text-3xl text-green-600">check</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">ご予約が確定しました</h1>
            <p className="text-sm text-slate-500">確認メールを {customerInfo.email} に送信しました。</p>
            <Card className="border shadow-none text-left">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">日時</span><span className="text-slate-900">2026年4月5日(日) {selectedTime}〜</span></div>
                <div className="flex justify-between"><span className="text-slate-500">メニュー</span><span className="text-slate-900">{menu?.name}</span></div>
                {staff && staff.id !== 'none' && <div className="flex justify-between"><span className="text-slate-500">担当</span><span className="text-slate-900">{staff.name}</span></div>}
                <Separator />
                <div className="flex justify-between font-semibold"><span>合計</span><span className="text-lg">{formatPrice(totalPrice)}</span></div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-900">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <span className="font-semibold text-slate-900">予約</span>
          <span className="text-xs text-slate-400 ml-auto">BLOOM</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < step ? 'bg-blue-600 text-white' :
                i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-slate-200 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] hidden sm:block ${i === step ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-4 sm:w-8 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Menu */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">メニューを選ぶ</h2>
            {MENUS.map((m) => (
              <button key={m.id} onClick={() => setSelectedMenu(m.id)} className="w-full text-left">
                <Card className={`border transition-all ${selectedMenu === m.id ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{m.duration}分</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 shrink-0 ml-4">{m.priceRange}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Options */}
        {step === 1 && menu && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">オプションを追加</h2>
              <button onClick={() => setStep(2)} className="text-xs text-blue-600 font-medium">スキップ</button>
            </div>
            {menu.options.length === 0 ? (
              <Card><CardContent className="py-8 text-center">
                <p className="text-sm text-slate-400">このメニューにオプションはありません</p>
              </CardContent></Card>
            ) : (
              menu.options.map((o) => (
                <button key={o.id} onClick={() => setSelectedOptions(prev => prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id])} className="w-full text-left">
                  <Card className={`border transition-all ${selectedOptions.includes(o.id) ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{o.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">+{o.duration}分</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">+{formatPrice(o.price)}</p>
                    </CardContent>
                  </Card>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 3: Staff */}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">スタッフを選ぶ</h2>
            {STAFF.map((s) => (
              <button key={s.id} onClick={() => setSelectedStaff(s.id)} className="w-full text-left">
                <Card className={`border transition-all ${selectedStaff === s.id ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 shrink-0">
                      {s.id === 'none' ? '−' : s.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.role}</p>
                    </div>
                    {s.fee > 0 && <p className="text-xs text-slate-500">指名料 +{formatPrice(s.fee)}</p>}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: DateTime */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">日時を選ぶ</h2>
            {/* Simple calendar placeholder */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <button className="text-slate-400">◀</button>
                  <p className="text-sm font-semibold text-slate-900">2026年4月</p>
                  <button className="text-slate-400">▶</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                    <span key={d} className={`py-1 font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</span>
                  ))}
                  {Array.from({ length: 3 }, (_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1
                    const isSelected = day === 5
                    const isWed = (i + 3) % 7 === 3
                    return (
                      <button
                        key={day}
                        disabled={isWed}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' :
                          isWed ? 'text-slate-200' :
                          'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <h3 className="text-sm font-semibold text-slate-900">4月5日(日)の空き時間</h3>
            <div className="space-y-2">
              {TIME_SLOTS.map((s) => (
                <button key={s.time} onClick={() => setSelectedTime(s.time)} className="w-full text-left">
                  <Card className={`border transition-all ${selectedTime === s.time ? 'border-blue-600 bg-blue-50/50' : 'hover:border-slate-300'}`}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{s.time}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{s.label}</Badge>
                        <span className="text-sm font-semibold text-slate-900">{formatPrice(s.price)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Customer Info */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">お客様情報</h2>
            <div className="space-y-2">
              <Label>お名前 *</Label>
              <Input value={customerInfo.name} onChange={(e) => setCustomerInfo(p => ({ ...p, name: e.target.value }))} placeholder="山田 太郎" />
            </div>
            <div className="space-y-2">
              <Label>フリガナ</Label>
              <Input value={customerInfo.kana} onChange={(e) => setCustomerInfo(p => ({ ...p, kana: e.target.value }))} placeholder="ヤマダ タロウ" />
            </div>
            <div className="space-y-2">
              <Label>メールアドレス *</Label>
              <Input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo(p => ({ ...p, email: e.target.value }))} placeholder="yamada@example.com" />
            </div>
            <div className="space-y-2">
              <Label>電話番号 *</Label>
              <Input type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo(p => ({ ...p, phone: e.target.value }))} placeholder="090-1234-5678" />
            </div>
            <div className="space-y-2">
              <Label>備考（任意）</Label>
              <Textarea value={customerInfo.memo} onChange={(e) => setCustomerInfo(p => ({ ...p, memo: e.target.value }))} placeholder="ご要望があれば" />
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">予約内容の確認</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">calendar_today</span>
                    <div>
                      <p className="text-xs text-slate-400">日時</p>
                      <p className="text-slate-900">2026年4月5日(日) {selectedTime}〜</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">restaurant_menu</span>
                    <div>
                      <p className="text-xs text-slate-400">メニュー</p>
                      <p className="text-slate-900">{menu?.name}</p>
                    </div>
                  </div>
                  {options.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">add_circle</span>
                      <div>
                        <p className="text-xs text-slate-400">オプション</p>
                        {options.map((o) => <p key={o.id} className="text-slate-900">{o.name}</p>)}
                      </div>
                    </div>
                  )}
                  {staff && staff.id !== 'none' && (
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">person</span>
                      <div>
                        <p className="text-xs text-slate-400">担当スタッフ</p>
                        <p className="text-slate-900">{staff.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">メニュー</span><span>{formatPrice(menuPrice)}</span></div>
                  {options.map((o) => (
                    <div key={o.id} className="flex justify-between"><span className="text-slate-500">{o.name}</span><span>+{formatPrice(o.price)}</span></div>
                  ))}
                  {nominationFee > 0 && (
                    <div className="flex justify-between"><span className="text-slate-500">指名料</span><span>+{formatPrice(nominationFee)}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>合計</span>
                    <span className="text-xl">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <p className="text-xs text-slate-400">お客様情報</p>
                  <p className="text-slate-900">{customerInfo.name}</p>
                  <p className="text-slate-500">{customerInfo.email}</p>
                  <p className="text-slate-500">{customerInfo.phone}</p>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-slate-400 text-center">キャンセルは前日18:00まで無料です</p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {step >= 1 && (
            <div>
              <p className="text-xs text-slate-400">合計</p>
              <p className="text-lg font-bold text-slate-900">{formatPrice(totalPrice)}</p>
            </div>
          )}
          <Button
            className={`${step < 1 ? 'w-full' : 'ml-auto'}`}
            disabled={!canProceed()}
            onClick={() => {
              if (step === 5) {
                setCompleted(true)
              } else {
                setStep(step + 1)
              }
            }}
          >
            {step === 5 ? '予約を確定する' : '次へ進む'}
          </Button>
        </div>
      </div>
    </div>
  )
}
