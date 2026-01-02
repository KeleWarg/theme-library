import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PreviewPanel from './PreviewPanel'

describe('PreviewPanel', () => {
  // Mock tokens for testing
  const mockTokens = [
    {
      id: '1',
      name: 'primary-bg',
      css_variable: '--color-btn-primary-bg',
      value: { hex: '#657E79' },
      category: 'color',
    },
    {
      id: '2',
      name: 'body-text',
      css_variable: '--color-fg-body',
      value: '#383C43',
      category: 'color',
    },
    {
      id: '3',
      name: 'font-size-md',
      css_variable: '--font-size-body-md',
      value: { value: 16, unit: 'px' },
      category: 'typography',
    },
    {
      id: '4',
      name: 'heading-color',
      css_variable: '--color-fg-heading',
      value: { r: 30, g: 33, b: 37 },
      category: 'color',
    },
  ]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders preview panel', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument()
  })

  it('renders preview container', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    expect(screen.getByTestId('preview-container')).toBeInTheDocument()
  })

  it('shows preview components when tokens are provided', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    // Should render the ComponentShowcase
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Buttons')).toBeInTheDocument()
  })

  it('shows empty state when no tokens are provided', () => {
    render(<PreviewPanel tokens={[]} />)
    expect(screen.getByTestId('empty-preview')).toBeInTheDocument()
    expect(screen.getByText('No tokens to preview')).toBeInTheDocument()
  })

  it('renders viewport toggle', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    expect(screen.getByTestId('viewport-toggle')).toBeInTheDocument()
  })

  it('changes viewport on toggle click', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    
    // Initially desktop (1440px)
    expect(screen.getByText(/1440px/)).toBeInTheDocument()
    
    // Click tablet button
    const tabletButton = screen.getByTitle('Tablet (768px)')
    fireEvent.click(tabletButton)
    
    expect(screen.getByText(/768px/)).toBeInTheDocument()
    
    // Click mobile button
    const mobileButton = screen.getByTitle('Mobile (375px)')
    fireEvent.click(mobileButton)
    
    expect(screen.getByText(/375px/)).toBeInTheDocument()
  })

  it('renders color mode toggle', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    expect(screen.getByTestId('color-mode-toggle')).toBeInTheDocument()
  })

  it('toggles color mode on click', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    
    const toggleButton = screen.getByTestId('color-mode-toggle')
    
    // Initially light mode - button should show moon icon (title says "Switch to dark mode")
    expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode')
    
    // Click to switch to dark mode
    fireEvent.click(toggleButton)
    
    expect(toggleButton).toHaveAttribute('title', 'Switch to light mode')
  })

  it('shows token count', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    expect(screen.getByText('4 tokens applied')).toBeInTheDocument()
  })

  it('shows zero token count when empty', () => {
    render(<PreviewPanel tokens={[]} />)
    expect(screen.getByText('0 tokens applied')).toBeInTheDocument()
  })

  it('renders refresh button when onRefresh is provided', () => {
    const onRefresh = vi.fn()
    render(<PreviewPanel tokens={mockTokens} onRefresh={onRefresh} />)
    
    expect(screen.getByTestId('refresh-preview')).toBeInTheDocument()
  })

  it('does not render refresh button when onRefresh is not provided', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    
    expect(screen.queryByTestId('refresh-preview')).not.toBeInTheDocument()
  })

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn()
    render(<PreviewPanel tokens={mockTokens} onRefresh={onRefresh} />)
    
    const refreshButton = screen.getByTestId('refresh-preview')
    fireEvent.click(refreshButton)
    
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('applies CSS variables to preview container', async () => {
    render(<PreviewPanel tokens={mockTokens} />)
    
    const container = screen.getByTestId('preview-container')
    
    // Fast-forward debounce timer
    vi.advanceTimersByTime(200)
    
    // Check that custom properties are applied
    expect(container.style.getPropertyValue('--color-btn-primary-bg')).toBe('#657E79')
    expect(container.style.getPropertyValue('--color-fg-body')).toBe('#383C43')
    expect(container.style.getPropertyValue('--font-size-body-md')).toBe('16px')
  })

  it('handles color values with RGB format', async () => {
    const rgbTokens = [
      {
        id: '1',
        name: 'rgb-color',
        css_variable: '--test-rgb-color',
        value: { r: 100, g: 150, b: 200 },
        category: 'color',
      },
    ]
    
    render(<PreviewPanel tokens={rgbTokens} />)
    
    const container = screen.getByTestId('preview-container')
    
    vi.advanceTimersByTime(200)
    
    expect(container.style.getPropertyValue('--test-rgb-color')).toBe('rgb(100, 150, 200)')
  })

  it('handles color values with RGBA format', async () => {
    const rgbaTokens = [
      {
        id: '1',
        name: 'rgba-color',
        css_variable: '--test-rgba-color',
        value: { r: 100, g: 150, b: 200, a: 0.5 },
        category: 'color',
      },
    ]
    
    render(<PreviewPanel tokens={rgbaTokens} />)
    
    const container = screen.getByTestId('preview-container')
    
    vi.advanceTimersByTime(200)
    
    expect(container.style.getPropertyValue('--test-rgba-color')).toBe('rgba(100, 150, 200, 0.5)')
  })

  it('updates when tokens change', async () => {
    const { rerender } = render(<PreviewPanel tokens={mockTokens} />)
    
    const container = screen.getByTestId('preview-container')
    
    vi.advanceTimersByTime(200)
    
    // Initial value
    expect(container.style.getPropertyValue('--color-btn-primary-bg')).toBe('#657E79')
    
    // Update tokens
    const updatedTokens = [
      {
        id: '1',
        name: 'primary-bg',
        css_variable: '--color-btn-primary-bg',
        value: { hex: '#FF0000' },
        category: 'color',
      },
    ]
    
    rerender(<PreviewPanel tokens={updatedTokens} />)
    
    vi.advanceTimersByTime(200)
    
    // Updated value
    expect(container.style.getPropertyValue('--color-btn-primary-bg')).toBe('#FF0000')
  })

  it('changes preview container width based on viewport', () => {
    render(<PreviewPanel tokens={mockTokens} />)
    
    // Switch to tablet
    fireEvent.click(screen.getByTitle('Tablet (768px)'))
    
    const container = screen.getByTestId('preview-container')
    expect(container.style.width).toBe('768px')
    
    // Switch to mobile
    fireEvent.click(screen.getByTitle('Mobile (375px)'))
    
    expect(container.style.width).toBe('375px')
  })
})

