'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Rule = {
  id: string
  name: string
  triggerType: string
  intervalDays: number | null
  symptomKeyword: string | null
  seasonMonth: number | null
  seasonDay: number | null
  daysBeforeExpiry: number | null
  subject: string
  bodyTemplate: string
  channel: string
  isActive: boolean
  isPreset: boolean
  _count: { logs: number }
}

type Log = {
  id: string
  sentAt: string
  channel: string
  status: string
  customerName: string
  rule: { name: string }
}

const TRIGGER_LABELS: Record<string, string> = {
  interval: '来院後N日',
  symptom: '症状キーワード',
  season: '季節配信',
  ticket_expiry: '回数券期限',
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  skipped: 'bg-slate-100 text-slate-500',
}

export default function FollowUpPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingRule, setEditingRule] = useState<Record<string, any> | null>(null)

  const fetchRules = () => fetch('/api/follow-up/rules').then(r => r.json()).then(r => setRules(r.data || []))
  const fetchLogs = () => fetch('/api/follow-up/logs').then(r => r.json()).then(r => setLogs(r.data || []))

  useEffect(() => {
    Promise.all([fetchRules(), fetchLogs()]).finally(() => setLoading(false))
  }, [])

  const toggleRule = async (rule: Rule) => {
    await fetch(`/api/follow-up/rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    fetchRules()
  }

  const deleteRule = async (id: string) => {
    if (!confirm('このルールを削除しますか？')) return
    await fetch(`/api/follow-up/rules/${id}`, { method: 'DELETE' })
    fetchRules()
    toast.success('ルールを削除しました')
  }

  const saveRule = async () => {
    if (!editingRule?.name || !editingRule?.subject || !editingRule?.bodyTemplate) {
      toast.error('必須項目を入力してください')
      return
    }
    const isEdit = !!editingRule.id
    const res = await fetch(
      isEdit ? `/api/follow-up/rules/${editingRule.id}` : '/api/follow-up/rules',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      },
    )
    if (res.ok) {
      toast.success(isEdit ? 'ルールを更新しました' : 'ルールを作成しました')
      setEditingRule(null)
      fetchRules()
    } else toast.error('保存に失敗しました')
  }

  const seedPresets = async () => {
    const res = await fetch('/api/follow-up/rules/seed', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      if (data.data.created.length > 0) {
        toast.success(`${data.data.created.length}件のプリセットを追加しました`)
      } else {
        toast.info('プリセットは全て追加済みです')
      }
      fetchRules()
    }
  }

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">フォローアップ</h1>
          <p className="text-xs text-slate-400 mt-0.5">自動配信ルールで患者のリピートを促進</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={seedPresets}>おすすめルールを追加</Button>
          <Button size="sm" onClick={() => setEditingRule({ triggerType: 'interval', channel: 'email', isActive: true })}>+ ルールを作成</Button>
        </div>
      </div>

      <Tabs defaultValue="rules">
        <TabsList><TabsTrigger value="rules">ルール管理</TabsTrigger><TabsTrigger value="logs">送信ログ</TabsTrigger></TabsList>

        <TabsContent value="rules" className="mt-4 space-y-3">
          {rules.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">ルールがありません。「おすすめルールを追加」で始めましょう</p></CardContent></Card>
          ) : rules.map(rule => (
            <Card key={rule.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{rule.name}</p>
                    <Badge variant="outline" className="text-[10px]">{TRIGGER_LABELS[rule.triggerType]}</Badge>
                    {rule.isPreset && <Badge className="bg-blue-50 text-blue-600 text-[10px]">プリセット</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{rule.subject} · 送信{rule._count.logs}件</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingRule(rule)} className="p-1.5 rounded hover:bg-slate-100">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">edit</span>
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded hover:bg-red-50">
                    <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-500">delete</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* ルール編集フォーム */}
          {editingRule && (
            <Card className="border-2 border-blue-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold">{editingRule.id ? 'ルールを編集' : 'ルールを作成'}</h3>
                <div className="space-y-2"><Label className="text-xs">ルール名 *</Label><Input value={editingRule.name || ''} onChange={e => setEditingRule(p => ({ ...p, name: e.target.value }))} placeholder="例: 来院リマインド（7日後）" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">トリガータイプ</Label>
                  <Select value={editingRule.triggerType || 'interval'} onValueChange={v => setEditingRule(p => ({ ...p, triggerType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interval">来院後N日</SelectItem>
                      <SelectItem value="symptom">症状キーワード</SelectItem>
                      <SelectItem value="season">季節配信</SelectItem>
                      <SelectItem value="ticket_expiry">回数券期限</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingRule.triggerType === 'interval' && (
                  <div className="space-y-2"><Label className="text-xs">来院後の日数</Label><Input type="number" value={editingRule.intervalDays || ''} onChange={e => setEditingRule(p => ({ ...p, intervalDays: parseInt(e.target.value) || null }))} placeholder="7" /></div>
                )}
                {editingRule.triggerType === 'symptom' && (
                  <div className="space-y-2"><Label className="text-xs">症状キーワード</Label><Input value={editingRule.symptomKeyword || ''} onChange={e => setEditingRule(p => ({ ...p, symptomKeyword: e.target.value }))} placeholder="腰痛" /></div>
                )}
                {editingRule.triggerType === 'season' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label className="text-xs">月</Label><Input type="number" min={1} max={12} value={editingRule.seasonMonth || ''} onChange={e => setEditingRule(p => ({ ...p, seasonMonth: parseInt(e.target.value) || null }))} /></div>
                    <div className="space-y-2"><Label className="text-xs">日</Label><Input type="number" min={1} max={31} value={editingRule.seasonDay || ''} onChange={e => setEditingRule(p => ({ ...p, seasonDay: parseInt(e.target.value) || null }))} /></div>
                  </div>
                )}
                {editingRule.triggerType === 'ticket_expiry' && (
                  <div className="space-y-2"><Label className="text-xs">期限N日前</Label><Input type="number" value={editingRule.daysBeforeExpiry || ''} onChange={e => setEditingRule(p => ({ ...p, daysBeforeExpiry: parseInt(e.target.value) || null }))} placeholder="7" /></div>
                )}

                <div className="space-y-2"><Label className="text-xs">件名 *</Label><Input value={editingRule.subject || ''} onChange={e => setEditingRule(p => ({ ...p, subject: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label className="text-xs">本文テンプレート *</Label>
                  <Textarea value={editingRule.bodyTemplate || ''} onChange={e => setEditingRule(p => ({ ...p, bodyTemplate: e.target.value }))} rows={5} />
                  <p className="text-[10px] text-slate-400">変数: {'{{customerName}}'} {'{{tenantName}}'} {'{{lastVisitDate}}'} {'{{daysSinceVisit}}'}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingRule(null)}>キャンセル</Button>
                  <Button className="flex-1" onClick={saveRule}>保存する</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">送信ログがありません</div>
                ) : logs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xs text-slate-400 w-28 shrink-0">{new Date(log.sentAt).toLocaleDateString('ja-JP')} {new Date(log.sentAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{log.customerName}</p>
                      <p className="text-[11px] text-slate-400">{log.rule.name}</p>
                    </div>
                    <Badge className={`text-[10px] ${STATUS_COLORS[log.status] || ''}`}>{log.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
