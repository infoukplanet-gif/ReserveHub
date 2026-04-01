'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const MOCK_STAFF = [
  { id: '1', name: '山田 花子', role: 'チーフセラピスト', nominationFee: 500, menuCount: 5, isActive: true, bio: 'お客様に合わせた施術を心がけています', phone: '090-1111-2222', email: 'hanako@example.com' },
  { id: '2', name: '佐藤 健太', role: 'セラピスト', nominationFee: 0, menuCount: 4, isActive: true, bio: '丁寧な施術をモットーに', phone: '090-3333-4444', email: 'kenta@example.com' },
  { id: '3', name: '鈴木 美咲', role: 'セラピスト', nominationFee: 500, menuCount: 3, isActive: true, bio: 'フェイシャルが得意です', phone: '090-5555-6666', email: 'misaki@example.com' },
]

export default function StaffPage() {
  const [editingStaff, setEditingStaff] = useState<typeof MOCK_STAFF[0] | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">スタッフ管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">{MOCK_STAFF.length}名のスタッフ</p>
        </div>
        <Button>+ スタッフを追加</Button>
      </div>

      <div className="space-y-3">
        {MOCK_STAFF.map((staff) => (
          <Card key={staff.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingStaff(staff)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-600 shrink-0">
                  {staff.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{staff.name}</p>
                    <Badge variant="secondary">{staff.isActive ? '公開中' : '非公開'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{staff.role}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    対応メニュー: {staff.menuCount}個 · 指名料: {staff.nominationFee > 0 ? `¥${staff.nominationFee}` : 'なし'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
          {editingStaff && (
            <>
              <SheetHeader>
                <SheetTitle>スタッフ編集</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                    {editingStaff.name[0]}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>表示名</Label>
                  <Input defaultValue={editingStaff.name} />
                </div>
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <Input defaultValue={editingStaff.email} />
                </div>
                <div className="space-y-2">
                  <Label>電話番号</Label>
                  <Input defaultValue={editingStaff.phone} />
                </div>
                <div className="space-y-2">
                  <Label>肩書き</Label>
                  <Input defaultValue={editingStaff.role} />
                </div>
                <div className="space-y-2">
                  <Label>自己紹介</Label>
                  <Textarea defaultValue={editingStaff.bio} />
                </div>
                <div className="space-y-2">
                  <Label>指名料</Label>
                  <Input type="number" defaultValue={editingStaff.nominationFee} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked={editingStaff.isActive} />
                  <Label>公開</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingStaff(null)}>キャンセル</Button>
                  <Button className="flex-1" onClick={() => { toast.success('保存しました'); setEditingStaff(null) }}>保存する</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
