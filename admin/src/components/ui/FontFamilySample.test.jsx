import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FontFamilySample from './FontFamilySample'

describe('FontFamilySample', () => {
  const defaultProps = {
    name: 'font-family-heading',
    variable: '--font-family-heading',
    value: 'Work Sans',
    fallback: 'Work Sans, system-ui, sans-serif',
    description: 'Sans-serif for headings'
  }

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  it('renders font family name', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('Work Sans')).toBeInTheDocument()
  })

  it('renders sample text', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('The quick brown fox jumps over the lazy dog')).toBeInTheDocument()
  })

  it('renders alphabet sample', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText(/ABCDEFGHIJKLMNOPQRSTUVWXYZ/)).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('Sans-serif for headings')).toBeInTheDocument()
  })

  it('renders token name', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('font-family-heading')).toBeInTheDocument()
  })

  it('renders fallback stack', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('Work Sans, system-ui, sans-serif')).toBeInTheDocument()
  })

  it('renders CSS variable', () => {
    render(<FontFamilySample {...defaultProps} />)
    expect(screen.getByText('--font-family-heading')).toBeInTheDocument()
  })

  it('copies to clipboard on click', async () => {
    render(<FontFamilySample {...defaultProps} />)
    fireEvent.click(screen.getByTestId('font-family-sample'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('var(--font-family-heading)')
  })

  it('shows copied feedback', async () => {
    render(<FontFamilySample {...defaultProps} />)
    fireEvent.click(screen.getByTestId('font-family-sample'))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('renders without description', () => {
    const { description, ...propsWithoutDesc } = defaultProps
    render(<FontFamilySample {...propsWithoutDesc} />)
    expect(screen.queryByText('Sans-serif for headings')).not.toBeInTheDocument()
    expect(screen.getByText('Work Sans')).toBeInTheDocument()
  })
})





