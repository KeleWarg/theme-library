import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Themes from './Themes'

describe('Themes', () => {
  it('renders the page heading', () => {
    render(<Themes />)
    expect(screen.getByRole('heading', { name: 'Themes' })).toBeInTheDocument()
  })
})

