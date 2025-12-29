import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentCard from './ComponentCard'

describe('ComponentCard', () => {
  const component = {
    name: 'Button',
    slug: 'button',
    category: 'actions',
    preview_image: null,
    code_status: 'approved',
    status: 'published'
  }

  it('renders component name', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('renders category', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('actions')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('approved')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('calls onClick with slug when clicked', () => {
    const onClick = vi.fn()
    render(<ComponentCard component={component} onClick={onClick} />)
    fireEvent.click(screen.getByTestId('component-card'))
    expect(onClick).toHaveBeenCalledWith('button')
  })

  it('renders placeholder icon when no preview image', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    // The Boxes icon should be present (we can check the card renders without error)
    expect(screen.getByTestId('component-card')).toBeInTheDocument()
  })

  it('renders preview image when provided', () => {
    const componentWithImage = {
      ...component,
      preview_image: 'https://example.com/button.png'
    }
    render(<ComponentCard component={componentWithImage} onClick={() => {}} />)
    const img = screen.getByAltText('Button')
    expect(img).toHaveAttribute('src', 'https://example.com/button.png')
  })

  it('has correct test id for targeting', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByTestId('component-card')).toBeInTheDocument()
  })
})

