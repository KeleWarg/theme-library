import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders dashboard on root route', () => {
    render(<App />)
    // Dashboard appears in both header (h1) and page content (h2)
    const dashboardHeadings = screen.getAllByRole('heading', { name: 'Dashboard' })
    expect(dashboardHeadings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the sidebar navigation', () => {
    render(<App />)
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders theme dropdown in header', () => {
    render(<App />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})

