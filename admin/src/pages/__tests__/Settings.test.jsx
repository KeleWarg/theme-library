/**
 * Settings Page Tests
 * Chunk 7.06 - Settings Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '../Settings'

// Mock the useComponents hook
vi.mock('../../hooks/useComponents', () => ({
  useComponents: () => ({
    components: [
      { id: '1', name: 'Button', status: 'published', jsx_code: 'export default Button', slug: 'button' },
      { id: '2', name: 'Card', status: 'published', jsx_code: 'export default Card', slug: 'card' },
      { id: '3', name: 'Input', status: 'pending_code', jsx_code: null, slug: 'input' },
      { id: '4', name: 'Modal', status: 'generated', jsx_code: 'export default Modal', slug: 'modal' },
    ],
    loading: false,
    error: null,
  }),
}))

// Mock isAIConfigured
vi.mock('../../lib/ai/generateCode', () => ({
  isAIConfigured: vi.fn(() => true),
}))

// Mock packageGenerator
vi.mock('../../lib/packageGenerator', () => ({
  downloadPackage: vi.fn(() => Promise.resolve({ componentCount: 2 })),
  generateLLMSTxt: vi.fn(() => 'LLMS.txt content'),
}))

// Mock componentSync
vi.mock('../../lib/componentSync', () => ({
  getRecentSyncs: vi.fn(() => []),
}))

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Export Section', () => {
    it('renders export package section', () => {
      render(<Settings />)
      
      expect(screen.getByText('Export Package')).toBeInTheDocument()
    })

    it('shows published components count', () => {
      render(<Settings />)
      
      // Should show 2 published components (Button and Card have status 'published' and jsx_code)
      expect(screen.getByText('2 published')).toBeInTheDocument()
    })

    it('renders package name input', () => {
      render(<Settings />)
      
      const packageNameInput = screen.getByPlaceholderText('@yourorg/design-system')
      expect(packageNameInput).toBeInTheDocument()
      expect(packageNameInput).toHaveValue('@yourorg/design-system')
    })

    it('renders version input', () => {
      render(<Settings />)
      
      const versionInput = screen.getByPlaceholderText('1.0.0')
      expect(versionInput).toBeInTheDocument()
      expect(versionInput).toHaveValue('1.0.0')
    })

    it('renders export button', () => {
      render(<Settings />)
      
      expect(screen.getByText('Export Package (.zip)')).toBeInTheDocument()
    })

    it('renders LLMS.txt download button', () => {
      render(<Settings />)
      
      expect(screen.getByText('Download LLMS.txt Only')).toBeInTheDocument()
    })

    it('shows published component names in preview', () => {
      render(<Settings />)
      
      expect(screen.getByText('Button')).toBeInTheDocument()
      expect(screen.getByText('Card')).toBeInTheDocument()
    })

    it('allows updating package name', () => {
      render(<Settings />)
      
      const packageNameInput = screen.getByPlaceholderText('@yourorg/design-system')
      fireEvent.change(packageNameInput, { target: { value: '@myorg/components' } })
      
      expect(packageNameInput).toHaveValue('@myorg/components')
    })

    it('allows updating version', () => {
      render(<Settings />)
      
      const versionInput = screen.getByPlaceholderText('1.0.0')
      fireEvent.change(versionInput, { target: { value: '2.0.0' } })
      
      expect(versionInput).toHaveValue('2.0.0')
    })
  })

  describe('AI Configuration Section', () => {
    it('renders AI configuration section', () => {
      render(<Settings />)
      
      expect(screen.getByText('AI Configuration')).toBeInTheDocument()
    })

    it('shows AI enabled status when configured', async () => {
      const { isAIConfigured } = await import('../../lib/ai/generateCode')
      isAIConfigured.mockReturnValue(true)
      
      render(<Settings />)
      
      expect(screen.getByText('AI Generation Enabled')).toBeInTheDocument()
    })

    it('shows AI not configured status when API key is missing', async () => {
      const { isAIConfigured } = await import('../../lib/ai/generateCode')
      isAIConfigured.mockReturnValue(false)
      
      render(<Settings />)
      
      expect(screen.getByText('AI Generation Not Configured')).toBeInTheDocument()
    })
  })

  describe('Figma Plugin Section', () => {
    it('renders Figma plugin section', () => {
      render(<Settings />)
      
      expect(screen.getByText('Figma Plugin')).toBeInTheDocument()
    })

    it('shows installation instructions', () => {
      render(<Settings />)
      
      expect(screen.getByText('Installation')).toBeInTheDocument()
    })

    it('shows usage instructions', () => {
      render(<Settings />)
      
      expect(screen.getByText('Usage')).toBeInTheDocument()
    })
  })

  describe('Package Contents Preview', () => {
    it('renders package contents preview', () => {
      render(<Settings />)
      
      expect(screen.getByText('Package Contents')).toBeInTheDocument()
    })

    it('shows package structure', () => {
      render(<Settings />)
      
      expect(screen.getByText('package.json')).toBeInTheDocument()
      expect(screen.getByText('README.md')).toBeInTheDocument()
    })
  })
})

describe('Settings Page - No Published Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Override the mock to return no published components
    vi.doMock('../../hooks/useComponents', () => ({
      useComponents: () => ({
        components: [
          { id: '1', name: 'Input', status: 'pending_code', jsx_code: null, slug: 'input' },
        ],
        loading: false,
        error: null,
      }),
    }))
  })

  it('disables export button when no published components', async () => {
    // Re-import to get fresh mock
    vi.resetModules()
    
    vi.doMock('../../hooks/useComponents', () => ({
      useComponents: () => ({
        components: [],
        loading: false,
        error: null,
      }),
    }))
    
    vi.doMock('../../lib/ai/generateCode', () => ({
      isAIConfigured: vi.fn(() => true),
    }))
    
    vi.doMock('../../lib/packageGenerator', () => ({
      downloadPackage: vi.fn(),
      generateLLMSTxt: vi.fn(),
    }))
    
    vi.doMock('../../lib/componentSync', () => ({
      getRecentSyncs: vi.fn(() => []),
    }))
    
    const { default: SettingsPage } = await import('../Settings')
    render(<SettingsPage />)
    
    const exportButton = screen.getByText('Export Package (.zip)')
    expect(exportButton.closest('button')).toBeDisabled()
  })
})

