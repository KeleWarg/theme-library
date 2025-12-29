import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import {
  fontFamilyTokens,
  themeFontMap,
  getFontFamiliesForTheme,
  getThemeFonts,
  getFontFamilyForToken,
} from '../lib/tokenData'
import Foundations from '../pages/Foundations'

describe('Typography and Theme System', () => {
  // Store original class to restore after tests
  let originalClass

  beforeEach(() => {
    originalClass = document.documentElement.className
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  afterEach(() => {
    document.documentElement.className = originalClass
    cleanup()
  })

  // ============================================
  // 1. Font Family Mapping Tests
  // ============================================
  describe('Font Family Mapping', () => {
    describe('SEM Themes Font Families', () => {
      const semThemes = [
        'theme-health---sem',
        'theme-home---sem',
        'theme-advisor-sem-compare-coverage',
      ]

      semThemes.forEach(theme => {
        it(`${theme} uses Georgia for display`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.display).toContain('Georgia')
        })

        it(`${theme} uses Euclid Circular B for heading`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.heading).toContain('Euclid Circular B')
        })

        it(`${theme} uses Georgia for body`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.body).toContain('Georgia')
        })

        it(`${theme} uses Euclid Circular B for sans-serif`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.sansSerif).toContain('Euclid Circular B')
        })

        it(`${theme} maps to "sem" font set`, () => {
          expect(themeFontMap[theme]).toBe('sem')
        })
      })

      it('SEM fontFamilyTokens includes Georgia for display', () => {
        const displayToken = fontFamilyTokens.sem.find(t => t.name === 'font-family-display')
        expect(displayToken).toBeDefined()
        expect(displayToken.value).toBe('Georgia')
      })

      it('SEM fontFamilyTokens includes Euclid Circular B for heading', () => {
        const headingToken = fontFamilyTokens.sem.find(t => t.name === 'font-family-heading')
        expect(headingToken).toBeDefined()
        expect(headingToken.value).toBe('Euclid Circular B')
      })

      it('SEM fontFamilyTokens includes Georgia for body', () => {
        const bodyToken = fontFamilyTokens.sem.find(t => t.name === 'font-family-body')
        expect(bodyToken).toBeDefined()
        expect(bodyToken.value).toBe('Georgia')
      })

      it('SEM fontFamilyTokens includes Euclid Circular B for sans-serif', () => {
        const sansToken = fontFamilyTokens.sem.find(t => t.name === 'font-family-sans-serif')
        expect(sansToken).toBeDefined()
        expect(sansToken.value).toBe('Euclid Circular B')
      })
    })

    describe('ForbesMedia SEO Theme Font Families', () => {
      const forbesThemes = ['theme-forbesmedia---seo', 'theme-forbes-media---seo']

      forbesThemes.forEach(theme => {
        it(`${theme} uses Schnyder S for display ONLY`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.display).toContain('Schnyder S')
        })

        it(`${theme} uses Work Sans for heading (not Schnyder S)`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.heading).toContain('Work Sans')
          expect(fonts.heading).not.toContain('Schnyder S')
        })

        it(`${theme} uses Work Sans for body`, () => {
          const fonts = getThemeFonts(theme)
          expect(fonts.body).toContain('Work Sans')
        })

        it(`${theme} maps to "forbesMedia" font set`, () => {
          expect(themeFontMap[theme]).toBe('forbesMedia')
        })
      })

      it('ForbesMedia fontFamilyTokens has Schnyder S display', () => {
        const token = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-display')
        expect(token).toBeDefined()
        expect(token.value).toBe('Schnyder S')
      })

      it('ForbesMedia fontFamilyTokens has Work Sans heading', () => {
        const token = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-heading')
        expect(token).toBeDefined()
        expect(token.value).toBe('Work Sans')
      })

      it('ForbesMedia fontFamilyTokens has Work Sans body', () => {
        const token = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-body')
        expect(token).toBeDefined()
        expect(token.value).toBe('Work Sans')
      })

      it('ForbesMedia fontFamilyTokens has Work Sans sans-serif', () => {
        const token = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-sans-serif')
        expect(token).toBeDefined()
        expect(token.value).toBe('Work Sans')
      })

      it('ForbesMedia fontFamilyTokens has Graphik breadcrumbs', () => {
        const token = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-breadcrumbs')
        expect(token).toBeDefined()
        expect(token.value).toBe('Graphik')
      })
    })

    describe('LLM Theme Font Families', () => {
      it('LLM maps to "forbesMedia" font set', () => {
        expect(themeFontMap['theme-llm']).toBe('forbesMedia')
      })

      it('LLM uses Schnyder S for display ONLY', () => {
        const fonts = getThemeFonts('theme-llm')
        expect(fonts.display).toContain('Schnyder S')
      })

      it('LLM uses Work Sans for heading, body, and sans-serif', () => {
        const fonts = getThemeFonts('theme-llm')
        expect(fonts.heading).toContain('Work Sans')
        expect(fonts.body).toContain('Work Sans')
        expect(fonts.sansSerif).toContain('Work Sans')
      })

      it('LLM fonts exactly match ForbesMedia SEO fonts', () => {
        const llmFonts = getThemeFonts('theme-llm')
        const forbesFonts = getThemeFonts('theme-forbesmedia---seo')

        expect(llmFonts.display).toBe(forbesFonts.display)
        expect(llmFonts.heading).toBe(forbesFonts.heading)
        expect(llmFonts.body).toBe(forbesFonts.body)
        expect(llmFonts.sansSerif).toBe(forbesFonts.sansSerif)
      })

      it('LLM and ForbesMedia use same font family tokens', () => {
        const llmFamilies = getFontFamiliesForTheme('theme-llm')
        const forbesFamilies = getFontFamiliesForTheme('theme-forbesmedia---seo')

        expect(llmFamilies.length).toBe(forbesFamilies.length)
        
        llmFamilies.forEach((llmToken, index) => {
          expect(llmToken.value).toBe(forbesFamilies[index].value)
          expect(llmToken.variable).toBe(forbesFamilies[index].variable)
        })
      })
    })
  })

  // ============================================
  // 2. Font Size to Font Family Tests
  // ============================================
  describe('Font Size to Font Family Mapping', () => {
    describe('Display token uses display font (Schnyder S for ForbesMedia ONLY)', () => {
      it('display uses display font for SEM themes (Georgia)', () => {
        const semFonts = getThemeFonts('theme-health---sem')
        const fontFamily = getFontFamilyForToken('display', semFonts)
        expect(fontFamily).toBe(semFonts.display)
        expect(fontFamily).toContain('Georgia')
      })

      it('display uses display font for ForbesMedia (Schnyder S)', () => {
        const forbesFonts = getThemeFonts('theme-forbesmedia---seo')
        const fontFamily = getFontFamilyForToken('display', forbesFonts)
        expect(fontFamily).toBe(forbesFonts.display)
        expect(fontFamily).toContain('Schnyder S')
      })
    })

    describe('Heading tokens (heading-lg, heading-md, heading-sm) use heading font', () => {
      const headingTokens = ['heading-lg', 'heading-md', 'heading-sm']
      
      headingTokens.forEach(tokenName => {
        it(`${tokenName} uses heading font for SEM themes (Euclid Circular B)`, () => {
          const semFonts = getThemeFonts('theme-health---sem')
          const fontFamily = getFontFamilyForToken(tokenName, semFonts)
          expect(fontFamily).toBe(semFonts.heading)
          expect(fontFamily).toContain('Euclid Circular B')
        })

        it(`${tokenName} uses heading font for ForbesMedia (Work Sans, NOT Schnyder S)`, () => {
          const forbesFonts = getThemeFonts('theme-forbesmedia---seo')
          const fontFamily = getFontFamilyForToken(tokenName, forbesFonts)
          expect(fontFamily).toBe(forbesFonts.heading)
          expect(fontFamily).toContain('Work Sans')
          expect(fontFamily).not.toContain('Schnyder S')
        })
      })
    })

    describe('Body tokens use body font', () => {
      const bodyTokens = ['body-lg', 'body-md', 'body-sm', 'body-xs']

      bodyTokens.forEach(tokenName => {
        it(`${tokenName} uses body font for SEM themes (Georgia)`, () => {
          const semFonts = getThemeFonts('theme-health---sem')
          const fontFamily = getFontFamilyForToken(tokenName, semFonts)
          expect(fontFamily).toBe(semFonts.body)
          expect(fontFamily).toContain('Georgia')
        })

        it(`${tokenName} uses body font for ForbesMedia/LLM (Work Sans)`, () => {
          const forbesFonts = getThemeFonts('theme-forbesmedia---seo')
          const fontFamily = getFontFamilyForToken(tokenName, forbesFonts)
          expect(fontFamily).toBe(forbesFonts.body)
          expect(fontFamily).toContain('Work Sans')
        })
      })
    })

    describe('Label tokens use sans-serif font', () => {
      const labelTokens = ['label-lg', 'label-md', 'label-sm', 'label-xs']

      labelTokens.forEach(tokenName => {
        it(`${tokenName} uses Euclid Circular B for SEM themes`, () => {
          const semFonts = getThemeFonts('theme-health---sem')
          const fontFamily = getFontFamilyForToken(tokenName, semFonts)
          expect(fontFamily).toBe(semFonts.sansSerif)
          expect(fontFamily).toContain('Euclid Circular B')
        })

        it(`${tokenName} uses Work Sans for ForbesMedia/LLM`, () => {
          const forbesFonts = getThemeFonts('theme-forbesmedia---seo')
          const fontFamily = getFontFamilyForToken(tokenName, forbesFonts)
          expect(fontFamily).toBe(forbesFonts.sansSerif)
          expect(fontFamily).toContain('Work Sans')
        })
      })
    })

    describe('Title tokens use sans-serif font', () => {
      const titleTokens = ['title-lg', 'title-md', 'title-sm', 'title-xs']

      titleTokens.forEach(tokenName => {
        it(`${tokenName} uses sans-serif font`, () => {
          const semFonts = getThemeFonts('theme-health---sem')
          const fontFamily = getFontFamilyForToken(tokenName, semFonts)
          expect(fontFamily).toBe(semFonts.sansSerif)
        })
      })
    })
  })

  // ============================================
  // 3. Theme Switching Tests
  // ============================================
  describe('Theme Switching', () => {
    it('renders SEM fonts when theme-health---sem is active', () => {
      document.documentElement.className = 'theme-health---sem'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      // Georgia appears multiple times (display + body)
      expect(screen.getAllByText('Georgia').length).toBeGreaterThanOrEqual(1)
      // Euclid Circular B appears multiple times (heading + sans-serif)
      expect(screen.getAllByText('Euclid Circular B').length).toBeGreaterThanOrEqual(1)
    })

    it('renders ForbesMedia fonts when theme-forbesmedia---seo is active', () => {
      document.documentElement.className = 'theme-forbesmedia---seo'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      // Schnyder S appears multiple times (heading name + value badge)
      expect(screen.getAllByText('Schnyder S').length).toBeGreaterThanOrEqual(1)
      // Work Sans appears multiple times (body, sans-serif)
      expect(screen.getAllByText('Work Sans').length).toBeGreaterThanOrEqual(2)
      // Graphik appears multiple times (breadcrumbs name + value badge)
      expect(screen.getAllByText('Graphik').length).toBeGreaterThanOrEqual(1)
    })

    it('renders ForbesMedia fonts when theme-llm is active (matches ForbesMedia SEO)', () => {
      document.documentElement.className = 'theme-llm'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      // Schnyder S appears multiple times (heading name + value badge)
      expect(screen.getAllByText('Schnyder S').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Work Sans').length).toBeGreaterThanOrEqual(2)
      // Graphik appears multiple times (breadcrumbs name + value badge)
      expect(screen.getAllByText('Graphik').length).toBeGreaterThanOrEqual(1)
    })

    it('shows correct description for SEM themes', () => {
      document.documentElement.className = 'theme-health---sem'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      expect(screen.getByText(/SEM themes use Georgia for serif/)).toBeInTheDocument()
    })

    it('shows correct description for ForbesMedia themes', () => {
      document.documentElement.className = 'theme-forbesmedia---seo'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      expect(screen.getByText(/ForbesMedia typography system with Work Sans, Schnyder S, and Graphik/)).toBeInTheDocument()
    })

    it('shows ForbesMedia description for LLM theme', () => {
      document.documentElement.className = 'theme-llm'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      
      // LLM should show ForbesMedia fonts description
      expect(screen.getByText(/ForbesMedia typography system with Work Sans, Schnyder S, and Graphik/)).toBeInTheDocument()
    })
  })

  // ============================================
  // 4. CSS Variable Tests
  // ============================================
  describe('CSS Variables Defined', () => {
    it('SEM has display, heading, body, sansSerif defined', () => {
      const fonts = getThemeFonts('theme-health---sem')
      expect(fonts.display).toBeDefined()
      expect(fonts.heading).toBeDefined()
      expect(fonts.body).toBeDefined()
      expect(fonts.sansSerif).toBeDefined()
    })

    it('SEM --font-family-display equals Georgia', () => {
      const fonts = getThemeFonts('theme-health---sem')
      expect(fonts.display).toContain('Georgia')
    })

    it('SEM --font-family-heading equals Euclid Circular B', () => {
      const fonts = getThemeFonts('theme-health---sem')
      expect(fonts.heading).toContain('Euclid Circular B')
    })

    it('ForbesMedia --font-family-display equals Schnyder S', () => {
      const fonts = getThemeFonts('theme-forbesmedia---seo')
      expect(fonts.display).toContain('Schnyder S')
    })

    it('ForbesMedia --font-family-heading equals Work Sans (NOT Schnyder S)', () => {
      const fonts = getThemeFonts('theme-forbesmedia---seo')
      expect(fonts.heading).toContain('Work Sans')
      expect(fonts.heading).not.toContain('Schnyder S')
    })

    it('ForbesMedia --font-family-body equals Work Sans', () => {
      const fonts = getThemeFonts('theme-forbesmedia---seo')
      expect(fonts.body).toContain('Work Sans')
    })

    it('LLM --font-family-body equals Work Sans (not Georgia)', () => {
      const fonts = getThemeFonts('theme-llm')
      expect(fonts.body).toContain('Work Sans')
      expect(fonts.body).not.toMatch(/^Georgia/)
    })

    it('fontFamilyTokens.forbesMedia has correct body variable', () => {
      const bodyToken = fontFamilyTokens.forbesMedia.find(t => t.variable === '--font-family-body')
      expect(bodyToken).toBeDefined()
      expect(bodyToken.value).toBe('Work Sans')
      expect(bodyToken.fallback).toContain('Work Sans')
      expect(bodyToken.fallback).not.toContain('Georgia')
    })
  })

  // ============================================
  // 5. No Georgia in SEO/LLM Tests
  // ============================================
  describe('Georgia Usage Restrictions', () => {
    describe('ForbesMedia SEO does not use Georgia for body', () => {
      it('getThemeFonts body does not contain Georgia', () => {
        const fonts = getThemeFonts('theme-forbesmedia---seo')
        expect(fonts.body).not.toContain('Georgia')
      })

      it('fontFamilyTokens body token value is not Georgia', () => {
        const bodyToken = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-body')
        expect(bodyToken.value).not.toBe('Georgia')
        expect(bodyToken.value).toBe('Work Sans')
      })

      it('fontFamilyTokens body token fallback does not contain Georgia', () => {
        const bodyToken = fontFamilyTokens.forbesMedia.find(t => t.name === 'font-family-body')
        expect(bodyToken.fallback).not.toContain('Georgia')
      })
    })

    describe('LLM theme does not use Georgia for body', () => {
      it('getThemeFonts body does not contain Georgia', () => {
        const fonts = getThemeFonts('theme-llm')
        expect(fonts.body).not.toContain('Georgia')
      })

      it('LLM uses same non-Georgia body font as ForbesMedia', () => {
        const llmFonts = getThemeFonts('theme-llm')
        const forbesFonts = getThemeFonts('theme-forbesmedia---seo')
        expect(llmFonts.body).toBe(forbesFonts.body)
        expect(llmFonts.body).not.toContain('Georgia')
      })
    })

    describe('Georgia only appears in SEM themes', () => {
      it('SEM themes use Georgia for display and body', () => {
        const semFonts = getThemeFonts('theme-health---sem')
        expect(semFonts.display).toContain('Georgia')
        expect(semFonts.body).toContain('Georgia')
      })

      it('SEM themes use Euclid Circular B for heading and sansSerif', () => {
        const semFonts = getThemeFonts('theme-health---sem')
        expect(semFonts.heading).toContain('Euclid Circular B')
        expect(semFonts.sansSerif).toContain('Euclid Circular B')
      })

      it('ForbesMedia does not use Georgia anywhere', () => {
        const fonts = getThemeFonts('theme-forbesmedia---seo')
        expect(fonts.display).not.toContain('Georgia')
        expect(fonts.heading).not.toContain('Georgia')
        expect(fonts.body).not.toContain('Georgia')
        expect(fonts.sansSerif).not.toContain('Georgia')
      })

      it('fontFamilyTokens.forbesMedia does not use Georgia anywhere', () => {
        fontFamilyTokens.forbesMedia.forEach(token => {
          expect(token.value).not.toBe('Georgia')
          if (token.fallback) {
            expect(token.fallback).not.toContain('Georgia')
          }
        })
      })
    })
  })

  // ============================================
  // 6. Edge Cases and Fallbacks
  // ============================================
  describe('Edge Cases and Fallbacks', () => {
    it('unknown theme falls back to SEM fonts', () => {
      const fonts = getThemeFonts('theme-unknown-theme')
      expect(fonts.display).toContain('Georgia')
      expect(fonts.heading).toContain('Euclid Circular B')
      expect(fonts.body).toContain('Georgia')
      expect(fonts.sansSerif).toContain('Euclid Circular B')
    })

    it('getFontFamilyForToken returns body as fallback for unknown tokens', () => {
      const fonts = getThemeFonts('theme-health---sem')
      const fallback = getFontFamilyForToken('unknown-token-type', fonts)
      expect(fallback).toBe(fonts.body)
    })

    it('getFontFamiliesForTheme returns correct array for SEM', () => {
      const families = getFontFamiliesForTheme('theme-health---sem')
      expect(Array.isArray(families)).toBe(true)
      expect(families.length).toBe(4) // display, heading, body, sans-serif
    })

    it('getFontFamiliesForTheme returns correct array for ForbesMedia', () => {
      const families = getFontFamiliesForTheme('theme-forbesmedia---seo')
      expect(Array.isArray(families)).toBe(true)
      expect(families.length).toBe(5) // display, heading, body, sans-serif, breadcrumbs
    })
  })
})

