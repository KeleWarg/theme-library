import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import TokenMappingStep from './TokenMappingStep'

// Mock token data for testing
const mockTokens = [
  {
    name: 'primary-bg',
    category: 'color',
    subcategory: 'Button',
    group_name: 'Color',
    value: { hex: '#657E79' },
    type: 'color',
    css_variable: '--color-button-primary-bg',
    figma_variable_id: 'var-123',
    alias_reference: null,
    path: 'Color/Button/primary-bg',
    sort_order: 0,
  },
  {
    name: 'primary-text',
    category: 'color',
    subcategory: 'Button',
    group_name: 'Color',
    value: { hex: '#FFFFFF' },
    type: 'color',
    css_variable: '--color-button-primary-text',
    figma_variable_id: 'var-124',
    alias_reference: null,
    path: 'Color/Button/primary-text',
    sort_order: 1,
  },
  {
    name: 'heading-lg',
    category: 'typography',
    subcategory: 'Font Size',
    group_name: 'Font Size',
    value: { value: 48, unit: 'px' },
    type: 'number',
    css_variable: '--typography-font-size-heading-lg',
    figma_variable_id: 'var-200',
    alias_reference: null,
    path: 'Font Size/heading-lg',
    sort_order: 0,
  },
  {
    name: 'md',
    category: 'spacing',
    subcategory: null,
    group_name: 'Spacing',
    value: { value: 16, unit: 'px' },
    type: 'number',
    css_variable: '--spacing-md',
    figma_variable_id: 'var-300',
    alias_reference: null,
    path: 'Spacing/md',
    sort_order: 0,
  },
]

const mockTokensWithOther = [
  ...mockTokens,
  {
    name: 'unknown-token',
    category: 'other',
    subcategory: null,
    group_name: 'Unknown',
    value: { value: 'test' },
    type: 'string',
    css_variable: '--other-unknown-token',
    figma_variable_id: 'var-999',
    alias_reference: null,
    path: 'Unknown/unknown-token',
    sort_order: 0,
  },
  {
    name: 'another-unknown',
    category: 'other',
    subcategory: null,
    group_name: 'Mystery',
    value: { value: 'test2' },
    type: 'string',
    css_variable: '--other-another-unknown',
    figma_variable_id: 'var-998',
    alias_reference: null,
    path: 'Mystery/another-unknown',
    sort_order: 1,
  },
]

describe('TokenMappingStep', () => {
  it('renders correctly', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    expect(screen.getByTestId('token-mapping-step')).toBeInTheDocument()
  })

  it('renders categories with correct counts', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    // Color category should have 2 tokens
    const colorCategory = screen.getByTestId('category-color')
    expect(within(colorCategory).getByText('2 tokens')).toBeInTheDocument()
    
    // Typography category should have 1 token
    const typographyCategory = screen.getByTestId('category-typography')
    expect(within(typographyCategory).getByText('1 token')).toBeInTheDocument()
    
    // Spacing category should have 1 token
    const spacingCategory = screen.getByTestId('category-spacing')
    expect(within(spacingCategory).getByText('1 token')).toBeInTheDocument()
  })

  it('expands/collapses category on click', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const colorToggle = screen.getByTestId('category-toggle-color')
    
    // Initially expanded (tokens visible)
    expect(screen.getByTestId('token-row-Color/Button/primary-bg')).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(colorToggle)
    
    // Tokens should be hidden
    expect(screen.queryByTestId('token-row-Color/Button/primary-bg')).not.toBeInTheDocument()
    
    // Click to expand again
    fireEvent.click(colorToggle)
    
    // Tokens visible again
    expect(screen.getByTestId('token-row-Color/Button/primary-bg')).toBeInTheDocument()
  })

  it('shows token path and name', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const tokenRow = screen.getByTestId('token-row-Color/Button/primary-bg')
    
    // Check path is displayed
    expect(within(tokenRow).getByTestId('token-path')).toHaveTextContent('Color/Button/primary-bg')
    
    // Check name is displayed
    expect(within(tokenRow).getByTestId('token-name')).toHaveTextContent('primary-bg')
  })

  it('dropdown changes token category', () => {
    const onUpdateMapping = vi.fn()
    render(<TokenMappingStep tokens={mockTokens} onUpdateMapping={onUpdateMapping} />)
    
    // Find the dropdown for the first color token
    const dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    
    // Change category to typography
    fireEvent.change(dropdown, { target: { value: 'typography' } })
    
    // Callback should be called with updated tokens
    expect(onUpdateMapping).toHaveBeenCalled()
    const updatedTokens = onUpdateMapping.mock.calls[0][0]
    const changedToken = updatedTokens.find(t => t.path === 'Color/Button/primary-bg')
    expect(changedToken.category).toBe('typography')
  })

  it('summary updates after change', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    // Initial summary
    expect(screen.getByTestId('summary-color')).toHaveTextContent('Color:')
    expect(screen.getByTestId('summary-color')).toHaveTextContent('2')
    
    // Change one color token to typography
    const dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    fireEvent.change(dropdown, { target: { value: 'typography' } })
    
    // Summary should update
    expect(screen.getByTestId('summary-color')).toHaveTextContent('1')
    expect(screen.getByTestId('summary-typography')).toHaveTextContent('2')
  })

  it('shows warning when "other" has tokens', () => {
    render(<TokenMappingStep tokens={mockTokensWithOther} />)
    
    // Warning banner should be visible
    const warning = screen.getByTestId('other-warning')
    expect(warning).toBeInTheDocument()
    expect(warning).toHaveTextContent("2 tokens couldn't be categorized automatically")
  })

  it('does not show warning when no "other" tokens', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    // Warning banner should not be visible
    expect(screen.queryByTestId('other-warning')).not.toBeInTheDocument()
  })

  it('calls onUpdateMapping on change', () => {
    const onUpdateMapping = vi.fn()
    render(<TokenMappingStep tokens={mockTokens} onUpdateMapping={onUpdateMapping} />)
    
    // Change a category
    const dropdown = screen.getByTestId('category-select-Spacing/md')
    fireEvent.change(dropdown, { target: { value: 'grid' } })
    
    // Callback should be called
    expect(onUpdateMapping).toHaveBeenCalledTimes(1)
    
    // Check the updated tokens
    const updatedTokens = onUpdateMapping.mock.calls[0][0]
    expect(updatedTokens).toHaveLength(mockTokens.length)
    const changedToken = updatedTokens.find(t => t.path === 'Spacing/md')
    expect(changedToken.category).toBe('grid')
  })

  it('renders with empty tokens array', () => {
    render(<TokenMappingStep tokens={[]} />)
    expect(screen.getByTestId('token-mapping-step')).toBeInTheDocument()
    expect(screen.getByTestId('token-summary')).toBeInTheDocument()
  })

  it('preserves override when switching categories multiple times', () => {
    const onUpdateMapping = vi.fn()
    render(<TokenMappingStep tokens={mockTokens} onUpdateMapping={onUpdateMapping} />)
    
    // First change to typography - dropdown is in color section
    let dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    fireEvent.change(dropdown, { target: { value: 'typography' } })
    expect(onUpdateMapping).toHaveBeenCalledTimes(1)
    
    // Token has moved to typography section - need to find it there
    dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    fireEvent.change(dropdown, { target: { value: 'spacing' } })
    expect(onUpdateMapping).toHaveBeenCalledTimes(2)
    
    // Token has moved to spacing section - find it there and change back
    dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    fireEvent.change(dropdown, { target: { value: 'color' } })
    
    // Should have called onUpdateMapping 3 times
    expect(onUpdateMapping).toHaveBeenCalledTimes(3)
    
    // Final state should be color
    const finalTokens = onUpdateMapping.mock.calls[2][0]
    const token = finalTokens.find(t => t.path === 'Color/Button/primary-bg')
    expect(token.category).toBe('color')
  })

  it('shows "Changed" indicator for overridden tokens', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    // Initially no "Changed" indicator
    const tokenRow = screen.getByTestId('token-row-Color/Button/primary-bg')
    expect(within(tokenRow).queryByText('Changed')).not.toBeInTheDocument()
    
    // Change the category
    const dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    fireEvent.change(dropdown, { target: { value: 'spacing' } })
    
    // Token moves to spacing category, find it there
    const spacingCategory = screen.getByTestId('category-spacing')
    
    // Should now show "Changed" indicator
    const changedIndicator = within(spacingCategory).getByText('Changed')
    expect(changedIndicator).toBeInTheDocument()
  })

  it('renders summary with all categories', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const summary = screen.getByTestId('token-summary')
    
    // Check all categories in summary
    expect(within(summary).getByTestId('summary-color')).toBeInTheDocument()
    expect(within(summary).getByTestId('summary-typography')).toBeInTheDocument()
    expect(within(summary).getByTestId('summary-spacing')).toBeInTheDocument()
  })

  it('handles tokens without onUpdateMapping callback', () => {
    // Should not throw when no callback provided
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    
    // This should not throw
    expect(() => {
      fireEvent.change(dropdown, { target: { value: 'typography' } })
    }).not.toThrow()
  })

  it('aria-expanded attribute updates correctly', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const toggle = screen.getByTestId('category-toggle-color')
    
    // Initially expanded
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    
    // Click to collapse
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    
    // Click to expand
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('dropdown has accessible label', () => {
    render(<TokenMappingStep tokens={mockTokens} />)
    
    const dropdown = screen.getByTestId('category-select-Color/Button/primary-bg')
    expect(dropdown).toHaveAttribute('aria-label', 'Category for primary-bg')
  })

  it('sorts categories with "other" last', () => {
    render(<TokenMappingStep tokens={mockTokensWithOther} />)
    
    // Get all category sections
    const categories = screen.getAllByTestId(/^category-[a-z]+$/)
    const categoryNames = categories.map(el => el.getAttribute('data-testid').replace('category-', ''))
    
    // "other" should be last
    expect(categoryNames[categoryNames.length - 1]).toBe('other')
  })
})

describe('TokenMappingStep - Verification Tests', () => {
  it('works with real-like parsed token data', () => {
    const realLikeTokens = [
      {
        name: 'white',
        category: 'color',
        subcategory: 'Bg',
        group_name: 'Color',
        value: { hex: '#FFFFFF', alpha: 1 },
        type: 'color',
        css_variable: '--color-bg-white',
        figma_variable_id: 'VariableID:1:100',
        alias_reference: null,
        path: 'Color/Bg/white',
        sort_order: 0,
      },
      {
        name: 'heading-lg',
        category: 'typography',
        subcategory: null,
        group_name: 'Font Size',
        value: { value: 48, unit: 'px' },
        type: 'number',
        css_variable: '--typography-heading-lg',
        figma_variable_id: 'VariableID:2:200',
        alias_reference: null,
        path: 'Font Size/heading-lg',
        sort_order: 0,
      },
    ]

    render(<TokenMappingStep tokens={realLikeTokens} />)
    
    expect(screen.getByTestId('token-mapping-step')).toBeInTheDocument()
    expect(screen.getByTestId('category-color')).toBeInTheDocument()
    expect(screen.getByTestId('category-typography')).toBeInTheDocument()
  })

  it('handles many tokens without performance issues', () => {
    // Generate 100+ tokens
    const manyTokens = Array.from({ length: 120 }, (_, i) => ({
      name: `token-${i}`,
      category: i % 2 === 0 ? 'color' : 'typography',
      subcategory: null,
      group_name: 'Test',
      value: { value: i },
      type: 'number',
      css_variable: `--test-token-${i}`,
      figma_variable_id: `var-${i}`,
      alias_reference: null,
      path: `Test/token-${i}`,
      sort_order: i,
    }))

    const startTime = performance.now()
    render(<TokenMappingStep tokens={manyTokens} />)
    const endTime = performance.now()
    
    // Should render in reasonable time (< 500ms)
    expect(endTime - startTime).toBeLessThan(500)
    
    // Should show correct counts
    expect(screen.getByTestId('summary-color')).toHaveTextContent('60')
    expect(screen.getByTestId('summary-typography')).toHaveTextContent('60')
  })
})

