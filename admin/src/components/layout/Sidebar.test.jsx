import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const renderSidebar = () => {
    return render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    )
  }

  it('renders the logo', () => {
    renderSidebar()
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders all navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('Themes')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('navigation links have correct hrefs', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Components').closest('a')).toHaveAttribute('href', '/components')
    expect(screen.getByText('Foundations').closest('a')).toHaveAttribute('href', '/foundations')
    expect(screen.getByText('Themes').closest('a')).toHaveAttribute('href', '/themes')
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings')
  })
})





