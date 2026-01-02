import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TemplateSelector, { TEMPLATE_PRESETS } from './TemplateSelector'

// Mock the themeService
vi.mock('../../../lib/themeService', () => ({
  getThemes: vi.fn(() => Promise.resolve([
    { id: 'theme-1', name: 'Theme One', slug: 'theme-one' },
    { id: 'theme-2', name: 'Theme Two', slug: 'theme-two' },
  ])),
  getThemeById: vi.fn((id) => Promise.resolve({
    id,
    name: 'Theme One',
    slug: 'theme-one',
    theme_tokens: [
      { category: 'color', subcategory: 'background', name: 'white', value: { hex: '#FFFFFF' }, css_variable: '--color-bg-white' },
      { category: 'color', subcategory: 'background', name: 'black', value: { hex: '#000000' }, css_variable: '--color-bg-black' },
    ],
  })),
}))

describe('TemplateSelector', () => {
  const defaultProps = {
    selectedTemplate: null,
    onSelect: vi.fn(),
    sourceThemeId: null,
    onSourceThemeChange: vi.fn(),
    onTokensChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all template options', () => {
    render(<TemplateSelector {...defaultProps} />)
    
    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
    expect(screen.getByTestId('template-blank')).toBeInTheDocument()
    expect(screen.getByTestId('template-light')).toBeInTheDocument()
    expect(screen.getByTestId('template-dark')).toBeInTheDocument()
    expect(screen.getByTestId('template-duplicate')).toBeInTheDocument()
  })

  it('shows all template names and descriptions', () => {
    render(<TemplateSelector {...defaultProps} />)
    
    expect(screen.getByText('Blank')).toBeInTheDocument()
    expect(screen.getByText('Start with no pre-populated tokens')).toBeInTheDocument()
    expect(screen.getByText('Light Mode')).toBeInTheDocument()
    expect(screen.getByText('Standard light theme with neutral backgrounds')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByText('Dark backgrounds with light text')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Existing')).toBeInTheDocument()
    expect(screen.getByText('Copy tokens from an existing theme')).toBeInTheDocument()
  })

  it('calls onSelect when a template is clicked', () => {
    const onSelect = vi.fn()
    render(<TemplateSelector {...defaultProps} onSelect={onSelect} />)
    
    fireEvent.click(screen.getByTestId('template-light'))
    
    expect(onSelect).toHaveBeenCalledWith('light')
  })

  it('selecting template updates initial tokens', () => {
    const onTokensChange = vi.fn()
    render(<TemplateSelector {...defaultProps} onTokensChange={onTokensChange} />)
    
    fireEvent.click(screen.getByTestId('template-light'))
    
    // Light template should have pre-populated tokens
    expect(onTokensChange).toHaveBeenCalled()
    const tokens = onTokensChange.mock.calls[0][0]
    expect(tokens.length).toBeGreaterThan(0)
  })

  it('blank template has no tokens', () => {
    const onTokensChange = vi.fn()
    render(<TemplateSelector {...defaultProps} onTokensChange={onTokensChange} />)
    
    fireEvent.click(screen.getByTestId('template-blank'))
    
    expect(onTokensChange).toHaveBeenCalledWith([])
  })

  it('shows theme selector when duplicate is selected', async () => {
    render(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="duplicate"
      />
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('duplicate-theme-selector')).toBeInTheDocument()
    })
  })

  it('loads existing themes for duplicate selector', async () => {
    render(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="duplicate"
      />
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('source-theme-select')).toBeInTheDocument()
    })
    
    // Should have theme options
    const select = screen.getByTestId('source-theme-select')
    expect(select.querySelector('option[value="theme-1"]')).toBeInTheDocument()
    expect(select.querySelector('option[value="theme-2"]')).toBeInTheDocument()
  })

  it('loads source theme tokens when duplicate theme is selected', async () => {
    const onTokensChange = vi.fn()
    const { rerender } = render(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="duplicate"
        onTokensChange={onTokensChange}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('source-theme-select')).toBeInTheDocument()
    })

    // Now set the source theme ID
    rerender(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="duplicate"
        sourceThemeId="theme-1"
        onTokensChange={onTokensChange}
      />
    )

    await waitFor(() => {
      expect(onTokensChange).toHaveBeenCalled()
    })

    // Check that tokens were loaded from the source theme
    const lastCall = onTokensChange.mock.calls[onTokensChange.mock.calls.length - 1]
    expect(lastCall[0]).toHaveLength(2)
    expect(lastCall[0][0].name).toBe('white')
  })

  it('clears source theme when switching away from duplicate', () => {
    const onSourceThemeChange = vi.fn()
    render(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="duplicate"
        sourceThemeId="theme-1"
        onSourceThemeChange={onSourceThemeChange}
      />
    )
    
    // Switch to light template
    fireEvent.click(screen.getByTestId('template-light'))
    
    expect(onSourceThemeChange).toHaveBeenCalledWith(null)
  })

  it('highlights selected template', () => {
    render(
      <TemplateSelector 
        {...defaultProps} 
        selectedTemplate="dark"
      />
    )
    
    const darkButton = screen.getByTestId('template-dark')
    // Check that the selected template has different styling
    expect(darkButton).toHaveStyle({
      border: '2px solid var(--color-btn-primary-bg, #657E79)'
    })
  })
})

describe('TEMPLATE_PRESETS', () => {
  it('exports all four template presets', () => {
    expect(TEMPLATE_PRESETS.blank).toBeDefined()
    expect(TEMPLATE_PRESETS.light).toBeDefined()
    expect(TEMPLATE_PRESETS.dark).toBeDefined()
    expect(TEMPLATE_PRESETS.duplicate).toBeDefined()
  })

  it('blank template has empty tokens array', () => {
    expect(TEMPLATE_PRESETS.blank.tokens).toEqual([])
  })

  it('light template has pre-populated tokens', () => {
    expect(TEMPLATE_PRESETS.light.tokens.length).toBeGreaterThan(0)
    
    // Should have color tokens
    const colorTokens = TEMPLATE_PRESETS.light.tokens.filter(t => t.category === 'color')
    expect(colorTokens.length).toBeGreaterThan(0)
    
    // Should have typography tokens
    const typographyTokens = TEMPLATE_PRESETS.light.tokens.filter(t => t.category === 'typography')
    expect(typographyTokens.length).toBeGreaterThan(0)
    
    // Should have spacing tokens
    const spacingTokens = TEMPLATE_PRESETS.light.tokens.filter(t => t.category === 'spacing')
    expect(spacingTokens.length).toBeGreaterThan(0)
  })

  it('dark template has inverted colors', () => {
    const lightBg = TEMPLATE_PRESETS.light.tokens.find(t => t.name === 'white' && t.subcategory === 'background')
    const darkBg = TEMPLATE_PRESETS.dark.tokens.find(t => t.name === 'white' && t.subcategory === 'background')
    
    // Dark mode "white" background should be dark
    expect(lightBg.value.hex).toBe('#FFFFFF')
    expect(darkBg.value.hex).toBe('#1E2125')
  })

  it('duplicate template has empty tokens (loaded dynamically)', () => {
    expect(TEMPLATE_PRESETS.duplicate.tokens).toEqual([])
  })
})

