'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type ChatCustomer = {
  id: string
  name: string
  lastMessage: { content: string; sentAt: string; direction: string } | null
  unreadCount: number
}

type Message = {
  id: string
  direction: string
  messageType: string
  content: string
  sentAt: string
}

export default function ChatPage() {
  const [customers, setCustomers] = useState<ChatCustomer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/chat/customers')
      .then(r => r.json())
      .then(r => { setCustomers(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const fetchMessages = () => {
      fetch(`/api/chat/${selectedId}/messages`)
        .then(r => r.json())
        .then(r => setMessages(r.data || []))
    }
    fetchMessages()
    // 5秒ごとにポーリング
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedId) return
    setSending(true)
    try {
      const res = await fetch(`/api/chat/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.data])
        setInput('')
      } else {
        const err = await res.json()
        toast.error(err.message || '送信に失敗しました')
      }
    } catch {
      toast.error('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedId)

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">チャット</h1>

      {customers.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center">
          <p className="text-sm text-slate-400">LINE連携された患者がいません</p>
          <p className="text-xs text-slate-400 mt-1">設定 &gt; LINE連携から設定してください</p>
        </CardContent></Card>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* 顧客リスト */}
          <Card className="border-0 shadow-sm w-72 shrink-0 overflow-hidden">
            <CardContent className="p-0 h-full overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${
                      selectedId === c.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-600 shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                        {c.unreadCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-[10px] rounded-full h-5 min-w-5 flex items-center justify-center">{c.unreadCount}</Badge>
                        )}
                      </div>
                      {c.lastMessage && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage.direction === 'outbound' ? '自分: ' : ''}
                          {c.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* チャットエリア */}
          <Card className="border-0 shadow-sm flex-1 flex flex-col overflow-hidden">
            {!selectedId ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-400">患者を選択してチャットを開始</p>
              </CardContent>
            ) : (
              <>
                {/* ヘッダー */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-600">
                    {selectedCustomer?.name[0]}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedCustomer?.name}</p>
                </div>

                {/* メッセージ */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div
                      key={m.id}
                      className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          m.direction === 'outbound'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-900 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.direction === 'outbound' ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(m.sentAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 入力 */}
                <div className="flex gap-2 p-4 border-t">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="メッセージを入力..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={sending || !input.trim()}>
                    {sending ? '...' : '送信'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
