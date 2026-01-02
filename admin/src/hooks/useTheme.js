import { useState, useEffect, useCallback, useRef } from 'react'
import { getThemeBySlug } from '../lib/themeService'

const STORAGE_KEY = 'design-system-theme'
const DEFAULT_THEME = 'theme-system-default'
const FALLBACK_THEME = 'theme-system-default'
const CUSTOM_STYLE_ID = 'custom-theme-variables'

// Static/legacy theme slugs that have CSS classes defined in tokens.css
const LEGACY_THEME_SLUGS = [
  'theme-system-default',
  'theme-health---sem',
  'theme-home---sem',
  'theme-llm',
  'theme-forbes-media---seo',
  'theme-advisor-sem-compare-coverage',
]

/**
 * Check if a theme slug is a legacy theme with CSS classes in tokens.css
 * @param {string} slug - Theme slug
 * @returns {boolean}
 */
function isLegacyTheme(slug) {
  return LEGACY_THEME_SLUGS.includes(slug)
}

/**
 * Generate CSS variable declarations from theme tokens
 * @param {Array} tokens - Array of token objects from theme_tokens
 * @returns {string} CSS variable declarations
 */
function generateCSSVariables(tokens) {
  if (!tokens || tokens.length === 0) return ''
  
  return tokens.map(token => {
    const varName = token.css_variable
    if (!varName) return ''
    
    let value = ''
    if (token.value) {
      if (typeof token.value === 'string') {
        value = token.value
      } else if (token.value.hex) {
        value = token.value.hex
      } else if (token.value.rgba) {
        const { r, g, b, a } = token.value.rgba
        value = a !== undefined && a < 1 
          ? `rgba(${r}, ${g}, ${b}, ${a})`
          : `rgb(${r}, ${g}, ${b})`
      } else if (token.value.fontFamily) {
        // Handle font family tokens
        value = `"${token.value.fontFamily}"`
      } else if (token.value.x !== undefined && token.value.y !== undefined) {
        // Handle shadow tokens: { x, y, blur, spread, color }
        const { x = 0, y = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = token.value
        value = `${x}px ${y}px ${blur}px ${spread}px ${color}`
      } else if (token.value.value !== undefined) {
        const unit = token.value.unit || ''
        value = `${token.value.value}${unit}`
      } else {
        value = JSON.stringify(token.value)
      }
    }
    
    return value ? `  ${varName}: ${value};` : ''
  }).filter(Boolean).join('\n')
}

/**
 * Inject custom theme CSS variables into the document
 * @param {string} slug - Theme slug
 * @param {Array} tokens - Array of token objects
 */
function injectCustomThemeStyles(slug, tokens) {
  // Remove existing custom style if any
  removeCustomThemeStyles()
  
  if (!tokens || tokens.length === 0) return
  
  const cssVariables = generateCSSVariables(tokens)
  if (!cssVariables) return
  
  // Create style element with theme-specific class
  const styleEl = document.createElement('style')
  styleEl.id = CUSTOM_STYLE_ID
  styleEl.textContent = `
/* Custom theme: ${slug} */
.${slug},
[data-theme="${slug.replace('theme-', '')}"] {
${cssVariables}
}
`
  document.head.appendChild(styleEl)
}

/**
 * Remove custom theme styles from the document
 */
function removeCustomThemeStyles() {
  const existingStyle = document.getElementById(CUSTOM_STYLE_ID)
  if (existingStyle) {
    existingStyle.remove()
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
    }
    return DEFAULT_THEME
  })
  
  const [isCustomTheme, setIsCustomTheme] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const loadedThemeRef = useRef(null)

  // Apply theme: CSS class + custom variables if needed
  useEffect(() => {
    async function applyTheme() {
      // Always set the CSS class
      document.documentElement.className = theme
      localStorage.setItem(STORAGE_KEY, theme)
      
      // Check if this is a legacy theme or custom theme
      if (isLegacyTheme(theme)) {
        // Legacy theme: just use CSS class, remove any custom styles
        setIsCustomTheme(false)
        removeCustomThemeStyles()
        loadedThemeRef.current = null
        return
      }
      
      // Custom/database theme: fetch tokens and inject CSS variables
      // Skip if we already loaded this theme
      if (loadedThemeRef.current === theme) {
        return
      }
      
      setIsLoading(true)
      setIsCustomTheme(true)
      
      try {
        const themeData = await getThemeBySlug(theme)
        
        if (themeData && themeData.theme_tokens) {
          injectCustomThemeStyles(theme, themeData.theme_tokens)
          loadedThemeRef.current = theme
        } else {
          // Theme not found in DB - fall back to system default
          console.warn(`Theme "${theme}" not found in database, falling back to ${FALLBACK_THEME}`)
          removeCustomThemeStyles()
          // Apply fallback theme class
          document.documentElement.className = FALLBACK_THEME
          localStorage.setItem(STORAGE_KEY, FALLBACK_THEME)
          setIsCustomTheme(false)
        }
      } catch (err) {
        console.error('Failed to load custom theme tokens:', err)
        // Fall back to system default on error
        removeCustomThemeStyles()
        document.documentElement.className = FALLBACK_THEME
        localStorage.setItem(STORAGE_KEY, FALLBACK_THEME)
        setIsCustomTheme(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    applyTheme()
    
    // Cleanup on unmount
    return () => {
      // Don't remove styles on unmount - they should persist
    }
  }, [theme])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
  }, [])

  return { 
    theme, 
    setTheme,
    isCustomTheme,
    isLoading,
  }
}
