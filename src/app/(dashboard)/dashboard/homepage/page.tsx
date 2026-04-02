'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const TEMPLATES = [
  { id: 'simple', name: 'Simple', desc: 'ミニマル・余白多め' },
  { id: 'modern', name: 'Modern', desc: 'シャープ・構造的' },
  { id: 'natural', name: 'Natural', desc: '丸み・温かみ' },
  { id: 'cool', name: 'Cool', desc: 'モノトーン・クリーン' },
  { id: 'warm', name: 'Warm', desc: 'オレンジ系・親しみ' },
]

const SECTIONS = [
  { id: 'features', name: '特徴', enabled: true },
  { id: 'menus', name: 'メニュー', enabled: true },
  { id: 'staff', name: 'スタッフ', enabled: true },
  { id: 'access', name: 'アクセス', enabled: true },
  { id: 'blog', name: 'ブログ', enabled: false },
]

export default function HomepagePage() {
  const [template, setTemplate] = useState('simple')
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [sections, setSections] = useState(SECTIONS)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/homepage').then(r => r.json()).then(r => {
      const d = r.data
      if (d) {
        setTemplate(d.template || 'simple')
        setPrimaryColor(d.primaryColor || '#2563EB')
        setHeroTitle(d.heroTitle || '')
        setHeroSubtitle(d.heroSubtitle || '')
        setMetaTitle(d.metaTitle || '')
        setMetaDesc(d.metaDescription || '')
        setCustomDomain(d.customDomain || '')
      }
    })
  }, [])

  const handlePublish = async () => {
    const res = await fetch('/api/homepage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, primaryColor, heroTitle, heroSubtitle, metaTitle, metaDescription: metaDesc, customDomain }),
    })
    if (res.ok) toast.success('ホームページ設定を保存しました')
    else toast.error('保存に失敗しました')
  }

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ホームページ設定</h1>
          <p className="text-xs text-slate-400 mt-0.5">公開ページのカスタマイズ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">プレビュー</Button>
          <Button size="sm" onClick={handlePublish}>公開する</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {/* Template */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">テンプレート</h2>
              <div className="grid grid-cols-5 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      template === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg ${
                      t.id === 'simple' ? 'bg-slate-100' :
                      t.id === 'modern' ? 'bg-slate-800' :
                      t.id === 'natural' ? 'bg-amber-50' :
                      t.id === 'cool' ? 'bg-slate-200' :
                      'bg-orange-50'
                    }`} />
                    <span className="text-[11px] font-medium text-slate-700">{t.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">カラー設定</h2>
              <div className="flex items-center gap-3">
                <Label className="w-28 text-xs">メインカラー</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28 text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">ヒーローセクション</h2>
              <div className="space-y-2">
                <Label className="text-xs">ヒーロー画像</Label>
                <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
                    <p className="text-xs text-slate-400 mt-1">画像をアップロード</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">キャッチコピー</Label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">サブテキスト</Label>
                <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">セクション管理</h2>
              <p className="text-xs text-slate-400">表示/非表示を切り替え。編集ボタンで詳細設定。</p>
              <div className="space-y-2">
                {sections.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[16px] text-slate-300 cursor-grab">drag_indicator</span>
                      <span className="text-sm text-slate-700">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSection(s.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        編集
                      </button>
                      <Switch checked={s.enabled} onCheckedChange={() => toggleSection(s.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Detail Edit */}
          {editingSection && (
            <Card className="border-2 border-blue-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    「{sections.find(s => s.id === editingSection)?.name}」セクション編集
                  </h2>
                  <button onClick={() => setEditingSection(null)} className="text-xs text-slate-400 hover:text-slate-700">閉じる</button>
                </div>

                {editingSection === 'features' && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-slate-500">特徴 {i}</p>
                        <div className="space-y-2">
                          <Label className="text-xs">アイコン名</Label>
                          <Input placeholder="例: spa, self_improvement" defaultValue={i === 1 ? 'meeting_room' : i === 2 ? 'verified' : 'train'} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">タイトル</Label>
                          <Input defaultValue={i === 1 ? '完全個室' : i === 2 ? '国家資格保有' : '駅徒歩3分'} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">説明文</Label>
                          <Input defaultValue={i === 1 ? 'プライベート空間でリラックス' : i === 2 ? '全スタッフが国家資格を保有' : '原宿駅から徒歩3分'} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingSection === 'menus' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">メニュー管理で登録したメニューが自動表示されます。</p>
                    <div className="space-y-2">
                      <Label className="text-xs">表示件数</Label>
                      <Input type="number" defaultValue={3} className="w-20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">見出しテキスト</Label>
                      <Input defaultValue="メニュー・料金" />
                    </div>
                  </div>
                )}

                {editingSection === 'staff' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">スタッフ管理で登録したスタッフが自動表示されます。</p>
                    <div className="space-y-2">
                      <Label className="text-xs">見出しテキスト</Label>
                      <Input defaultValue="スタッフ紹介" />
                    </div>
                  </div>
                )}

                {editingSection === 'access' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">基本情報設定の住所が自動反映されます。</p>
                    <div className="space-y-2">
                      <Label className="text-xs">見出しテキスト</Label>
                      <Input defaultValue="アクセス" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">補足テキスト（アクセス方法など）</Label>
                      <Textarea defaultValue="JR原宿駅 徒歩3分 / 東京メトロ明治神宮前駅 徒歩1分" rows={2} />
                    </div>
                  </div>
                )}

                {editingSection === 'blog' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">ブログ管理で公開した記事が自動表示されます。</p>
                    <div className="space-y-2">
                      <Label className="text-xs">表示件数</Label>
                      <Input type="number" defaultValue={5} className="w-20" />
                    </div>
                  </div>
                )}

                <Button size="sm" onClick={() => { toast.success('セクションを保存しました'); setEditingSection(null) }}>
                  保存する
                </Button>
              </CardContent>
            </Card>
          )}

          {/* HTML Direct Edit — 上級者向け */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">カスタムHTML/CSS</h2>
                  <p className="text-xs text-slate-400 mt-0.5">上級者向け。ページに直接HTMLを挿入できます。</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">プロプラン</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">カスタムHTML（&lt;head&gt;内に挿入）</Label>
                <textarea
                  className="w-full h-24 rounded-lg border border-slate-200 bg-slate-900 text-green-400 text-xs font-mono p-3 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                  placeholder="<!-- Google Tag Manager など -->"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">カスタムCSS</Label>
                <textarea
                  className="w-full h-24 rounded-lg border border-slate-200 bg-slate-900 text-green-400 text-xs font-mono p-3 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                  placeholder=".hero-section { ... }"
                  defaultValue=""
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">SEO設定</h2>
              <div className="space-y-2">
                <Label className="text-xs">ページタイトル</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                <p className="text-[10px] text-slate-400">{metaTitle.length}/60文字</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">ディスクリプション</Label>
                <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} />
                <p className="text-[10px] text-slate-400">{metaDesc.length}/160文字</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">OGP画像</Label>
                <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer">
                  <span className="text-xs text-slate-400">画像を設定</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">ドメイン設定</h2>
              <div className="space-y-2">
                <Label className="text-xs">独自ドメイン（プロプラン以上）</Label>
                <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="bloom-salon.com" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-xs text-slate-400 font-medium mb-3">プレビュー</p>
            <div className="border rounded-2xl overflow-hidden bg-white shadow-sm" style={{ height: 600 }}>
              <div className="h-full flex flex-col">
                {/* Mini header */}
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-[10px] font-semibold text-slate-700">BLOOM</span>
                  <div className="px-2 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: primaryColor }}>予約する</div>
                </div>
                {/* Mini hero */}
                <div className="relative h-32 bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white text-xs font-bold">{heroTitle}</p>
                    <p className="text-white/60 text-[8px] mt-1">{heroSubtitle}</p>
                  </div>
                </div>
                {/* Mini sections */}
                <div className="flex-1 p-3 space-y-3 overflow-hidden">
                  {sections.filter(s => s.enabled).map((s) => (
                    <div key={s.id}>
                      <p className="text-[8px] font-semibold text-slate-600 mb-1">{s.name}</p>
                      <div className="h-8 bg-slate-50 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
