import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PropsTable from './PropsTable'

describe('PropsTable', () => {
  const props = [
    { name: 'variant', type: 'string', default: 'primary', description: 'Button variant' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' },
  ]

  it('renders prop rows', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.getByText('variant')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('shows add button when not readOnly', () => {
    render(<PropsTable props={props} onChange={() => {}} readOnly={false} />)
    expect(screen.getByText('+ Add Prop')).toBeInTheDocument()
  })

  it('hides add button when readOnly', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.queryByText('+ Add Prop')).not.toBeInTheDocument()
  })

  it('calls onChange when prop added', () => {
    const onChange = vi.fn()
    render(<PropsTable props={props} onChange={onChange} readOnly={false} />)
    fireEvent.click(screen.getByText('+ Add Prop'))
    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith([
      ...props,
      { name: '', type: 'string', default: '', description: '' }
    ])
  })

  it('shows empty message when no props', () => {
    render(<PropsTable props={[]} readOnly={true} />)
    expect(screen.getByText('No props defined')).toBeInTheDocument()
  })

  it('renders type column', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.getByText('string')).toBeInTheDocument()
    expect(screen.getByText('boolean')).toBeInTheDocument()
  })

  it('renders description column', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.getByText('Button variant')).toBeInTheDocument()
    expect(screen.getByText('Disabled state')).toBeInTheDocument()
  })
})



