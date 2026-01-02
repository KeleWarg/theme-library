import { useState, useEffect } from 'react'

const STORAGE_KEY = 'design-system-theme'
const DEFAULT_THEME = 'theme-health---sem'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
  }

  return { theme, setTheme }
}





