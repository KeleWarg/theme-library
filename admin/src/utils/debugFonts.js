/**
 * Debug utility for verifying font configurations across themes
 * 
 * Usage:
 *   import { debugFonts, verifyFontConfig } from './utils/debugFonts'
 *   
 *   // Log all theme font configurations
 *   debugFonts()
 *   
 *   // Verify a specific theme
 *   verifyFontConfig('theme-forbes-media-seo')
 */

// All supported themes
export const ALL_THEMES = [
  'theme-health---sem',
  'theme-home---sem',
  'theme-forbesmedia---seo',
  'theme-forbes-media---seo',
  'theme-llm',
  'theme-advisor-sem-compare-coverage',
]

// Expected font configurations
export const EXPECTED_FONTS = {
  sem: {
    display: 'Georgia',
    heading: 'Euclid Circular B',
    body: 'Georgia',
    sansSerif: 'Euclid Circular B',
    description: 'SEM themes: Georgia for display/body, Euclid Circular B for heading/labels',
  },
  forbesMedia: {
    display: 'Schnyder S',
    heading: 'Work Sans',
    body: 'Work Sans',
    sansSerif: 'Work Sans',
    description: 'ForbesMedia/LLM themes: Schnyder S for display ONLY, Work Sans for everything else',
  },
}

// Theme to font set mapping
export const THEME_FONT_SET = {
  'theme-health---sem': 'sem',
  'theme-home---sem': 'sem',
  'theme-advisor-sem-compare-coverage': 'sem',
  'theme-forbesmedia---seo': 'forbesMedia',
  'theme-forbes-media---seo': 'forbesMedia',
  'theme-llm': 'forbesMedia',
}

/**
 * Debug all theme font configurations
 * Logs to console and returns results object
 */
export function debugFonts() {
  console.log('='.repeat(60))
  console.log('FONT CONFIGURATION DEBUG')
  console.log('='.repeat(60))

  const results = {}
  const errors = []

  ALL_THEMES.forEach(theme => {
    // Apply theme class to root element
    const originalClass = document.documentElement.className
    document.documentElement.className = theme

    // Get computed CSS variables
    const computedStyle = getComputedStyle(document.documentElement)
    const heading = computedStyle.getPropertyValue('--font-family-heading').trim()
    const body = computedStyle.getPropertyValue('--font-family-body').trim()
    const headingSerif = computedStyle.getPropertyValue('--font-family-heading-serif').trim()
    const breadcrumbs = computedStyle.getPropertyValue('--font-family-breadcrumbs').trim()

    results[theme] = { heading, body, headingSerif, breadcrumbs }

    console.log(`\n${theme}:`)
    console.log(`  --font-family-heading: ${heading || '(not set)'}`)
    console.log(`  --font-family-body: ${body || '(not set)'}`)
    console.log(`  --font-family-heading-serif: ${headingSerif || '(not set)'}`)
    console.log(`  --font-family-breadcrumbs: ${breadcrumbs || '(not set)'}`)

    // Verify ForbesMedia/LLM themes
    if (theme.includes('seo') || theme.includes('llm') || theme.includes('forbes')) {
      // Body should be Work Sans, not Georgia
      if (body.toLowerCase().startsWith('georgia')) {
        const error = `ERROR: ${theme} body should be Work Sans, not Georgia!`
        console.error(`  ❌ ${error}`)
        errors.push(error)
      } else if (body.includes('Work Sans')) {
        console.log(`  ✅ Correct: Body uses Work Sans`)
      }
      // Heading should be Schnyder S
      if (heading.includes('Schnyder S')) {
        console.log(`  ✅ Correct: Heading uses Schnyder S`)
      } else {
        const error = `ERROR: ${theme} heading should be Schnyder S, got "${heading}"!`
        console.error(`  ❌ ${error}`)
        errors.push(error)
      }
    }

    // Verify SEM themes use correct fonts
    if (theme.includes('sem') && !theme.includes('forbes')) {
      if (body.includes('Euclid Circular B')) {
        console.log(`  ✅ Correct: Body uses Euclid Circular B`)
      }
      if (heading.includes('Georgia')) {
        console.log(`  ✅ Correct: Heading uses Georgia`)
      }
    }

    // Restore original class
    document.documentElement.className = originalClass
  })

  console.log('\n' + '='.repeat(60))
  if (errors.length > 0) {
    console.error(`\n❌ ERRORS FOUND: ${errors.length}`)
    errors.forEach(err => console.error(`  - ${err}`))
  } else {
    console.log('\n✅ All font configurations are correct!')
  }
  console.log('='.repeat(60))

  return { results, errors }
}

/**
 * Verify font configuration for a specific theme
 * @param {string} theme - Theme class name
 * @returns {Object} - Verification result with pass/fail and details
 */
export function verifyFontConfig(theme) {
  const fontSet = THEME_FONT_SET[theme]
  if (!fontSet) {
    return {
      pass: false,
      theme,
      error: `Unknown theme: ${theme}`,
    }
  }

  const expected = EXPECTED_FONTS[fontSet]
  const originalClass = document.documentElement.className
  document.documentElement.className = theme

  const computedStyle = getComputedStyle(document.documentElement)
  const actualBody = computedStyle.getPropertyValue('--font-family-body').trim()

  document.documentElement.className = originalClass

  const bodyCorrect = actualBody.includes(expected.body)
  
  // Special check: ForbesMedia/LLM should NOT have Georgia in body
  const noGeorgiaInBody = fontSet === 'forbesMedia' 
    ? !actualBody.toLowerCase().startsWith('georgia')
    : true

  return {
    pass: bodyCorrect && noGeorgiaInBody,
    theme,
    fontSet,
    expected: expected.body,
    actual: actualBody,
    description: expected.description,
    errors: [
      !bodyCorrect && `Expected body to contain "${expected.body}", got "${actualBody}"`,
      !noGeorgiaInBody && `ForbesMedia/LLM body should not start with Georgia`,
    ].filter(Boolean),
  }
}

/**
 * Verify LLM fonts match ForbesMedia SEO exactly
 * @returns {Object} - Comparison result
 */
export function verifyLLMMatchesForbesMedia() {
  const originalClass = document.documentElement.className
  
  // Get ForbesMedia fonts
  document.documentElement.className = 'theme-forbesmedia---seo'
  const forbesStyle = getComputedStyle(document.documentElement)
  const forbesFonts = {
    heading: forbesStyle.getPropertyValue('--font-family-heading').trim(),
    body: forbesStyle.getPropertyValue('--font-family-body').trim(),
    headingSerif: forbesStyle.getPropertyValue('--font-family-heading-serif').trim(),
    breadcrumbs: forbesStyle.getPropertyValue('--font-family-breadcrumbs').trim(),
  }

  // Get LLM fonts
  document.documentElement.className = 'theme-llm'
  const llmStyle = getComputedStyle(document.documentElement)
  const llmFonts = {
    heading: llmStyle.getPropertyValue('--font-family-heading').trim(),
    body: llmStyle.getPropertyValue('--font-family-body').trim(),
    headingSerif: llmStyle.getPropertyValue('--font-family-heading-serif').trim(),
    breadcrumbs: llmStyle.getPropertyValue('--font-family-breadcrumbs').trim(),
  }

  document.documentElement.className = originalClass

  const matches = {
    heading: forbesFonts.heading === llmFonts.heading,
    body: forbesFonts.body === llmFonts.body,
    headingSerif: forbesFonts.headingSerif === llmFonts.headingSerif,
    breadcrumbs: forbesFonts.breadcrumbs === llmFonts.breadcrumbs,
  }

  const allMatch = Object.values(matches).every(Boolean)

  console.log('\nLLM vs ForbesMedia SEO Font Comparison:')
  console.log('  heading:', matches.heading ? '✅' : '❌', forbesFonts.heading, '===', llmFonts.heading)
  console.log('  body:', matches.body ? '✅' : '❌', forbesFonts.body, '===', llmFonts.body)
  console.log('  headingSerif:', matches.headingSerif ? '✅' : '❌', forbesFonts.headingSerif, '===', llmFonts.headingSerif)
  console.log('  breadcrumbs:', matches.breadcrumbs ? '✅' : '❌', forbesFonts.breadcrumbs, '===', llmFonts.breadcrumbs)
  console.log(allMatch ? '\n✅ LLM fonts match ForbesMedia SEO exactly!' : '\n❌ LLM fonts do NOT match ForbesMedia SEO!')

  return {
    pass: allMatch,
    forbesFonts,
    llmFonts,
    matches,
  }
}

/**
 * Quick assertion that Georgia is not used for body in SEO/LLM themes
 */
export function assertNoGeorgiaInSEOBody() {
  const themes = ['theme-forbesmedia---seo', 'theme-llm']
  const originalClass = document.documentElement.className
  const errors = []

  themes.forEach(theme => {
    document.documentElement.className = theme
    const body = getComputedStyle(document.documentElement).getPropertyValue('--font-family-body').trim()
    
    if (body.toLowerCase().startsWith('georgia')) {
      errors.push(`${theme}: Body font starts with Georgia (should be Work Sans)`)
    }
  })

  document.documentElement.className = originalClass

  if (errors.length > 0) {
    console.error('❌ Georgia found in SEO/LLM body fonts:')
    errors.forEach(err => console.error(`  - ${err}`))
    return false
  }

  console.log('✅ No Georgia in SEO/LLM body fonts')
  return true
}

// Export default for easy import
export default {
  debugFonts,
  verifyFontConfig,
  verifyLLMMatchesForbesMedia,
  assertNoGeorgiaInSEOBody,
  ALL_THEMES,
  EXPECTED_FONTS,
  THEME_FONT_SET,
}

