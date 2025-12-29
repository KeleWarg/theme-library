import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('applies pending variant styles', () => {
    render(<Badge variant="pending">Pending</Badge>)
    const badge = screen.getByText('Pending')
    expect(badge).toHaveStyle({ backgroundColor: '#FEF3C7', color: '#92400E' })
  })

  it('applies generated variant styles', () => {
    render(<Badge variant="generated">Generated</Badge>)
    const badge = screen.getByText('Generated')
    expect(badge).toHaveStyle({ backgroundColor: '#DBEAFE', color: '#1E40AF' })
  })

  it('applies approved variant styles', () => {
    render(<Badge variant="approved">Approved</Badge>)
    const badge = screen.getByText('Approved')
    expect(badge).toHaveStyle({ backgroundColor: '#D1FAE5', color: '#065F46' })
  })

  it('applies published variant styles', () => {
    render(<Badge variant="published">Published</Badge>)
    const badge = screen.getByText('Published')
    expect(badge).toHaveStyle({ backgroundColor: '#065F46', color: '#FFFFFF' })
  })

  it('applies draft variant styles', () => {
    render(<Badge variant="draft">Draft</Badge>)
    const badge = screen.getByText('Draft')
    expect(badge).toHaveStyle({ backgroundColor: '#F3F4F6', color: '#6B7280' })
  })

  it('applies manual variant styles', () => {
    render(<Badge variant="manual">Manual</Badge>)
    const badge = screen.getByText('Manual')
    expect(badge).toHaveStyle({ backgroundColor: '#EDE9FE', color: '#6D28D9' })
  })

  it('uses default variant when no variant provided', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveStyle({ backgroundColor: '#F3F4F6', color: '#374151' })
  })

  it('uses default variant when invalid variant provided', () => {
    render(<Badge variant="invalid">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge).toHaveStyle({ backgroundColor: '#F3F4F6', color: '#374151' })
  })

  it('renders with pill shape styling', () => {
    render(<Badge>Pill</Badge>)
    const badge = screen.getByText('Pill')
    expect(badge).toHaveStyle({ borderRadius: '9999px' })
  })
})

