import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ComponentDetail from '../ComponentDetail'

// Store mock functions at module level
const mockGenerateComponentCode = vi.fn()
const mockUpdate = vi.fn()

// Mock the AI generation module
vi.mock('../../lib/ai/generateCode', () => ({
  generateComponentCode: (...args) => mockGenerateComponentCode(...args),
  isAIConfigured: () => true,
}))

// Mock the AI config for GenerateButton
vi.mock('../../lib/ai/config', () => ({
  isAIConfigured: () => true,
  AI_CONFIG: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
  },
}))

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'theme-health-sem', setTheme: vi.fn() })
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }) => <textarea data-testid="code-editor" defaultValue={value} readOnly />
}))

// Component mock with configurable data
let mockComponentData = null

vi.mock('../../hooks/useComponent', () => ({
  useComponent: () => ({
    component: mockComponentData,
    loading: false,
    error: null,
    update: mockUpdate,
  })
}))

describe('ComponentDetail AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateComponentCode.mockReset()
    mockUpdate.mockResolvedValue({})
  })

  afterEach(() => {
    mockComponentData = null
  })

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/components/button']}>
        <Routes>
          <Route path="/components/:slug" element={<ComponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
  }

  describe('with no existing code', () => {
    beforeEach(() => {
      mockComponentData = {
        id: '1',
        name: 'Button',
        slug: 'button',
        description: 'A button component',
        category: 'actions',
        code_status: 'pending_code',
        status: 'active',
        jsx_code: '',
        props: [],
        variants: ['primary', 'secondary'],
        linked_tokens: ['btn-primary-bg'],
      }
    })

    it('renders Generate button when no code exists', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Generate with AI')).toBeInTheDocument()
    })

    it('shows empty state message when no code exists', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('No code yet')).toBeInTheDocument()
      })
      
      expect(screen.getByText(/Click "Generate with AI"/)).toBeInTheDocument()
    })

    it('calls generateComponentCode when Generate button is clicked', async () => {
      mockGenerateComponentCode.mockResolvedValue({
        jsx_code: 'function Button() { return <button>Test</button> }',
        props: [{ name: 'variant', type: 'string', default: 'primary' }],
      })

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(mockGenerateComponentCode).toHaveBeenCalledTimes(1)
      })
      
      expect(mockGenerateComponentCode).toHaveBeenCalledWith(
        expect.objectContaining({
          component: expect.objectContaining({ name: 'Button' }),
        })
      )
    })

    it('updates component after successful generation', async () => {
      mockGenerateComponentCode.mockResolvedValue({
        jsx_code: 'function Button() { return <button>Test</button> }',
        props: [{ name: 'variant', type: 'string', default: 'primary' }],
      })

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            jsx_code: 'function Button() { return <button>Test</button> }',
            code_status: 'generated',
          })
        )
      })
    })

    it('displays error message when generation fails', async () => {
      mockGenerateComponentCode.mockRejectedValue(new Error('API key not configured'))

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(screen.getByText(/Generation failed:/)).toBeInTheDocument()
      })
      
      expect(screen.getByText(/API key not configured/)).toBeInTheDocument()
    })

    it('shows loading state during generation', async () => {
      let resolveGeneration
      mockGenerateComponentCode.mockImplementation(() => new Promise(resolve => {
        resolveGeneration = resolve
      }))

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('generate-button')).toBeDisabled()

      // Cleanup
      resolveGeneration({ jsx_code: '', props: [] })
    })
  })

  describe('with existing code', () => {
    beforeEach(() => {
      mockComponentData = {
        id: '1',
        name: 'Button',
        slug: 'button',
        description: 'A button component',
        category: 'actions',
        code_status: 'generated',
        status: 'active',
        jsx_code: 'function Button() { return <button>Existing</button> }',
        props: [{ name: 'variant', type: 'string', default: 'primary' }],
        variants: ['primary', 'secondary'],
        linked_tokens: ['btn-primary-bg'],
      }
    })

    it('renders Regenerate button when code exists', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
    })

    it('opens feedback modal when Regenerate is clicked', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Regenerate with AI'))

      await waitFor(() => {
        expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument()
      })
      
      expect(screen.getByPlaceholderText(/Add a focus ring/)).toBeInTheDocument()
    })

    it('closes feedback modal when Cancel is clicked', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Regenerate with AI'))

      await waitFor(() => {
        expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Cancel'))

      await waitFor(() => {
        expect(screen.queryByText('Regenerate with Feedback')).not.toBeInTheDocument()
      })
    })

    it('closes modal on overlay click', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Regenerate with AI'))

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('modal-overlay'))

      await waitFor(() => {
        expect(screen.queryByText('Regenerate with Feedback')).not.toBeInTheDocument()
      })
    })

    it('submits feedback and regenerates code', async () => {
      mockGenerateComponentCode.mockResolvedValue({
        jsx_code: 'function Button() { return <button>Updated</button> }',
        props: [{ name: 'variant', type: 'string', default: 'primary' }],
      })

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Regenerate with AI'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Add a focus ring/)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/Add a focus ring/)
      fireEvent.change(textarea, { target: { value: 'Add hover effects' } })
      
      fireEvent.click(screen.getByText('Regenerate'))

      await waitFor(() => {
        expect(mockGenerateComponentCode).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback: 'Add hover effects',
          })
        )
      })
    })

    it('shows code editor with existing code', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument()
      })
    })

    it('displays Copy button for existing code', async () => {
      renderPage()
      
      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })
    })
  })

  describe('error recovery', () => {
    beforeEach(() => {
      mockComponentData = {
        id: '1',
        name: 'Button',
        slug: 'button',
        description: 'A button component',
        category: 'actions',
        code_status: 'pending_code',
        status: 'active',
        jsx_code: '',
        props: [],
        variants: [],
        linked_tokens: [],
      }
    })

    it('clears error on new generation attempt', async () => {
      // First attempt fails
      mockGenerateComponentCode.mockRejectedValueOnce(new Error('Network error'))

      renderPage()
      
      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(screen.getByText(/Generation failed:/)).toBeInTheDocument()
      })

      // Second attempt succeeds
      mockGenerateComponentCode.mockResolvedValueOnce({
        jsx_code: 'function Button() { return <button>Success</button> }',
        props: [],
      })

      fireEvent.click(screen.getByTestId('generate-button'))

      // Error should be cleared immediately
      await waitFor(() => {
        expect(screen.queryByText(/Network error/)).not.toBeInTheDocument()
      })
    })
  })
})
