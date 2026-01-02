import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ThemeDetailsStep from './ThemeDetailsStep'

// Mock the theme service
vi.mock('../../../lib/themeService', () => ({
  generateSlug: vi.fn((name) => 'theme-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
  isSlugAvailable: vi.fn(() => Promise.resolve(true)),
}))

describe('ThemeDetailsStep', () => {
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    expect(screen.getByTestId('theme-details-step')).toBeInTheDocument()
    expect(screen.getByTestId('theme-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('theme-slug-input')).toBeInTheDocument()
    expect(screen.getByTestId('theme-description-input')).toBeInTheDocument()
  })

  it('displays initial values from props', () => {
    const details = {
      name: 'Test Theme',
      slug: 'theme-test',
      description: 'A test theme',
    }
    render(<ThemeDetailsStep details={details} onUpdate={mockOnUpdate} />)
    
    expect(screen.getByTestId('theme-name-input')).toHaveValue('Test Theme')
    expect(screen.getByTestId('theme-slug-input')).toHaveValue('theme-test')
    expect(screen.getByTestId('theme-description-input')).toHaveValue('A test theme')
  })

  it('auto-generates slug from name', async () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const nameInput = screen.getByTestId('theme-name-input')
    fireEvent.change(nameInput, { target: { value: 'My New Theme' } })
    
    await waitFor(() => {
      expect(screen.getByTestId('theme-slug-input')).toHaveValue('theme-my-new-theme')
    })
  })

  it('allows manual slug editing', async () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const slugInput = screen.getByTestId('theme-slug-input')
    fireEvent.change(slugInput, { target: { value: 'custom-slug' } })
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('custom-slug')
    })

    // Name change should not override manually edited slug
    const nameInput = screen.getByTestId('theme-name-input')
    fireEvent.change(nameInput, { target: { value: 'Different Name' } })
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('custom-slug')
    })
  })

  it('sanitizes slug input to URL-safe format', async () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const slugInput = screen.getByTestId('theme-slug-input')
    fireEvent.change(slugInput, { target: { value: 'My Theme 123!' } })
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('my-theme-123-')
    })
  })

  it('calls onUpdate when fields change', async () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const nameInput = screen.getByTestId('theme-name-input')
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled()
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
      expect(lastCall.name).toBe('Updated Name')
    })
  })

  it('shows slug availability status', async () => {
    const { isSlugAvailable } = await import('../../../lib/themeService')
    isSlugAvailable.mockResolvedValue(true)
    
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const slugInput = screen.getByTestId('theme-slug-input')
    fireEvent.change(slugInput, { target: { value: 'available-slug' } })
    
    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument()
    })
  })

  it('shows error when slug is taken', async () => {
    const { isSlugAvailable } = await import('../../../lib/themeService')
    isSlugAvailable.mockResolvedValue(false)
    
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    const slugInput = screen.getByTestId('theme-slug-input')
    fireEvent.change(slugInput, { target: { value: 'taken-slug' } })
    
    await waitFor(() => {
      expect(screen.getByText('Already taken')).toBeInTheDocument()
    })
  })

  it('validates against existing themes when Supabase unavailable', async () => {
    const { isSlugAvailable } = await import('../../../lib/themeService')
    isSlugAvailable.mockRejectedValue(new Error('Supabase not configured'))
    
    const existingThemes = [{ slug: 'existing-theme' }]
    render(
      <ThemeDetailsStep 
        details={{}} 
        onUpdate={mockOnUpdate} 
        existingThemes={existingThemes}
      />
    )
    
    const slugInput = screen.getByTestId('theme-slug-input')
    fireEvent.change(slugInput, { target: { value: 'existing-theme' } })
    
    await waitFor(() => {
      expect(screen.getByText('Already taken')).toBeInTheDocument()
    })
  })

  it('marks form as invalid when name is empty', async () => {
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
      expect(lastCall.isValid).toBe(false)
    })
  })

  it('marks form as valid when all required fields are filled', async () => {
    const { isSlugAvailable } = await import('../../../lib/themeService')
    isSlugAvailable.mockResolvedValue(true)
    
    render(<ThemeDetailsStep details={{}} onUpdate={mockOnUpdate} />)
    
    fireEvent.change(screen.getByTestId('theme-name-input'), { target: { value: 'Valid Name' } })
    
    await waitFor(() => {
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
      expect(lastCall.isValid).toBe(true)
    })
  })
})

