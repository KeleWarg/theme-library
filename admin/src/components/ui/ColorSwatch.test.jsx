import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColorSwatch from './ColorSwatch'

describe('ColorSwatch', () => {
  const defaultProps = {
    name: 'bg-white',
    variable: '--color-bg-white',
    description: 'Primary background'
  }

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  it('renders token name', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('bg-white')).toBeInTheDocument()
  })

  it('renders CSS variable', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('--color-bg-white')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('Primary background')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<ColorSwatch name="bg-white" variable="--color-bg-white" />)
    expect(screen.queryByText('Primary background')).not.toBeInTheDocument()
  })

  it('copies to clipboard on click', async () => {
    render(<ColorSwatch {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('var(--color-bg-white)')
  })

  it('shows copied feedback', async () => {
    render(<ColorSwatch {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('hides copied feedback after delay', async () => {
    vi.useFakeTimers()
    render(<ColorSwatch {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    
    // Fast-forward time and flush pending state updates
    await vi.runAllTimersAsync()
    
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    
    vi.useRealTimers()
  })

  it('renders as a button element', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has a color preview section', () => {
    const { container } = render(<ColorSwatch {...defaultProps} />)
    // The button contains the color preview as its first child div
    const button = container.querySelector('button')
    const colorPreview = button.querySelector('div')
    expect(colorPreview).toBeInTheDocument()
    expect(colorPreview).toHaveStyle({ height: '48px' })
  })
})

