import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ComponentDetail from './ComponentDetail'

vi.mock('../hooks/useComponent', () => ({
  useComponent: () => ({
    component: {
      id: '1',
      name: 'Button',
      slug: 'button',
      description: 'A button component',
      category: 'actions',
      code_status: 'approved',
      status: 'published',
      jsx_code: 'function Button() { return <button>Test</button> }',
      props: [{ name: 'variant', type: 'string', default: 'primary', description: 'Variant' }],
      variants: ['primary', 'secondary', 'ghost'],
      linked_tokens: ['btn-primary-bg', 'btn-primary-text'],
    },
    loading: false,
    error: null,
    update: vi.fn(),
  })
}))

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'theme-health-sem', setTheme: vi.fn() })
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }) => <textarea data-testid="code-editor" defaultValue={value} readOnly />
}))

describe('ComponentDetail', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/components/button']}>
        <Routes>
          <Route path="/components/:slug" element={<ComponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders component name', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
  })

  it('renders component description', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('A button component')).toBeInTheDocument()
    })
  })

  it('renders tabs', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Figma')).toBeInTheDocument()
      expect(screen.getByText('Code')).toBeInTheDocument()
      expect(screen.getByText('Props')).toBeInTheDocument()
    })
  })

  it('renders save button', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  it('renders live preview section', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })
  })

  it('renders back button', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Back to Components')).toBeInTheDocument()
    })
  })

  it('renders status badges', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('approved')).toBeInTheDocument()
      expect(screen.getByText('published')).toBeInTheDocument()
    })
  })

  it('renders category', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('• actions')).toBeInTheDocument()
    })
  })

  it('renders code editor', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('code-editor')).toBeInTheDocument()
    })
  })

  it('renders preview theme selector', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Preview Theme')).toBeInTheDocument()
    })
  })
})
