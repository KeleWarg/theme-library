import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Components from './Components'

// Mock the hooks
vi.mock('../hooks/useComponents', () => ({
  useComponents: () => ({
    components: [
      { name: 'Button', slug: 'button', category: 'actions', code_status: 'approved', status: 'published' },
      { name: 'Card', slug: 'card', category: 'layout', code_status: 'pending', status: 'draft' },
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Components', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <Components />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders page title', () => {
    renderPage()
    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders filter bar', () => {
    renderPage()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Search components...')).toBeInTheDocument()
  })

  it('renders component cards', () => {
    renderPage()
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
  })

  it('navigates to component detail on card click', () => {
    renderPage()
    fireEvent.click(screen.getByText('Button').closest('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/components/button')
  })

  it('allows typing in search field', () => {
    renderPage()
    const searchInput = screen.getByPlaceholderText('Search components...')
    fireEvent.change(searchInput, { target: { value: 'button' } })
    expect(searchInput.value).toBe('button')
  })

  it('displays component categories', () => {
    renderPage()
    expect(screen.getByText('actions')).toBeInTheDocument()
    expect(screen.getByText('layout')).toBeInTheDocument()
  })

  it('displays status badges', () => {
    renderPage()
    expect(screen.getByText('approved')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })
})
