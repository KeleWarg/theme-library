import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  themes, 
  colorTokens, 
  typographyTokens, 
  spacingTokens,
  radiusTokens,
  borderWidthTokens,
  breakpoints,
  copyToClipboard,
  getCSSVariable,
  getComputedCSSValue,
  tokenPathToCSSVariable,
  extractTokenValue,
  getAllColorTokens,
  getAllTypographyTokens,
  fontFamilyTokens,
  themeFontMap,
  getFontFamiliesForTheme,
  getThemeFonts,
  getFontFamilyForToken
} from './tokenData'

describe('tokenData', () => {
  describe('themes', () => {
    it('has 5 themes', () => {
      expect(themes).toHaveLength(5)
    })

    it('each theme has name and slug', () => {
      themes.forEach(theme => {
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('slug')
      })
    })

    it('includes Health SEM theme', () => {
      const healthTheme = themes.find(t => t.name === 'Health SEM')
      expect(healthTheme).toBeDefined()
      expect(healthTheme.slug).toBe('theme-health---sem')
    })
  })

  describe('colorTokens', () => {
    it('has background colors', () => {
      expect(colorTokens.backgrounds.length).toBeGreaterThan(0)
    })

    it('has foreground colors', () => {
      expect(colorTokens.foregrounds.length).toBeGreaterThan(0)
    })

    it('has button color categories', () => {
      expect(colorTokens.buttons).toHaveProperty('primary')
      expect(colorTokens.buttons).toHaveProperty('secondary')
      expect(colorTokens.buttons).toHaveProperty('ghost')
    })

    it('has feedback colors', () => {
      expect(colorTokens.feedback.length).toBeGreaterThan(0)
    })

    it('each color has required properties', () => {
      colorTokens.backgrounds.forEach(color => {
        expect(color).toHaveProperty('name')
        expect(color).toHaveProperty('variable')
        expect(color.variable).toMatch(/^--color-/)
      })
    })

    it('button tokens have correct variable format', () => {
      colorTokens.buttons.primary.forEach(color => {
        expect(color.variable).toMatch(/^--color-btn-/)
      })
    })
  })

  describe('typographyTokens', () => {
    it('has font sizes', () => {
      expect(typographyTokens.fontSizes.length).toBeGreaterThan(0)
    })

    it('has font weights', () => {
      expect(typographyTokens.fontWeights.length).toBeGreaterThan(0)
    })

    it('has line heights', () => {
      expect(typographyTokens.lineHeights.length).toBeGreaterThan(0)
    })

    it('has letter spacing', () => {
      expect(typographyTokens.letterSpacing.length).toBeGreaterThan(0)
    })

    it('font sizes have correct variable format', () => {
      typographyTokens.fontSizes.forEach(token => {
        expect(token.variable).toMatch(/^--font-size-/)
        expect(token).toHaveProperty('value')
      })
    })
  })

  describe('spacingTokens', () => {
    it('has spacing values', () => {
      expect(spacingTokens.length).toBeGreaterThan(0)
    })

    it('includes common spacing sizes', () => {
      const names = spacingTokens.map(s => s.name)
      expect(names).toContain('spacing-xs')
      expect(names).toContain('spacing-md')
      expect(names).toContain('spacing-xl')
    })
  })

  describe('radiusTokens', () => {
    it('has radius values', () => {
      expect(radiusTokens.length).toBeGreaterThan(0)
    })

    it('includes common radius sizes', () => {
      const names = radiusTokens.map(r => r.name)
      expect(names).toContain('radius-sm')
      expect(names).toContain('radius-md')
      expect(names).toContain('radius-lg')
    })
  })

  describe('breakpoints', () => {
    it('has 3 breakpoints', () => {
      expect(breakpoints).toHaveLength(3)
    })

    it('has Mobile, Tablet, and Desktop', () => {
      const names = breakpoints.map(b => b.name)
      expect(names).toContain('Mobile')
      expect(names).toContain('Tablet')
      expect(names).toContain('Desktop')
    })

    it('each breakpoint has grid properties', () => {
      breakpoints.forEach(bp => {
        expect(bp).toHaveProperty('width')
        expect(bp).toHaveProperty('columns')
        expect(bp).toHaveProperty('margin')
        expect(bp).toHaveProperty('gutter')
      })
    })

    it('Desktop has 12 columns', () => {
      const desktop = breakpoints.find(b => b.name === 'Desktop')
      expect(desktop.columns).toBe(12)
    })
  })

  describe('getCSSVariable', () => {
    it('wraps variable in var()', () => {
      expect(getCSSVariable('--color-bg-white')).toBe('var(--color-bg-white)')
    })

    it('handles complex variable names', () => {
      expect(getCSSVariable('--color-btn-primary-bg')).toBe('var(--color-btn-primary-bg)')
    })
  })

  describe('copyToClipboard', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })
    })

    it('calls clipboard API', async () => {
      await copyToClipboard('test')
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test')
    })

    it('returns true', () => {
      const result = copyToClipboard('var(--color-bg-white)')
      expect(result).toBe(true)
    })
  })

  describe('tokenPathToCSSVariable', () => {
    it('converts Color.Button.Primary.primary-bg correctly', () => {
      expect(tokenPathToCSSVariable('Color.Button.Primary.primary-bg')).toBe('--color-btn-primary-bg')
    })

    it('converts Color.Background.bg-white correctly', () => {
      expect(tokenPathToCSSVariable('Color.Background.bg-white')).toBe('--color-bg-white')
    })

    it('converts Color.Foreground.fg-heading correctly', () => {
      expect(tokenPathToCSSVariable('Color.Foreground.fg-heading')).toBe('--color-fg-heading')
    })

    it('converts Font Size tokens correctly', () => {
      expect(tokenPathToCSSVariable('Font Size.heading-lg')).toBe('--font-size-heading-lg')
    })

    it('converts Spacing tokens correctly', () => {
      expect(tokenPathToCSSVariable('Spacing.spacing-xl')).toBe('--spacing-xl')
    })
  })

  describe('extractTokenValue', () => {
    it('extracts hex from color tokens', () => {
      const colorToken = {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 1, 1],
          alpha: 1,
          hex: '#FFFFFF'
        }
      }
      expect(extractTokenValue(colorToken)).toBe('#FFFFFF')
    })

    it('extracts value from number tokens', () => {
      const numberToken = {
        $type: 'number',
        $value: 56
      }
      expect(extractTokenValue(numberToken)).toBe(56)
    })

    it('extracts value from string tokens', () => {
      const stringToken = {
        $type: 'string',
        $value: 'Georgia'
      }
      expect(extractTokenValue(stringToken)).toBe('Georgia')
    })

    it('returns null for missing values', () => {
      expect(extractTokenValue(null)).toBe(null)
      expect(extractTokenValue({})).toBe(null)
    })
  })

  describe('getAllColorTokens', () => {
    it('returns a flat array of all color tokens', () => {
      const allColors = getAllColorTokens()
      expect(Array.isArray(allColors)).toBe(true)
      expect(allColors.length).toBeGreaterThan(20)
    })

    it('includes tokens from all categories', () => {
      const allColors = getAllColorTokens()
      const variables = allColors.map(c => c.variable)
      
      // Check for background
      expect(variables.some(v => v.includes('bg-'))).toBe(true)
      // Check for foreground
      expect(variables.some(v => v.includes('fg-'))).toBe(true)
      // Check for buttons
      expect(variables.some(v => v.includes('btn-'))).toBe(true)
    })
  })

  describe('getAllTypographyTokens', () => {
    it('returns a flat array of all typography tokens', () => {
      const allTypo = getAllTypographyTokens()
      expect(Array.isArray(allTypo)).toBe(true)
      expect(allTypo.length).toBeGreaterThan(10)
    })

    it('includes font sizes, weights, and line heights', () => {
      const allTypo = getAllTypographyTokens()
      const variables = allTypo.map(t => t.variable)
      
      expect(variables.some(v => v.includes('font-size'))).toBe(true)
      expect(variables.some(v => v.includes('font-weight'))).toBe(true)
      expect(variables.some(v => v.includes('line-height'))).toBe(true)
    })
  })

  describe('fontFamilyTokens', () => {
    it('has SEM font families', () => {
      expect(fontFamilyTokens.sem).toBeDefined()
      expect(fontFamilyTokens.sem.length).toBeGreaterThan(0)
    })

    it('has ForbesMedia font families', () => {
      expect(fontFamilyTokens.forbesMedia).toBeDefined()
      expect(fontFamilyTokens.forbesMedia.length).toBeGreaterThan(0)
    })

    it('SEM has serif and sans-serif', () => {
      const names = fontFamilyTokens.sem.map(f => f.name)
      expect(names).toContain('font-family-serif')
      expect(names).toContain('font-family-sans-serif')
    })

    it('ForbesMedia has Schnyder S for display and Work Sans for heading/body', () => {
      const displayToken = fontFamilyTokens.forbesMedia.find(f => f.name === 'font-family-display')
      const headingToken = fontFamilyTokens.forbesMedia.find(f => f.name === 'font-family-heading')
      const bodyToken = fontFamilyTokens.forbesMedia.find(f => f.name === 'font-family-body')
      expect(displayToken.value).toBe('Schnyder S')
      expect(headingToken.value).toBe('Work Sans')
      expect(bodyToken.value).toBe('Work Sans')
    })

    it('each font family has required properties', () => {
      fontFamilyTokens.sem.forEach(font => {
        expect(font).toHaveProperty('name')
        expect(font).toHaveProperty('variable')
        expect(font).toHaveProperty('value')
        expect(font).toHaveProperty('fallback')
      })
    })
  })

  describe('themeFontMap', () => {
    it('maps Health SEM to sem fonts', () => {
      expect(themeFontMap['theme-health---sem']).toBe('sem')
    })

    it('maps ForbesMedia SEO to forbesMedia fonts', () => {
      expect(themeFontMap['theme-forbesmedia---seo']).toBe('forbesMedia')
    })

    it('maps LLM to forbesMedia fonts', () => {
      expect(themeFontMap['theme-llm']).toBe('forbesMedia')
    })
  })

  describe('getFontFamiliesForTheme', () => {
    it('returns SEM fonts for Health theme', () => {
      const fonts = getFontFamiliesForTheme('theme-health---sem')
      expect(fonts).toBe(fontFamilyTokens.sem)
    })

    it('returns ForbesMedia fonts for Forbes theme', () => {
      const fonts = getFontFamiliesForTheme('theme-forbesmedia---seo')
      expect(fonts).toBe(fontFamilyTokens.forbesMedia)
    })

    it('returns SEM fonts as fallback for unknown theme', () => {
      const fonts = getFontFamiliesForTheme('theme-unknown')
      expect(fonts).toBe(fontFamilyTokens.sem)
    })
  })

  describe('getThemeFonts', () => {
    it('returns CSS variable references for SEM themes', () => {
      const fonts = getThemeFonts('theme-health---sem')
      // SEM returns serif/sans-serif CSS variables
      expect(fonts.display).toBe('var(--font-family-serif)')
      expect(fonts.heading).toBe('var(--font-family-sans-serif)')
      expect(fonts.body).toBe('var(--font-family-serif)')
      expect(fonts.sansSerif).toBe('var(--font-family-sans-serif)')
    })

    it('returns CSS variable references for ForbesMedia theme', () => {
      const fonts = getThemeFonts('theme-forbesmedia---seo')
      // ForbesMedia returns display/heading/body/sans-serif CSS variables
      expect(fonts.display).toBe('var(--font-family-display)')
      expect(fonts.heading).toBe('var(--font-family-heading)')
      expect(fonts.body).toBe('var(--font-family-body)')
      expect(fonts.sansSerif).toBe('var(--font-family-sans-serif)')
    })

    it('returns CSS variable references for LLM theme (same as ForbesMedia)', () => {
      const fonts = getThemeFonts('theme-llm')
      expect(fonts.display).toBe('var(--font-family-display)')
      expect(fonts.heading).toBe('var(--font-family-heading)')
      expect(fonts.body).toBe('var(--font-family-body)')
      expect(fonts.sansSerif).toBe('var(--font-family-sans-serif)')
    })

    it('returns ForbesMedia fonts for unknown theme (isSEMTheme returns false)', () => {
      const fonts = getThemeFonts('unknown-theme')
      // isSEMTheme returns false for unknown themes, so it falls back to ForbesMedia fonts
      expect(fonts.display).toBe('var(--font-family-display)')
      expect(fonts.heading).toBe('var(--font-family-heading)')
      expect(fonts.sansSerif).toBe('var(--font-family-sans-serif)')
    })
  })

  describe('getFontFamilyForToken', () => {
    const semFonts = getThemeFonts('theme-health---sem')
    const forbesFonts = getThemeFonts('theme-forbesmedia---seo')

    it('returns display font for display token', () => {
      expect(getFontFamilyForToken('display', semFonts, 'theme-health---sem')).toBe(semFonts.display)
      expect(getFontFamilyForToken('display', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.display)
    })

    it('returns sansSerif font for heading tokens in SEM themes', () => {
      // SEM: headings use sans-serif (Euclid Circular B)
      expect(getFontFamilyForToken('heading-lg', semFonts, 'theme-health---sem')).toBe(semFonts.sansSerif)
      expect(getFontFamilyForToken('heading-md', semFonts, 'theme-health---sem')).toBe(semFonts.sansSerif)
    })

    it('returns body font for heading tokens in ForbesMedia themes', () => {
      // ForbesMedia: headings use body font (Work Sans)
      expect(getFontFamilyForToken('heading-lg', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.body)
      expect(getFontFamilyForToken('heading-md', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.body)
    })

    it('returns display font for body tokens in SEM themes', () => {
      // SEM: body uses serif (Georgia) which is same as display
      expect(getFontFamilyForToken('body-lg', semFonts, 'theme-health---sem')).toBe(semFonts.display)
      expect(getFontFamilyForToken('body-md', semFonts, 'theme-health---sem')).toBe(semFonts.display)
    })

    it('returns body font for body tokens in ForbesMedia themes', () => {
      // ForbesMedia: body uses body font (Work Sans)
      expect(getFontFamilyForToken('body-lg', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.body)
      expect(getFontFamilyForToken('body-md', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.body)
    })

    it('returns sansSerif font for label tokens in SEM themes', () => {
      expect(getFontFamilyForToken('label-lg', semFonts, 'theme-health---sem')).toBe(semFonts.sansSerif)
      expect(getFontFamilyForToken('label-md', semFonts, 'theme-health---sem')).toBe(semFonts.sansSerif)
    })

    it('returns body font for label tokens in ForbesMedia themes', () => {
      // ForbesMedia: labels use body font (Work Sans)
      expect(getFontFamilyForToken('label-lg', forbesFonts, 'theme-forbesmedia---seo')).toBe(forbesFonts.body)
    })

    it('returns sansSerif font as fallback for unknown tokens in SEM', () => {
      expect(getFontFamilyForToken('unknown-token', semFonts, 'theme-health---sem')).toBe(semFonts.sansSerif)
    })
  })
})

