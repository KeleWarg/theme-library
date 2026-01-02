import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

describe('Layout', () => {
  const renderLayout = (props = {}) => {
    return render(
      <BrowserRouter>
        <Layout pageTitle="Test Page" {...props}>
          <div data-testid="content">Page Content</div>
        </Layout>
      </BrowserRouter>
    )
  }

  it('renders sidebar', () => {
    renderLayout()
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders header with page title', () => {
    renderLayout()
    expect(screen.getByRole('heading', { name: 'Test Page' })).toBeInTheDocument()
  })

  it('renders children in main content area', () => {
    renderLayout()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })
})





