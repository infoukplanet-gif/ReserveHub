export const THEMES = [
  {
    id: 'flat',
    name: 'フラット',
    description: 'クリーンでシンプルなデザイン',
    preview: { bg: '#ffffff', card: '#ffffff', border: '#e5e7eb', accent: '#2563eb' },
  },
  {
    id: 'skeuomorphic',
    name: 'スキューモーフィック',
    description: '立体感のあるリアルなデザイン',
    preview: { bg: '#f0f0f0', card: '#ffffff', border: '#d1d5db', accent: '#2563eb' },
  },
  {
    id: 'neumorphic',
    name: 'ニューモーフィック',
    description: '柔らかい凹凸のあるデザイン',
    preview: { bg: '#e8edf2', card: '#e8edf2', border: 'transparent', accent: '#2563eb' },
  },
  {
    id: 'glassmorphic',
    name: 'グラスモーフィック',
    description: 'すりガラスのような透明感',
    preview: { bg: '#667eea', card: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.18)', accent: '#ffffff' },
  },
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    description: 'Apple風の流動的なガラス',
    preview: { bg: '#f8f9fa', card: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.3)', accent: '#007aff' },
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']
