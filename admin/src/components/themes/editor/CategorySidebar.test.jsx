import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CategorySidebar, { CATEGORY_CONFIG } from './CategorySidebar'

describe('CategorySidebar', () => {
  const defaultProps = {
    tokenCounts: {
      color: 24,
      typography: 12,
      spacing: 8,
      shadow: 4,
      radius: 6,
      grid: 4,
      other: 2,
    },
    activeCategory: 'color',
    onSelectCategory: vi.fn(),
    categoriesWithChanges: [],
  }

  it('renders the sidebar', () => {
    render(<CategorySidebar {...defaultProps} />)
    expect(screen.getByTestId('category-sidebar')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('renders all categories with tokens', () => {
    render(<CategorySidebar {...defaultProps} />)
    
    expect(screen.getByTestId('category-color')).toBeInTheDocument()
    expect(screen.getByTestId('category-typography')).toBeInTheDocument()
    expect(screen.getByTestId('category-spacing')).toBeInTheDocument()
    expect(screen.getByTestId('category-shadow')).toBeInTheDocument()
    expect(screen.getByTestId('category-radius')).toBeInTheDocument()
    expect(screen.getByTestId('category-grid')).toBeInTheDocument()
    expect(screen.getByTestId('category-other')).toBeInTheDocument()
  })

  it('shows correct token counts', () => {
    render(<CategorySidebar {...defaultProps} />)
    
    expect(screen.getByTestId('count-color')).toHaveTextContent('24')
    expect(screen.getByTestId('count-typography')).toHaveTextContent('12')
    expect(screen.getByTestId('count-spacing')).toHaveTextContent('8')
    expect(screen.getByTestId('count-shadow')).toHaveTextContent('4')
    expect(screen.getByTestId('count-radius')).toHaveTextContent('6')
    expect(screen.getByTestId('count-grid')).toHaveTextContent('4')
    expect(screen.getByTestId('count-other')).toHaveTextContent('2')
  })

  it('highlights active category', () => {
    render(<CategorySidebar {...defaultProps} activeCategory="typography" />)
    
    const typographyButton = screen.getByTestId('category-typography')
    // Active category should have the active indicator
    expect(typographyButton.querySelector('[data-testid="active-indicator"]')).toBeInTheDocument()
    
    // Non-active categories should not have the indicator
    const colorButton = screen.getByTestId('category-color')
    expect(colorButton.querySelector('[data-testid="active-indicator"]')).not.toBeInTheDocument()
  })

  it('calls onSelectCategory on click', () => {
    const onSelectCategory = vi.fn()
    render(<CategorySidebar {...defaultProps} onSelectCategory={onSelectCategory} />)
    
    fireEvent.click(screen.getByTestId('category-typography'))
    expect(onSelectCategory).toHaveBeenCalledWith('typography')
    
    fireEvent.click(screen.getByTestId('category-spacing'))
    expect(onSelectCategory).toHaveBeenCalledWith('spacing')
  })

  it('shows unsaved changes indicator for specified categories', () => {
    render(
      <CategorySidebar 
        {...defaultProps} 
        categoriesWithChanges={['color', 'spacing']} 
      />
    )
    
    expect(screen.getByTestId('changes-color')).toBeInTheDocument()
    expect(screen.getByTestId('changes-spacing')).toBeInTheDocument()
    expect(screen.queryByTestId('changes-typography')).not.toBeInTheDocument()
    expect(screen.queryByTestId('changes-shadow')).not.toBeInTheDocument()
  })

  it('only displays categories with tokens', () => {
    render(
      <CategorySidebar
        {...defaultProps}
        tokenCounts={{
          color: 10,
          typography: 5,
          // spacing, shadow, radius, grid, other have 0 or undefined
        }}
      />
    )
    
    expect(screen.getByTestId('category-color')).toBeInTheDocument()
    expect(screen.getByTestId('category-typography')).toBeInTheDocument()
    expect(screen.queryByTestId('category-spacing')).not.toBeInTheDocument()
    expect(screen.queryByTestId('category-shadow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('category-radius')).not.toBeInTheDocument()
    expect(screen.queryByTestId('category-grid')).not.toBeInTheDocument()
    expect(screen.queryByTestId('category-other')).not.toBeInTheDocument()
  })

  it('handles empty categories gracefully', () => {
    render(
      <CategorySidebar
        {...defaultProps}
        tokenCounts={{}}
      />
    )
    
    expect(screen.getByTestId('category-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('empty-categories')).toBeInTheDocument()
    expect(screen.getByText('No tokens available')).toBeInTheDocument()
  })

  it('maintains consistent category order (color first, other last)', () => {
    render(<CategorySidebar {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    
    // Verify order matches CATEGORY_CONFIG
    expect(buttons[0]).toHaveAttribute('data-testid', 'category-color')
    expect(buttons[1]).toHaveAttribute('data-testid', 'category-typography')
    expect(buttons[2]).toHaveAttribute('data-testid', 'category-spacing')
    expect(buttons[3]).toHaveAttribute('data-testid', 'category-shadow')
    expect(buttons[4]).toHaveAttribute('data-testid', 'category-radius')
    expect(buttons[5]).toHaveAttribute('data-testid', 'category-grid')
    expect(buttons[6]).toHaveAttribute('data-testid', 'category-other')
  })

  it('handles Set for categoriesWithChanges', () => {
    const changesSet = new Set(['color', 'shadow'])
    render(
      <CategorySidebar 
        {...defaultProps} 
        categoriesWithChanges={changesSet} 
      />
    )
    
    expect(screen.getByTestId('changes-color')).toBeInTheDocument()
    expect(screen.getByTestId('changes-shadow')).toBeInTheDocument()
    expect(screen.queryByTestId('changes-typography')).not.toBeInTheDocument()
  })

  it('renders with default props', () => {
    render(<CategorySidebar />)
    
    expect(screen.getByTestId('category-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('empty-categories')).toBeInTheDocument()
  })

  it('exports CATEGORY_CONFIG', () => {
    expect(CATEGORY_CONFIG).toBeDefined()
    expect(CATEGORY_CONFIG).toHaveLength(7)
    expect(CATEGORY_CONFIG[0].id).toBe('color')
    expect(CATEGORY_CONFIG[CATEGORY_CONFIG.length - 1].id).toBe('other')
  })
})

