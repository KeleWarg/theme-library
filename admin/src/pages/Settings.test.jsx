import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Settings from './Settings'

describe('Settings', () => {
  it('renders the page heading', () => {
    render(<Settings />)
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})

