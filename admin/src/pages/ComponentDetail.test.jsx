import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComponentDetail from './ComponentDetail'

describe('ComponentDetail', () => {
  it('renders the page heading', () => {
    render(<ComponentDetail />)
    expect(screen.getByRole('heading', { name: 'Component Detail' })).toBeInTheDocument()
  })
})

