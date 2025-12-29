import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Tabs from './Tabs'

describe('Tabs', () => {
  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
  ]

  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="colors" onChange={() => {}} />)
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Spacing')).toBeInTheDocument()
  })

  it('calls onChange when tab clicked', () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} activeTab="colors" onChange={onChange} />)
    fireEvent.click(screen.getByText('Typography'))
    expect(onChange).toHaveBeenCalledWith('typography')
  })

  it('calls onChange with correct id for each tab', () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} activeTab="colors" onChange={onChange} />)
    
    fireEvent.click(screen.getByText('Spacing'))
    expect(onChange).toHaveBeenCalledWith('spacing')
    
    fireEvent.click(screen.getByText('Colors'))
    expect(onChange).toHaveBeenCalledWith('colors')
  })

  it('highlights active tab with different styling', () => {
    render(<Tabs tabs={tabs} activeTab="colors" onChange={() => {}} />)
    const activeTab = screen.getByText('Colors')
    const inactiveTab = screen.getByText('Typography')
    
    // Active tab should have semibold font weight
    expect(activeTab).toHaveStyle({ fontWeight: 'var(--font-weight-semibold, 600)' })
    // Inactive tab should have regular font weight
    expect(inactiveTab).toHaveStyle({ fontWeight: 'var(--font-weight-regular, 400)' })
  })

  it('renders tabs as buttons', () => {
    render(<Tabs tabs={tabs} activeTab="colors" onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('applies different border to active vs inactive tabs', () => {
    render(<Tabs tabs={tabs} activeTab="typography" onChange={() => {}} />)
    const activeTab = screen.getByText('Typography')
    const inactiveTab = screen.getByText('Colors')
    
    // Active tab should have visible border color
    expect(activeTab.style.borderBottom).toContain('var(--color-btn-primary-bg')
    // Inactive tab should have transparent border
    expect(inactiveTab.style.borderBottom).toContain('transparent')
  })

  it('handles single tab', () => {
    const singleTab = [{ id: 'only', label: 'Only Tab' }]
    render(<Tabs tabs={singleTab} activeTab="only" onChange={() => {}} />)
    expect(screen.getByText('Only Tab')).toBeInTheDocument()
  })

  it('handles empty tabs array', () => {
    const { container } = render(<Tabs tabs={[]} activeTab="" onChange={() => {}} />)
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(0)
  })
})

