import { useState, useEffect } from 'react'
import Tabs from '../components/ui/Tabs'
import ColorSwatch from '../components/ui/ColorSwatch'
import TypographySample from '../components/ui/TypographySample'
import FontFamilySample from '../components/ui/FontFamilySample'
import {
  colorTokens,
  typographyTokens,
  breakpoints,
  spacingTokens,
  getFontFamiliesForTheme,
  getThemeFonts,
  getFontFamilyForToken,
  themeFontMap,
  isSEMTheme
} from '../lib/tokenData'

const tabs = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
]

// Grid style for color swatches - 4 columns, 16px gap
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
}

// Section heading style
const sectionHeadingStyle = {
  fontSize: 'var(--font-size-heading-sm, 24px)',
  fontWeight: 'var(--font-weight-semibold, 600)',
  color: 'var(--color-fg-heading, #1E2125)',
  marginBottom: '16px',
  marginTop: '32px',
}

// Subsection heading style
const subsectionHeadingStyle = {
  fontSize: 'var(--font-size-title-md, 18px)',
  fontWeight: 'var(--font-weight-medium, 500)',
  color: 'var(--color-fg-heading, #1E2125)',
  marginBottom: '12px',
  marginTop: '24px',
}

function ColorsTab() {
  return (
    <div>
      {/* Backgrounds Section */}
      <h3 style={{ ...sectionHeadingStyle, marginTop: '24px' }}>Backgrounds</h3>
      <div style={gridStyle}>
        {colorTokens.backgrounds.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>

      {/* Text Colors Section */}
      <h3 style={sectionHeadingStyle}>Text Colors</h3>
      <div style={gridStyle}>
        {colorTokens.foregrounds.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>

      {/* Button Colors Section */}
      <h3 style={sectionHeadingStyle}>Button Colors</h3>
      
      {/* Primary */}
      <h4 style={subsectionHeadingStyle}>Primary</h4>
      <div style={gridStyle}>
        {colorTokens.buttons.primary.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>

      {/* Secondary */}
      <h4 style={subsectionHeadingStyle}>Secondary</h4>
      <div style={gridStyle}>
        {colorTokens.buttons.secondary.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>

      {/* Ghost */}
      <h4 style={subsectionHeadingStyle}>Ghost</h4>
      <div style={gridStyle}>
        {colorTokens.buttons.ghost.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>

      {/* Feedback Section */}
      <h3 style={sectionHeadingStyle}>Feedback</h3>
      <div style={gridStyle}>
        {colorTokens.feedback.map((token) => (
          <ColorSwatch
            key={token.variable}
            name={token.name}
            variable={token.variable}
            description={token.description}
          />
        ))}
      </div>
    </div>
  )
}

// Stack style for typography samples - vertical list
const stackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

// Theme indicator badge style
const themeBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: 'var(--color-bg-brand-subtle, #E8F5F3)',
  borderRadius: 'var(--radius-sm, 8px)',
  fontSize: 'var(--font-size-body-sm, 14px)',
  color: 'var(--color-fg-body, #444B54)',
  marginBottom: '24px',
}

function TypographyTab() {
  // Track the current theme to show appropriate font families
  const [currentTheme, setCurrentTheme] = useState(() => {
    return document.documentElement.className || 'theme-health---sem'
  })
  
  // Get theme-specific fonts
  const fontFamilies = getFontFamiliesForTheme(currentTheme)
  const themeFonts = getThemeFonts(currentTheme)
  
  // Determine theme display name
  const getThemeDisplayName = (slug) => {
    const names = {
      'theme-health---sem': 'Health SEM',
      'theme-home---sem': 'Home SEM',
      'theme-llm': 'LLM',
      'theme-forbesmedia---seo': 'ForbesMedia SEO',
      'theme-forbes-media---seo': 'ForbesMedia SEO',
      'theme-advisor-sem-compare-coverage': 'Compare Coverage',
      'theme-advisor-sem/compare-coverage': 'Compare Coverage',
    }
    return names[slug] || 'Unknown Theme'
  }

  // Listen for theme changes on document.documentElement
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newTheme = document.documentElement.className
          setCurrentTheme(newTheme)
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])

  // Check if this is a SEM theme
  const isSEM = isSEMTheme(currentTheme)

  return (
    <div>
      {/* Current Theme Indicator */}
      <div style={themeBadgeStyle}>
        <span style={{ fontWeight: 'var(--font-weight-semibold, 600)' }}>Current Theme:</span>
        <span style={{ 
          fontWeight: 'var(--font-weight-bold, 700)',
          color: 'var(--color-btn-primary-bg, #657E79)',
        }}>
          {getThemeDisplayName(currentTheme)}
        </span>
        <span style={{ 
          fontSize: 'var(--font-size-label-sm, 12px)', 
          color: 'var(--color-fg-caption, #616A76)',
        }}>
          (change via header dropdown)
        </span>
      </div>

      {/* Font Families Section */}
      <h3 style={{ ...sectionHeadingStyle, marginTop: '24px' }}>Font Families</h3>
      <p style={{
        color: 'var(--color-fg-caption, #616A76)',
        marginBottom: '16px',
        fontSize: 'var(--font-size-body-sm, 14px)',
      }}>
        {isSEM
          ? 'SEM themes use Georgia (serif) for display and body text, Euclid Circular B (sans-serif) for headings and labels.'
          : 'SEO/LLM themes use Schnyder S for display only, Work Sans for all other text (headings, body, labels).'}
      </p>
      <div style={stackStyle}>
        {fontFamilies.map((token) => (
          <FontFamilySample
            key={token.variable}
            name={token.name}
            variable={token.variable}
            value={token.value}
            fallback={token.fallback}
            description={token.description}
          />
        ))}
      </div>

      {/* Font Sizes Section */}
      <h3 style={sectionHeadingStyle}>Font Sizes</h3>
      <p style={{
        color: 'var(--color-fg-caption, #616A76)',
        marginBottom: '16px',
        fontSize: 'var(--font-size-body-sm, 14px)',
      }}>
        {isSEM ? (
          <>
            Font sizes are automatically paired with the correct font family:
            <br />• <strong>display, body</strong> → Georgia (serif)
            <br />• <strong>heading, label, title</strong> → Euclid Circular B (sans-serif)
          </>
        ) : (
          <>
            Font sizes are automatically paired with the correct font family:
            <br />• <strong>display</strong> → Schnyder S
            <br />• <strong>heading, body, label, title</strong> → Work Sans
          </>
        )}
      </p>
      <div style={stackStyle}>
        {typographyTokens.fontSizes.map((token) => (
          <TypographySample
            key={token.variable}
            name={token.name}
            variable={token.variable}
            value={token.value}
            fontFamily={getFontFamilyForToken(token.name, themeFonts, currentTheme)}
          />
        ))}
      </div>

      {/* Font Weights Section */}
      <h3 style={sectionHeadingStyle}>Font Weights</h3>
      <div style={stackStyle}>
        {typographyTokens.fontWeights.map((token) => (
          <TypographySample
            key={token.variable}
            name={token.name}
            variable={token.variable}
            value={token.value}
            sampleText="The quick brown fox jumps over the lazy dog"
            fontFamily={themeFonts.sansSerif}
          />
        ))}
      </div>

      {/* Line Heights Section */}
      <h3 style={sectionHeadingStyle}>Line Heights</h3>
      <div style={stackStyle}>
        {typographyTokens.lineHeights.map((token) => (
          <TypographySample
            key={token.variable}
            name={token.name}
            variable={token.variable}
            value={token.value}
            sampleText="The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!"
            fontFamily={themeFonts.sansSerif}
          />
        ))}
      </div>

      {/* Letter Spacing Section */}
      <h3 style={sectionHeadingStyle}>Letter Spacing</h3>
      <div style={stackStyle}>
        {typographyTokens.letterSpacing.map((token) => (
          <TypographySample
            key={token.variable}
            name={token.name}
            variable={token.variable}
            value={token.value}
            sampleText="LETTER SPACING SAMPLE TEXT"
            fontFamily={themeFonts.sansSerif}
          />
        ))}
      </div>
    </div>
  )
}

// Breakpoint card style
const breakpointCardStyle = {
  padding: '20px',
  border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
  borderRadius: 'var(--radius-sm, 8px)',
  backgroundColor: 'var(--color-bg-white, #FFFFFF)',
}

// Breakpoint info row style
const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
}

function SpacingTab() {
  return (
    <div>
      {/* Breakpoints Section */}
      <h3 style={{ ...sectionHeadingStyle, marginTop: '24px' }}>Breakpoints</h3>
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {breakpoints.map((bp) => (
          <div key={bp.name} style={breakpointCardStyle}>
            <h4 style={{
              fontSize: 'var(--font-size-title-lg, 20px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
              marginBottom: '16px',
            }}>
              {bp.name}
            </h4>
            
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Width</span>
              <span style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{bp.width}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Columns</span>
              <span style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{bp.columns}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Margin</span>
              <span style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{bp.margin}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Gutter</span>
              <span style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{bp.gutter}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Visualization Section */}
      <h3 style={sectionHeadingStyle}>Grid Visualization</h3>
      <p style={{ 
        color: 'var(--color-fg-caption, #616A76)', 
        marginBottom: '16px',
        fontSize: 'var(--font-size-body-sm, 14px)',
      }}>
        12-column grid system with 24px gutters
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px',
        padding: '24px',
        backgroundColor: 'var(--color-bg-neutral-light, #ECEFF3)',
        borderRadius: 'var(--radius-sm, 8px)',
      }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              height: '80px',
              backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 'var(--font-size-label-sm, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Spacing Scale Section */}
      <h3 style={sectionHeadingStyle}>Spacing Scale</h3>
      <div style={stackStyle}>
        {spacingTokens.map((token) => (
          <div
            key={token.variable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: 'var(--radius-sm, 8px)',
              backgroundColor: 'var(--color-bg-white, #FFFFFF)',
            }}
          >
            {/* Visual representation */}
            <div
              style={{
                width: token.value,
                height: '24px',
                backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
                borderRadius: '2px',
                flexShrink: 0,
              }}
            />
            {/* Token info */}
            <span style={{
              fontWeight: 'var(--font-weight-semibold, 600)',
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-heading, #1E2125)',
              minWidth: '100px',
            }}>
              {token.name}
            </span>
            <span style={{
              fontSize: 'var(--font-size-label-sm, 12px)',
              color: 'var(--color-fg-caption, #616A76)',
              backgroundColor: 'var(--color-bg-neutral-light, #ECEFF3)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              {token.value}
            </span>
            <code style={{
              fontFamily: 'monospace',
              fontSize: 'var(--font-size-label-sm, 12px)',
              color: 'var(--color-fg-caption, #616A76)',
              marginLeft: 'auto',
            }}>
              {token.variable}
            </code>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Foundations() {
  const [activeTab, setActiveTab] = useState('colors')

  return (
    <div>
      <h2 style={{ 
        color: 'var(--color-fg-heading)',
        fontSize: 'var(--font-size-heading-md)',
        marginBottom: '24px'
      }}>
        Foundations
      </h2>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: '8px' }}>
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'typography' && <TypographyTab />}
        {activeTab === 'spacing' && <SpacingTab />}
      </div>
    </div>
  )
}
