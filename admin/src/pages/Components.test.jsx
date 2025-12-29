import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Components from './Components'

describe('Components', () => {
  it('renders the page heading', () => {
    render(<Components />)
    expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
  })
})

