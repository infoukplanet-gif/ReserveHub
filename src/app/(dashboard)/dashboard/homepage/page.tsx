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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import ImageUpload from '@/components/shared/ImageUpload'
import { toast } from 'sonner'

type HpSettings = {
  template: string
  primaryColor: string
  navType: string
  heroType: string
  heroImageUrl: string | null
  heroImages: string[] | null
  heroVideoUrl: string | null
  heroTitle: string
  heroSubtitle: string
  heroOverlayColor: string
  heroOverlayOpacity: number
  heroTextAlign: string
  animationLevel: string
  mapStyle: string
  mapZoom: number
  footerLayout: string
  footerSns: { type: string; url: string }[] | null
  showPoweredBy: boolean
  sectionConfig: Record<string, Record<string, unknown>> | null
  customDomain: string
  metaTitle: string
  metaDescription: string
  ogImageUrl: string | null
  customCss: string
  customHeadHtml: string
  gaTrackingId: string | null
}

const DEFAULT: HpSettings = {
  template: 'simple', primaryColor: '#2563EB', navType: 'header',
  heroType: 'image', heroImageUrl: null, heroImages: null, heroVideoUrl: null,
  heroTitle: '', heroSubtitle: '', heroOverlayColor: 'rgba(0,0,0,0.5)', heroOverlayOpacity: 0.5, heroTextAlign: 'center',
  animationLevel: 'subtle', mapStyle: 'default', mapZoom: 15,
  footerLayout: '1col', footerSns: null, showPoweredBy: true,
  sectionConfig: null, customDomain: '', metaTitle: '', metaDescription: '',
  ogImageUrl: null, customCss: '', customHeadHtml: '', gaTrackingId: null,
}

export default function HomepagePage() {
  const [s, setS] = useState<HpSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('nav')

  useEffect(() => {
    fetch('/api/homepage').then(r => r.json()).then(r => {
      if (r.data) setS(prev => ({ ...prev, ...r.data }))
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/homepage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    if (res.ok) toast.success('保存しました')
    else toast.error('保存に失敗しました')
    setSaving(false)
  }

  const update = (key: keyof HpSettings, value: unknown) => setS(prev => ({ ...prev, [key]: value }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>

  const TABS = [
    { id: 'nav', label: 'ナビ', icon: 'menu' },
    { id: 'hero', label: 'ヒーロー', icon: 'image' },
    { id: 'sections', label: 'セクション', icon: 'view_agenda' },
    { id: 'map', label: 'マップ', icon: 'map' },
    { id: 'animation', label: 'アニメ', icon: 'animation' },
    { id: 'footer', label: 'フッター', icon: 'bottom_navigation' },
    { id: 'seo', label: 'SEO', icon: 'search' },
    { id: 'code', label: 'コード', icon: 'code' },
  ]

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ホームページ設定</h1>
          <p className="text-xs text-slate-400 mt-0.5">テンプレ感ゼロ、自由にカスタマイズ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/bloom`, '_blank')}>プレビュー</Button>
          <Button size="sm" onClick={save} disabled={saving}>{saving ? '保存中...' : '公開する'}</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nav Settings */}
      {activeTab === 'nav' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">ナビゲーション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'header', label: 'ヘッダー固定', desc: 'PC向け、標準的' },
              { value: 'hamburger', label: 'ハンバーガー', desc: 'モバイル風、全画面' },
              { value: 'footer', label: 'フッターナビ', desc: 'アプリ風、下部タブ' },
              { value: 'side', label: 'サイドナビ', desc: '縦型、左固定' },
            ].map(nav => (
              <button key={nav.value} onClick={() => update('navType', nav.value)}
                className={`p-4 rounded-xl border text-left transition-all ${s.navType === nav.value ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="text-sm font-medium text-slate-900">{nav.label}</p>
                <p className="text-[11px] text-slate-400 mt-1">{nav.desc}</p>
              </button>
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">テンプレート</Label>
            <div className="grid grid-cols-5 gap-2">
              {['simple', 'modern', 'natural', 'cool', 'warm'].map(t => (
                <button key={t} onClick={() => update('template', t)}
                  className={`p-3 rounded-xl border text-center transition-all ${s.template === t ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
                  <span className="text-[11px] font-medium text-slate-700 capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs w-28">メインカラー</Label>
            <input type="color" value={s.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            <Input value={s.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="w-28 text-xs" />
          </div>
        </CardContent></Card>
      )}

      {/* Hero Settings */}
      {activeTab === 'hero' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">ヒーローセクション</h2>
          <div className="space-y-2">
            <Label className="text-xs">タイプ</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'image', label: '静止画' },
                { value: 'slideshow', label: 'スライドショー' },
                { value: 'video', label: '動画' },
                { value: 'text', label: 'テキストのみ' },
              ].map(h => (
                <button key={h.value} onClick={() => update('heroType', h.value)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-all ${s.heroType === h.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600'}`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {s.heroType === 'image' && (
            <div className="space-y-2">
              <Label className="text-xs">ヒーロー画像</Label>
              <ImageUpload value={s.heroImageUrl} onChange={v => update('heroImageUrl', v)} folder="hero" height="h-40" />
            </div>
          )}

          {s.heroType === 'slideshow' && (
            <div className="space-y-2">
              <Label className="text-xs">スライドショー画像（複数）</Label>
              <div className="grid grid-cols-3 gap-2">
                {(s.heroImages || []).map((url, i) => (
                  <div key={i} className="relative h-20 rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => update('heroImages', (s.heroImages || []).filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
                <ImageUpload value={null} onChange={v => { if (v) update('heroImages', [...(s.heroImages || []), v]) }} folder="hero" height="h-20" placeholder="+ 追加" />
              </div>
            </div>
          )}

          {s.heroType === 'video' && (
            <div className="space-y-2">
              <Label className="text-xs">動画URL（YouTube/MP4）</Label>
              <Input value={s.heroVideoUrl || ''} onChange={e => update('heroVideoUrl', e.target.value)} placeholder="https://..." />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">キャッチコピー</Label>
            <Input value={s.heroTitle} onChange={e => update('heroTitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">サブテキスト</Label>
            <Input value={s.heroSubtitle} onChange={e => update('heroSubtitle', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">テキスト配置</Label>
              <div className="flex gap-1">{['left', 'center', 'right'].map(a => (
                <button key={a} onClick={() => update('heroTextAlign', a)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium ${s.heroTextAlign === a ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {a === 'left' ? '左' : a === 'center' ? '中央' : '右'}
                </button>
              ))}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">オーバーレイ濃さ: {Math.round((s.heroOverlayOpacity || 0.5) * 100)}%</Label>
              <Slider value={[Number(s.heroOverlayOpacity || 0.5) * 100]} onValueChange={v => update('heroOverlayOpacity', (v as number[])[0] / 100)} max={100} step={5} />
            </div>
          </div>
        </CardContent></Card>
      )}

      {/* Section Settings */}
      {activeTab === 'sections' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">セクション設定</h2>
          {[
            { id: 'features', label: '特徴', fields: [
              { key: 'columns', label: 'カラム数', type: 'select', options: [{ v: '2', l: '2列' }, { v: '3', l: '3列' }, { v: '4', l: '4列' }] },
              { key: 'cardStyle', label: 'カードスタイル', type: 'select', options: [{ v: 'border', l: 'ボーダー' }, { v: 'shadow', l: 'シャドウ' }, { v: 'flat', l: 'フラット' }] },
            ]},
            { id: 'menus', label: 'メニュー', fields: [
              { key: 'count', label: '表示件数', type: 'number' },
              { key: 'style', label: 'スタイル', type: 'select', options: [{ v: 'grid', l: 'グリッド' }, { v: 'list', l: 'リスト' }] },
            ]},
            { id: 'staff', label: 'スタッフ', fields: [
              { key: 'photoShape', label: '写真の形', type: 'select', options: [{ v: 'circle', l: '丸' }, { v: 'square', l: '四角' }] },
              { key: 'showBio', label: '自己紹介表示', type: 'toggle' },
              { key: 'showFee', label: '指名料表示', type: 'toggle' },
            ]},
          ].map(section => {
            const config = (s.sectionConfig || {})[section.id] || {}
            const updateSection = (key: string, value: unknown) => {
              const newConfig = { ...(s.sectionConfig || {}), [section.id]: { ...config, [key]: value } }
              update('sectionConfig', newConfig)
            }
            return (
              <div key={section.id} className="border rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-900">{section.label}</p>
                <div className="space-y-2">
                  <Label className="text-xs">背景画像</Label>
                  <ImageUpload value={(config.bgImage as string) || null} onChange={v => updateSection('bgImage', v)} folder={`sections/${section.id}`} height="h-20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">背景色</Label>
                  <div className="flex gap-2"><input type="color" value={(config.bgColor as string) || '#FFFFFF'} onChange={e => updateSection('bgColor', e.target.value)} className="w-8 h-8 rounded" /><Input value={(config.bgColor as string) || '#FFFFFF'} onChange={e => updateSection('bgColor', e.target.value)} className="w-24 text-xs" /></div>
                </div>
                {section.fields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs">{f.label}</Label>
                    {f.type === 'select' && f.options && (
                      <Select value={(config[f.key] as string) || f.options[0].v} onValueChange={v => { if (v) updateSection(f.key, v) }}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{f.options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    {f.type === 'number' && <Input type="number" value={(config[f.key] as number) || 4} onChange={e => updateSection(f.key, parseInt(e.target.value))} className="w-20 text-xs" />}
                    {f.type === 'toggle' && <Switch checked={(config[f.key] as boolean) ?? true} onCheckedChange={v => updateSection(f.key, v)} />}
                  </div>
                ))}
              </div>
            )
          })}
        </CardContent></Card>
      )}

      {/* Map Settings */}
      {activeTab === 'map' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">Google Map</h2>
          <div className="space-y-2">
            <Label className="text-xs">マップスタイル</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'default', label: 'デフォルト', bg: 'bg-green-50' },
                { value: 'mono', label: 'モノクロ', bg: 'bg-slate-100' },
                { value: 'dark', label: 'ダーク', bg: 'bg-slate-800' },
              ].map(m => (
                <button key={m.value} onClick={() => update('mapStyle', m.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${s.mapStyle === m.value ? 'border-blue-600' : 'border-slate-200'}`}>
                  <div className={`w-full h-10 rounded-lg ${m.bg} mb-2`} />
                  <span className="text-xs font-medium text-slate-700">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">ズームレベル: {s.mapZoom}</Label>
            <Slider value={[s.mapZoom]} onValueChange={v => update('mapZoom', (v as number[])[0])} min={10} max={20} step={1} />
          </div>
        </CardContent></Card>
      )}

      {/* Animation Settings */}
      {activeTab === 'animation' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">アニメーション</h2>
          <div className="space-y-3">
            {[
              { value: 'none', label: 'なし', desc: 'アニメーション完全OFF' },
              { value: 'subtle', label: '控えめ', desc: 'スクロールでふわっと表示' },
              { value: 'standard', label: '標準', desc: 'フェードイン + スライドアップ' },
            ].map(a => (
              <button key={a.value} onClick={() => update('animationLevel', a.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${s.animationLevel === a.value ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
                <p className="text-sm font-medium text-slate-900">{a.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{a.desc}</p>
              </button>
            ))}
          </div>
        </CardContent></Card>
      )}

      {/* Footer Settings */}
      {activeTab === 'footer' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">フッター</h2>
          <div className="space-y-2">
            <Label className="text-xs">レイアウト</Label>
            <div className="flex gap-2">{['1col', '2col', '3col'].map(l => (
              <button key={l} onClick={() => update('footerLayout', l)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium ${s.footerLayout === l ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600'}`}>
                {l.replace('col', 'カラム')}
              </button>
            ))}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">SNSリンク</Label>
            {(s.footerSns || []).map((sns, i) => (
              <div key={i} className="flex gap-2">
                <Input value={sns.type} onChange={e => { const arr = [...(s.footerSns || [])]; arr[i] = { ...arr[i], type: e.target.value }; update('footerSns', arr) }} placeholder="instagram" className="w-24 text-xs" />
                <Input value={sns.url} onChange={e => { const arr = [...(s.footerSns || [])]; arr[i] = { ...arr[i], url: e.target.value }; update('footerSns', arr) }} placeholder="https://..." className="flex-1 text-xs" />
                <Button variant="ghost" size="sm" onClick={() => update('footerSns', (s.footerSns || []).filter((_, j) => j !== i))}>×</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update('footerSns', [...(s.footerSns || []), { type: '', url: '' }])}>+ SNS追加</Button>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={s.showPoweredBy} onCheckedChange={v => update('showPoweredBy', v)} />
            <Label className="text-xs">「Powered by ReserveHub」を表示</Label>
            {!s.showPoweredBy && <Badge variant="secondary" className="text-[10px]">プロプラン</Badge>}
          </div>
        </CardContent></Card>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">SEO設定</h2>
          <div className="space-y-2"><Label className="text-xs">ページタイトル</Label><Input value={s.metaTitle} onChange={e => update('metaTitle', e.target.value)} /><p className="text-[10px] text-slate-400">{s.metaTitle.length}/60文字</p></div>
          <div className="space-y-2"><Label className="text-xs">ディスクリプション</Label><Textarea value={s.metaDescription} onChange={e => update('metaDescription', e.target.value)} rows={2} /><p className="text-[10px] text-slate-400">{s.metaDescription.length}/160文字</p></div>
          <div className="space-y-2"><Label className="text-xs">OGP画像</Label><ImageUpload value={s.ogImageUrl} onChange={v => update('ogImageUrl', v)} folder="ogp" height="h-24" /></div>
          <div className="space-y-2"><Label className="text-xs">独自ドメイン</Label><Input value={s.customDomain} onChange={e => update('customDomain', e.target.value)} placeholder="bloom-salon.com" /></div>
        </CardContent></Card>
      )}

      {/* Custom Code */}
      {activeTab === 'code' && (
        <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">カスタムコード</h2>
            <Badge variant="secondary" className="text-[10px]">プロプラン</Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">カスタムHTML（&lt;head&gt;に挿入）</Label>
            <textarea className="w-full h-24 rounded-lg border border-slate-200 bg-slate-900 text-green-400 text-xs font-mono p-3 focus:border-blue-600 outline-none resize-none" value={s.customHeadHtml} onChange={e => update('customHeadHtml', e.target.value)} placeholder="<!-- Google Tag Manager -->" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">カスタムCSS</Label>
            <textarea className="w-full h-24 rounded-lg border border-slate-200 bg-slate-900 text-green-400 text-xs font-mono p-3 focus:border-blue-600 outline-none resize-none" value={s.customCss} onChange={e => update('customCss', e.target.value)} placeholder=".hero { ... }" />
          </div>
          <div className="space-y-2"><Label className="text-xs">Google Analytics ID</Label><Input value={s.gaTrackingId || ''} onChange={e => update('gaTrackingId' as keyof HpSettings, e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
        </CardContent></Card>
      )}
    </div>
  )
}
