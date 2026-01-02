import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Themes from './Themes'
import * as themeService from '../lib/themeService'

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock theme service
vi.mock('../lib/themeService', () => ({
  getThemes: vi.fn(),
}))

// Helper to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Themes Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.className = 'theme-health---sem'
    // Default mock: no DB themes (fallback to static)
    themeService.getThemes.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders page title', async () => {
      renderWithRouter(<Themes />)
      expect(screen.getByText('Themes')).toBeInTheDocument()
    })

    it('renders create button', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByTestId('create-theme-button')).toBeInTheDocument()
      })
    })

    it('renders description text', async () => {
      renderWithRouter(<Themes />)
      expect(screen.getByText(/Preview and apply different color themes/)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      // Make getThemes never resolve to keep loading state
      themeService.getThemes.mockReturnValue(new Promise(() => {}))
      renderWithRouter(<Themes />)
      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.getByText('Loading themes...')).toBeInTheDocument()
    })
  })

  describe('Static Themes (Fallback)', () => {
    beforeEach(() => {
      themeService.getThemes.mockResolvedValue([])
    })

    it('renders all static theme cards', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('Health SEM')).toBeInTheDocument()
        expect(screen.getByText('Home SEM')).toBeInTheDocument()
        expect(screen.getByText('LLM')).toBeInTheDocument()
        expect(screen.getByText('ForbesMedia SEO')).toBeInTheDocument()
        expect(screen.getByText('Compare Coverage')).toBeInTheDocument()
      })
    })

    it('renders 5 static theme cards', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        const themeCards = screen.getAllByTestId('theme-card')
        expect(themeCards).toHaveLength(5)
      })
    })

    it('shows active badge on current theme', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
        const healthCard = screen.getByText('Health SEM').closest('[data-testid="theme-card"]')
        expect(healthCard).toContainElement(screen.getByText('Active'))
      })
    })
  })

  describe('Database Themes', () => {
    const mockDbThemes = [
      {
        id: 'db-theme-1',
        name: 'Custom Theme',
        slug: 'theme-custom',
        description: 'A custom theme from DB',
        status: 'draft',
        source: 'manual',
        theme_tokens: [{ count: 25 }],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    it('loads themes from database', async () => {
      themeService.getThemes.mockResolvedValue(mockDbThemes)
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(themeService.getThemes).toHaveBeenCalled()
      })
    })

    it('shows DB themes alongside static themes', async () => {
      themeService.getThemes.mockResolvedValue(mockDbThemes)
      renderWithRouter(<Themes />)
      await waitFor(() => {
        // Static themes
        expect(screen.getByText('Health SEM')).toBeInTheDocument()
        // DB theme
        expect(screen.getByText('Custom Theme')).toBeInTheDocument()
      })
    })

    it('filters out duplicate slugs from DB themes', async () => {
      const themesWithDuplicate = [
        ...mockDbThemes,
        {
          id: 'dup-1',
          name: 'Health SEM Duplicate',
          slug: 'theme-health---sem', // Same slug as static
          theme_tokens: [{ count: 10 }],
        },
      ]
      themeService.getThemes.mockResolvedValue(themesWithDuplicate)
      renderWithRouter(<Themes />)
      await waitFor(() => {
        // Should only show one Health SEM (the static one)
        const healthCards = screen.getAllByText('Health SEM')
        expect(healthCards).toHaveLength(1)
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error message when DB load fails', async () => {
      themeService.getThemes.mockRejectedValue(new Error('Database error'))
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText(/Could not load themes from database/)).toBeInTheDocument()
      })
    })

    it('still shows static themes on error', async () => {
      themeService.getThemes.mockRejectedValue(new Error('Database error'))
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('Health SEM')).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      themeService.getThemes.mockRejectedValue(new Error('Database error'))
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
    })

    it('retries loading when retry clicked', async () => {
      themeService.getThemes.mockRejectedValueOnce(new Error('Database error'))
      themeService.getThemes.mockResolvedValueOnce([])
      renderWithRouter(<Themes />)
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Retry'))
      
      await waitFor(() => {
        expect(themeService.getThemes).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Source Modal', () => {
    it('opens source modal when Create Theme clicked', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByTestId('create-theme-button')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('create-theme-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('theme-source-modal')).toBeInTheDocument()
      })
    })

    it('closes source modal when close button clicked', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-theme-button'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('theme-source-modal')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('close-button'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('theme-source-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Import Wizard', () => {
    it('opens import wizard when import option selected', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-theme-button'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('import-option')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('import-option'))
      
      await waitFor(() => {
        expect(screen.getByTestId('import-wizard')).toBeInTheDocument()
      })
    })

    it('closes source modal when import selected', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-theme-button'))
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('import-option'))
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('theme-source-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Create Wizard', () => {
    it('opens create wizard when create option selected', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-theme-button'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('create-option')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('create-option'))
      
      await waitFor(() => {
        expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
      })
    })

    it('closes source modal when create selected', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-theme-button'))
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('create-option'))
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('theme-source-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Theme Actions', () => {
    beforeEach(() => {
      themeService.getThemes.mockResolvedValue([])
    })

    it('opens preview modal when Preview clicked', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        const previewButtons = screen.getAllByText('Preview')
        fireEvent.click(previewButtons[0])
      })
      
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
    })

    it('closes preview modal when overlay clicked', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        const previewButtons = screen.getAllByText('Preview')
        fireEvent.click(previewButtons[0])
      })
      
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('modal-overlay'))
      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument()
    })

    it('changes active theme when Apply clicked', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('LLM')).toBeInTheDocument()
      })
      
      const llmCard = screen.getByText('LLM').closest('[data-testid="theme-card"]')
      const applyButton = llmCard.querySelector('button:last-child')
      fireEvent.click(applyButton)
      
      expect(document.documentElement.className).toBe('theme-llm')
    })

    it('persists theme to localStorage', async () => {
      renderWithRouter(<Themes />)
      await waitFor(() => {
        expect(screen.getByText('LLM')).toBeInTheDocument()
      })
      
      const llmCard = screen.getByText('LLM').closest('[data-testid="theme-card"]')
      const applyButton = llmCard.querySelector('button:last-child')
      fireEvent.click(applyButton)
      
      expect(localStorage.getItem('design-system-theme')).toBe('theme-llm')
    })
  })
})
