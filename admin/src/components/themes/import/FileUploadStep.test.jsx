import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUploadStep from './FileUploadStep'

// Mock the tokenParser module
vi.mock('../../../lib/tokenParser', () => ({
  validateTokenFile: vi.fn(),
  parseTokenFile: vi.fn(),
}))

import { validateTokenFile, parseTokenFile } from '../../../lib/tokenParser'

describe('FileUploadStep', () => {
  const mockOnFileSelect = vi.fn()
  const mockOnClear = vi.fn()

  const defaultProps = {
    onFileSelect: mockOnFileSelect,
    selectedFile: null,
    onClear: mockOnClear,
  }

  // Helper to create a mock File
  const createMockFile = (name, content, type = 'application/json', size = null) => {
    const blob = new Blob([JSON.stringify(content)], { type })
    const file = new File([blob], name, { type })
    if (size !== null) {
      Object.defineProperty(file, 'size', { value: size })
    }
    return file
  }

  // Valid token content
  const validTokenContent = {
    Color: {
      Primary: {
        'blue-500': {
          $type: 'color',
          $value: { hex: '#3B82F6' },
        },
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    validateTokenFile.mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
      detected: { hasColor: true },
    })
    
    parseTokenFile.mockReturnValue({
      tokens: [
        { name: 'blue-500', category: 'color', value: { hex: '#3B82F6' } },
      ],
      errors: [],
      warnings: [],
      metadata: {
        totalTokens: 1,
        categories: { color: 1 },
      },
    })
  })

  describe('Upload Zone Rendering', () => {
    it('renders upload zone when no file selected', () => {
      render(<FileUploadStep {...defaultProps} />)
      
      expect(screen.getByTestId('file-upload-step')).toBeInTheDocument()
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument()
      expect(screen.getByText('Drag & drop your JSON file')).toBeInTheDocument()
      expect(screen.getByText('or click to browse')).toBeInTheDocument()
    })

    it('has accessible attributes on drop zone', () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const dropZone = screen.getByTestId('drop-zone')
      expect(dropZone).toHaveAttribute('role', 'button')
      expect(dropZone).toHaveAttribute('tabIndex', '0')
      expect(dropZone).toHaveAttribute('aria-label', 'Drop zone for JSON file upload')
    })

    it('renders hidden file input', () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const fileInput = screen.getByTestId('file-input')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', '.json')
      expect(fileInput).toHaveStyle({ display: 'none' })
    })
  })

  describe('File Preview Rendering', () => {
    it('renders file preview when file selected', () => {
      const selectedFile = {
        file: createMockFile('tokens.json', validTokenContent),
        name: 'tokens.json',
        size: 1024,
        content: validTokenContent,
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult: {
            tokens: [{ name: 'blue-500', category: 'color' }],
            metadata: { totalTokens: 1, categories: { color: 1 } },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      expect(screen.getByTestId('file-preview')).toBeInTheDocument()
      expect(screen.getByTestId('file-name')).toHaveTextContent('tokens.json')
      expect(screen.getByTestId('file-size')).toHaveTextContent('1.0 KB')
      expect(screen.getByTestId('token-count')).toHaveTextContent('1 tokens found')
      expect(screen.queryByTestId('drop-zone')).not.toBeInTheDocument()
    })

    it('shows validation warnings if present', () => {
      const selectedFile = {
        file: createMockFile('tokens.json', validTokenContent),
        name: 'tokens.json',
        size: 1024,
        content: validTokenContent,
        validation: {
          valid: true,
          errors: [],
          warnings: ['No recognized token categories found.'],
          parseResult: {
            tokens: [],
            metadata: { totalTokens: 0, categories: {} },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      expect(screen.getByTestId('warning-message')).toBeInTheDocument()
      expect(screen.getByText('No recognized token categories found.')).toBeInTheDocument()
    })

    it('calls onClear when remove clicked', async () => {
      const user = userEvent.setup()
      const selectedFile = {
        file: createMockFile('tokens.json', validTokenContent),
        name: 'tokens.json',
        size: 1024,
        content: validTokenContent,
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult: {
            tokens: [],
            metadata: { totalTokens: 0, categories: {} },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      const clearButton = screen.getByTestId('clear-button')
      await user.click(clearButton)
      
      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })
  })

  describe('File Type Validation', () => {
    it('shows error for non-JSON files', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText('Invalid file type. Please upload a .json file.')).toBeInTheDocument()
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })

    it('accepts .json files', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const file = createMockFile('tokens.json', validTokenContent)
      const fileInput = screen.getByTestId('file-input')
      
      // Mock File.prototype.text()
      file.text = vi.fn().mockResolvedValue(JSON.stringify(validTokenContent))
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled()
      })
    })
  })

  describe('File Size Validation', () => {
    it('shows error for files > 5MB', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      // Create a file that exceeds 5MB
      const largeFile = createMockFile('large.json', {}, 'application/json', 6 * 1024 * 1024)
      largeFile.text = vi.fn().mockResolvedValue('{}')
      
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [largeFile] } })
      })

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText('File too large. Maximum size is 5MB.')).toBeInTheDocument()
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })

    it('accepts files under 5MB', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const smallFile = createMockFile('small.json', validTokenContent, 'application/json', 1024)
      smallFile.text = vi.fn().mockResolvedValue(JSON.stringify(validTokenContent))
      
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [smallFile] } })
      })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled()
      })
    })
  })

  describe('JSON Syntax Validation', () => {
    it('shows error for invalid JSON syntax', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const invalidFile = new File(['{ invalid json }'], 'invalid.json', { type: 'application/json' })
      invalidFile.text = vi.fn().mockResolvedValue('{ invalid json }')
      
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      })

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText('Invalid JSON syntax. Please check the file format.')).toBeInTheDocument()
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })
  })

  describe('Structure Validation', () => {
    it('shows error when validateTokenFile fails', async () => {
      validateTokenFile.mockReturnValue({
        valid: false,
        errors: ['Invalid format: expected object, got array'],
        warnings: [],
        detected: {},
      })

      render(<FileUploadStep {...defaultProps} />)
      
      const file = createMockFile('array.json', [])
      file.text = vi.fn().mockResolvedValue('[]')
      
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText('Invalid format: expected object, got array')).toBeInTheDocument()
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })
  })

  describe('Successful File Processing', () => {
    it('calls onFileSelect with valid JSON', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const file = createMockFile('tokens.json', validTokenContent)
      file.text = vi.fn().mockResolvedValue(JSON.stringify(validTokenContent))
      
      const fileInput = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledTimes(1)
        const callArg = mockOnFileSelect.mock.calls[0][0]
        expect(callArg.name).toBe('tokens.json')
        expect(callArg.content).toEqual(validTokenContent)
        expect(callArg.validation).toBeDefined()
        expect(callArg.validation.parseResult).toBeDefined()
      })
    })
  })

  describe('Drag and Drop', () => {
    it('changes visual state on drag enter', () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const dropZone = screen.getByTestId('drop-zone')
      
      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [] },
      })
      
      expect(screen.getByText('Drop file here')).toBeInTheDocument()
    })

    it('processes dropped file', async () => {
      render(<FileUploadStep {...defaultProps} />)
      
      const file = createMockFile('tokens.json', validTokenContent)
      file.text = vi.fn().mockResolvedValue(JSON.stringify(validTokenContent))
      
      const dropZone = screen.getByTestId('drop-zone')
      
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled()
      })
    })
  })

  describe('Click to Browse', () => {
    it('triggers file input on click', async () => {
      const user = userEvent.setup()
      render(<FileUploadStep {...defaultProps} />)
      
      const fileInput = screen.getByTestId('file-input')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      const dropZone = screen.getByTestId('drop-zone')
      await user.click(dropZone)
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('triggers file input on Enter key', async () => {
      const user = userEvent.setup()
      render(<FileUploadStep {...defaultProps} />)
      
      const fileInput = screen.getByTestId('file-input')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      const dropZone = screen.getByTestId('drop-zone')
      dropZone.focus()
      await user.keyboard('{Enter}')
      
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('File Size Formatting', () => {
    it('displays bytes for small files', () => {
      const selectedFile = {
        file: createMockFile('tiny.json', {}),
        name: 'tiny.json',
        size: 500,
        content: {},
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult: {
            tokens: [],
            metadata: { totalTokens: 0, categories: {} },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      expect(screen.getByTestId('file-size')).toHaveTextContent('500 B')
    })

    it('displays KB for medium files', () => {
      const selectedFile = {
        file: createMockFile('medium.json', {}),
        name: 'medium.json',
        size: 2048,
        content: {},
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult: {
            tokens: [],
            metadata: { totalTokens: 0, categories: {} },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      expect(screen.getByTestId('file-size')).toHaveTextContent('2.0 KB')
    })

    it('displays MB for large files', () => {
      const selectedFile = {
        file: createMockFile('large.json', {}),
        name: 'large.json',
        size: 2 * 1024 * 1024,
        content: {},
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult: {
            tokens: [],
            metadata: { totalTokens: 0, categories: {} },
            errors: [],
            warnings: [],
          },
        },
      }

      render(<FileUploadStep {...defaultProps} selectedFile={selectedFile} />)
      
      expect(screen.getByTestId('file-size')).toHaveTextContent('2.00 MB')
    })
  })
})

