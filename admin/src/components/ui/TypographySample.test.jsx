import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TypographySample from './TypographySample'

describe('TypographySample', () => {
  const defaultProps = {
    name: 'heading-lg',
    variable: '--font-size-heading-lg',
    value: '48px'
  }

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  it('renders sample text', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('The quick brown fox')).toBeInTheDocument()
  })

  it('renders custom sample text', () => {
    render(<TypographySample {...defaultProps} sampleText="Custom text" />)
    expect(screen.getByText('Custom text')).toBeInTheDocument()
  })

  it('applies font size from variable', () => {
    render(<TypographySample {...defaultProps} />)
    const sample = screen.getByText('The quick brown fox')
    expect(sample).toHaveStyle({ fontSize: 'var(--font-size-heading-lg)' })
  })

  it('shows token name', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('heading-lg')).toBeInTheDocument()
  })

  it('shows token value', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('48px')).toBeInTheDocument()
  })

  it('shows CSS variable', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('--font-size-heading-lg')).toBeInTheDocument()
  })

  it('copies to clipboard on click', async () => {
    render(<TypographySample {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('var(--font-size-heading-lg)')
  })

  it('shows copied feedback', async () => {
    render(<TypographySample {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('applies font weight from variable for weight tokens', () => {
    render(
      <TypographySample 
        name="bold" 
        variable="--font-weight-bold" 
        value="700" 
      />
    )
    const sample = screen.getByText('The quick brown fox')
    expect(sample).toHaveStyle({ fontWeight: 'var(--font-weight-bold)' })
  })

  it('applies line height from variable for line-height tokens', () => {
    render(
      <TypographySample 
        name="line-height-lg" 
        variable="--line-height-lg" 
        value="24px" 
      />
    )
    const sample = screen.getByText('The quick brown fox')
    expect(sample).toHaveStyle({ lineHeight: 'var(--line-height-lg)' })
  })

  it('renders as a button element', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})



