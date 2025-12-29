import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

// Mock useComponents hook
vi.mock('../hooks/useComponents', () => ({
  useComponents: () => ({
    components: [
      { slug: 'button', name: 'Button', status: 'published', code_status: 'approved', jsx_code: 'code', category: 'ui' },
      { slug: 'card', name: 'Card', status: 'draft', code_status: 'generated', jsx_code: 'code', category: 'layout' },
      { slug: 'input', name: 'Input', status: 'draft', code_status: 'pending', category: 'forms' },
    ],
    loading: false,
    error: null
  })
}))

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  it('renders welcome heading', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('renders stats cards', () => {
    renderDashboard()
    expect(screen.getByText('Total Components')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Ready for Review')).toBeInTheDocument()
    expect(screen.getByText('Needs Code')).toBeInTheDocument()
  })

  it('renders correct total count', () => {
    renderDashboard()
    expect(screen.getByText('3')).toBeInTheDocument() // 3 total components
  })

  it('renders needs attention section', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Needs Attention' })).toBeInTheDocument()
  })

  it('renders quick actions section', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument()
  })

  it('renders component pipeline section', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Component Pipeline' })).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    renderDashboard()
    expect(screen.getByText('Browse Components')).toBeInTheDocument()
    expect(screen.getByText('View Foundations')).toBeInTheDocument()
    expect(screen.getByText('Export Package')).toBeInTheDocument()
  })

  it('shows components that need attention', () => {
    renderDashboard()
    expect(screen.getByText('Card')).toBeInTheDocument() // generated status
    expect(screen.getByText('Input')).toBeInTheDocument() // pending status
  })
})
