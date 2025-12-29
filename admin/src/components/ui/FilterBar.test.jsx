import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('renders all filter options', () => {
    render(<FilterBar activeFilter="all" onChange={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Generated')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('calls onChange when filter clicked', () => {
    const onChange = vi.fn()
    render(<FilterBar activeFilter="all" onChange={onChange} />)
    fireEvent.click(screen.getByText('Pending'))
    expect(onChange).toHaveBeenCalledWith('pending')
  })

  it('marks active filter with data-active attribute', () => {
    render(<FilterBar activeFilter="approved" onChange={() => {}} />)
    expect(screen.getByText('Approved')).toHaveAttribute('data-active', 'true')
    expect(screen.getByText('All')).toHaveAttribute('data-active', 'false')
  })

  it('calls onChange with correct id for each filter', () => {
    const onChange = vi.fn()
    render(<FilterBar activeFilter="all" onChange={onChange} />)
    
    fireEvent.click(screen.getByText('Generated'))
    expect(onChange).toHaveBeenCalledWith('generated')
    
    fireEvent.click(screen.getByText('Approved'))
    expect(onChange).toHaveBeenCalledWith('approved')
    
    fireEvent.click(screen.getByText('Published'))
    expect(onChange).toHaveBeenCalledWith('published')
  })
})

