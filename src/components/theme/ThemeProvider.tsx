'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ThemeId } from '@/lib/themes'

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'flat', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({
  children,
  initialTheme = 'flat',
}: {
  children: React.ReactNode
  initialTheme?: ThemeId
}) {
  const [theme, setTheme] = useState<ThemeId>(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    return () => document.documentElement.removeAttribute('data-theme')
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
