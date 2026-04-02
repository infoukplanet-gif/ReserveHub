'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect, useCallback, useRef } from 'react'

// --- Slash Command Menu ---
type SlashItem = {
  label: string
  icon: string
  description: string
  action: (editor: Editor) => void
}

const SLASH_ITEMS: SlashItem[] = [
  {
    label: '画像',
    icon: 'image',
    description: '画像を挿入',
    action: (editor) => {
      const url = window.prompt('画像URLを入力')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
  {
    label: '大見出し',
    icon: 'format_h2',
    description: 'h2見出し',
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: '小見出し',
    icon: 'format_h3',
    description: 'h3見出し',
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: '箇条書きリスト',
    icon: 'format_list_bulleted',
    description: '箇条書き',
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: '番号付きリスト',
    icon: 'format_list_numbered',
    description: '番号リスト',
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: '引用',
    icon: 'format_quote',
    description: '引用ブロック',
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'コード',
    icon: 'code',
    description: 'コードブロック',
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: '区切り線',
    icon: 'horizontal_rule',
    description: '水平線を挿入',
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

function SlashMenu({
  editor,
  position,
  onClose,
}: {
  editor: Editor
  position: { top: number; left: number }
  onClose: () => void
}) {
  const [filter, setFilter] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = SLASH_ITEMS.filter(
    (item) => item.label.includes(filter) || item.description.includes(filter)
  )

  const execute = useCallback(
    (item: SlashItem) => {
      // Delete the "/" character
      editor.chain().focus().deleteRange({
        from: editor.state.selection.from - filter.length - 1,
        to: editor.state.selection.from,
      }).run()
      item.action(editor)
      onClose()
    },
    [editor, filter, onClose]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIndex]) execute(filtered[selectedIndex]); return }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [filtered, selectedIndex, execute, onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
      style={{ top: position.top + 24, left: position.left }}
    >
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium">挿入</p>
      </div>
      <div className="max-h-[320px] overflow-y-auto py-1">
        {filtered.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => execute(item)}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left transition-colors ${
              idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">{item.icon}</span>
            <div>
              <p className="text-sm text-slate-700">{item.label}</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-400 text-center">見つかりません</p>
        )}
      </div>
    </div>
  )
}

// --- Outline Sidebar ---
function OutlineSidebar({ editor }: { editor: Editor | null }) {
  const [headings, setHeadings] = useState<{ level: number; text: string; pos: number }[]>([])

  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      const items: { level: number; text: string; pos: number }[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({ level: node.attrs.level, text: node.textContent, pos })
        }
      })
      setHeadings(items)
    }

    editor.on('update', updateHeadings)
    updateHeadings()

    return () => { editor.off('update', updateHeadings) }
  }, [editor])

  if (headings.length === 0) {
    return (
      <div className="text-xs text-slate-400">
        見出しを設定すると表示されます
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {headings.map((h, i) => (
        <button
          key={i}
          onClick={() => {
            editor?.chain().focus().setTextSelection(h.pos).run()
          }}
          className={`block w-full text-left text-xs truncate py-1 hover:text-blue-600 transition-colors ${
            h.level === 2 ? 'text-slate-700 font-medium' : 'text-slate-500 pl-3'
          }`}
        >
          {h.text || '(空の見出し)'}
        </button>
      ))}
    </div>
  )
}

// --- Word Count ---
function WordCount({ editor }: { editor: Editor | null }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!editor) return
    const update = () => setCount(editor.state.doc.textContent.length)
    editor.on('update', update)
    update()
    return () => { editor.off('update', update) }
  }, [editor])

  return <span className="text-[11px] text-slate-400">{count} 文字</span>
}

// --- Main Editor ---
export default function BlockEditor({
  content,
  onChange,
}: {
  content: string
  onChange: (html: string) => void
}) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: '本文を入力... 「/」でブロックを挿入',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[400px] focus:outline-none px-1 py-2',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === '/' && !slashMenu) {
          // Show slash menu after the "/" is typed
          setTimeout(() => {
            const { from } = _view.state.selection
            const coords = _view.coordsAtPos(from)
            setSlashMenu({ top: coords.top, left: coords.left })
          }, 10)
        }
        if (event.key === 'Escape' && slashMenu) {
          setSlashMenu(null)
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
      // Close slash menu if user typed something other than slash command
      if (slashMenu) {
        const { from } = e.state.selection
        const textBefore = e.state.doc.textBetween(Math.max(0, from - 20), from)
        if (!textBefore.includes('/')) {
          setSlashMenu(null)
        }
      }
    },
  })

  return (
    <div className="flex gap-0 min-h-[500px]">
      {/* Outline Sidebar */}
      <div className="hidden lg:block w-48 shrink-0 border-r pr-4 pt-2">
        <p className="text-xs font-semibold text-slate-900 mb-3">目次</p>
        <OutlineSidebar editor={editor} />
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-w-0 relative">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b pb-2 mb-2 flex-wrap">
          {[
            { icon: 'format_bold', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
            { icon: 'format_italic', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
            { icon: 'format_strikethrough', action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike') },
            null, // separator
            { icon: 'format_h2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
            { icon: 'format_h3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
            null,
            { icon: 'format_list_bulleted', action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
            { icon: 'format_list_numbered', action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
            null,
            { icon: 'format_quote', action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive('blockquote') },
            { icon: 'code', action: () => editor?.chain().focus().toggleCodeBlock().run(), active: editor?.isActive('codeBlock') },
            { icon: 'horizontal_rule', action: () => editor?.chain().focus().setHorizontalRule().run(), active: false },
            { icon: 'image', action: () => { const url = window.prompt('画像URL'); if (url) editor?.chain().focus().setImage({ src: url }).run() }, active: false },
          ].map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} className="w-px h-5 bg-slate-200 mx-1" />
            ) : (
              <button
                key={item.icon}
                onClick={item.action}
                className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                  item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </button>
            )
          )}
          <div className="ml-auto">
            <WordCount editor={editor} />
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />

        {/* Slash Menu */}
        {slashMenu && editor && (
          <SlashMenu
            editor={editor}
            position={slashMenu}
            onClose={() => setSlashMenu(null)}
          />
        )}
      </div>
    </div>
  )
}
