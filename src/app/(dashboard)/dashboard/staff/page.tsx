'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type Staff = {
  id: string; name: string; email: string | null; phone: string | null; role: string; bio: string | null
  nominationFee: number; isActive: boolean; staffMenus: { menu: { name: string } }[]; _count: { reservations: number }
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Staff> | null>(null)

  const load = () => { fetch('/api/staff').then(r => r.json()).then(r => { setStaffList(r.data || []); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing?.name) { toast.error('名前を入力してください'); return }
    const isNew = !editing.id
    const url = isNew ? '/api/staff' : `/api/staff/${editing.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { toast.success('保存しました'); setEditing(null); load() } else toast.error('保存に失敗しました')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">施術者管理</h1><p className="text-xs text-slate-400 mt-0.5">{staffList.length}名</p></div>
        <Button onClick={() => setEditing({ name: '', nominationFee: 0, isActive: true })}>+ 施術者を追加</Button>
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div> : (
        <div className="space-y-3">{staffList.map(s => (
          <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditing(s)}>
            <CardContent className="p-4"><div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-600 shrink-0">{s.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-900">{s.name}</p><Badge variant="secondary">{s.isActive ? '公開中' : '非公開'}</Badge></div>
                <p className="text-xs text-slate-400 mt-0.5">施術メニュー: {s.staffMenus?.length || 0}個 · 指名料: {s.nominationFee > 0 ? `¥${s.nominationFee}` : 'なし'}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div></CardContent>
          </Card>
        ))}</div>
      )}
      <Sheet open={!!editing} onOpenChange={() => setEditing(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto px-6">
          {editing && (<><SheetHeader><SheetTitle>{editing.id ? '施術者編集' : '施術者を追加'}</SheetTitle></SheetHeader>
            <div className="space-y-6 mt-6">
              {/* 基本情報 */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">基本情報</p>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>表示名 *</Label><Input value={editing.name || ''} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : null)} /></div>
                  <div className="space-y-2"><Label>メールアドレス</Label><Input value={editing.email || ''} onChange={e => setEditing(p => p ? { ...p, email: e.target.value } : null)} /></div>
                  <div className="space-y-2"><Label>電話番号</Label><Input value={editing.phone || ''} onChange={e => setEditing(p => p ? { ...p, phone: e.target.value } : null)} /></div>
                </div>
              </div>

              <Separator />

              {/* プロフィール */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">プロフィール</p>
                <div className="space-y-2">
                  <Label>自己紹介・資格・経歴</Label>
                  <Textarea
                    rows={5}
                    value={editing.bio || ''}
                    onChange={e => setEditing(p => p ? { ...p, bio: e.target.value } : null)}
                    placeholder={"例:\n柔道整復師・はり師・きゅう師\n\n得意施術: 腰痛治療、美容鍼、スポーツ障害\n\n経歴: 〇〇整体院 5年、△△鍼灸院 3年\n患者様一人ひとりに合わせた丁寧な施術を心がけています。"}
                  />
                  <p className="text-[10px] text-slate-400">資格・得意施術・経歴・メッセージなどを自由に記載してください。HPの施術者紹介にも表示されます。</p>
                </div>
              </div>

              <Separator />

              {/* 料金設定 */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">料金設定</p>
                <div className="space-y-2">
                  <Label>指名料（税込）</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">¥</span>
                    <Input type="number" value={editing.nominationFee || 0} onChange={e => setEditing(p => p ? { ...p, nominationFee: parseInt(e.target.value) || 0 } : null)} className="w-32" />
                  </div>
                  <p className="text-[10px] text-slate-400">0の場合、指名料なしとして表示されます</p>
                </div>
              </div>

              <Separator />

              {/* 表示設定 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>公開設定</Label>
                  <p className="text-[10px] text-slate-400 mt-0.5">オフにするとHPおよび来院予約画面に表示されません</p>
                </div>
                <Switch checked={editing.isActive ?? true} onCheckedChange={v => setEditing(p => p ? { ...p, isActive: v } : null)} />
              </div>

              <div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>キャンセル</Button><Button className="flex-1" onClick={save}>保存する</Button></div>
            </div></>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
