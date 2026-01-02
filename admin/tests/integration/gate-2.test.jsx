/**
 * Gate 2: Import Components Integration Test
 * 
 * Trigger: When 2.01 + 2.02 + 2.03 all show ✅ in chunk index
 * Purpose: Verify import UI components work together before combining in wizard
 * 
 * Pass Criteria: All tests pass
 * Blocks: 2.04 cannot start until Gate 2 passes
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeSourceModal from '../../src/components/themes/ThemeSourceModal'
import FileUploadStep from '../../src/components/themes/import/FileUploadStep'
import TokenMappingStep from '../../src/components/themes/import/TokenMappingStep'
import { parseTokenFile } from '../../src/lib/tokenParser'

describe('Gate 2: Import Components Integration', () => {
  
  describe('ThemeSourceModal', () => {
    it('renders both options', () => {
      render(
        <ThemeSourceModal 
          isOpen={true} 
          onClose={() => {}} 
          onSelectImport={() => {}} 
          onSelectCreate={() => {}} 
        />
      )
      expect(screen.getByTestId('import-option')).toBeInTheDocument()
      expect(screen.getByTestId('create-option')).toBeInTheDocument()
    })

    it('calls onSelectImport when import clicked', async () => {
      const user = userEvent.setup()
      const onSelectImport = vi.fn()
      render(
        <ThemeSourceModal 
          isOpen={true} 
          onClose={() => {}} 
          onSelectImport={onSelectImport} 
          onSelectCreate={() => {}} 
        />
      )
      await user.click(screen.getByTestId('import-option'))
      expect(onSelectImport).toHaveBeenCalledTimes(1)
    })

    it('calls onSelectCreate when create clicked', async () => {
      const user = userEvent.setup()
      const onSelectCreate = vi.fn()
      render(
        <ThemeSourceModal 
          isOpen={true} 
          onClose={() => {}} 
          onSelectImport={() => {}} 
          onSelectCreate={onSelectCreate} 
        />
      )
      await user.click(screen.getByTestId('create-option'))
      expect(onSelectCreate).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking outside modal', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(
        <ThemeSourceModal 
          isOpen={true} 
          onClose={onClose} 
          onSelectImport={() => {}} 
          onSelectCreate={() => {}} 
        />
      )
      // Click on the backdrop (the modal container)
      await user.click(screen.getByTestId('theme-source-modal'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('FileUploadStep → Parser Integration', () => {
    // Note: File upload tests that require file.text() need special handling in jsdom
    // The component tests in FileUploadStep.test.jsx mock file.text() for full coverage
    // Here we focus on integration patterns that work in jsdom

    it('renders upload zone correctly', () => {
      render(<FileUploadStep onFileSelect={() => {}} selectedFile={null} onClear={() => {}} />)
      
      expect(screen.getByTestId('file-upload-step')).toBeInTheDocument()
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument()
      expect(screen.getByTestId('file-input')).toBeInTheDocument()
      expect(screen.getByText('Drag & drop your JSON file')).toBeInTheDocument()
    })

    it('displays file preview when file data is provided', () => {
      // Simulate what happens after successful file processing
      const validJson = {
        Color: { 
          primary: { $type: 'color', $value: { hex: '#FF0000' } },
          secondary: { $type: 'color', $value: { hex: '#00FF00' } }
        },
        Spacing: {
          md: { $type: 'number', $value: 16 }
        }
      }
      
      // Use parseTokenFile to get the correct structure
      const parseResult = parseTokenFile(validJson)
      
      const selectedFile = {
        name: 'tokens.json',
        size: 1024,
        content: validJson,
        validation: {
          valid: true,
          errors: [],
          warnings: [],
          parseResult
        }
      }
      
      render(<FileUploadStep onFileSelect={() => {}} selectedFile={selectedFile} onClear={() => {}} />)

      expect(screen.getByTestId('file-preview')).toBeInTheDocument()
      expect(screen.getByTestId('file-name')).toHaveTextContent('tokens.json')
      expect(screen.getByTestId('token-count')).toHaveTextContent('3 tokens found')
    })

    it('parser output is compatible with file data structure', () => {
      // Verify the parser produces the expected structure for FileUploadStep
      const rawJson = {
        Color: { primary: { $type: 'color', $value: { hex: '#FF0000' } } }
      }
      
      const parseResult = parseTokenFile(rawJson)
      
      // The structure FileUploadStep expects
      const fileData = {
        name: 'test.json',
        size: 100,
        content: rawJson,
        validation: {
          valid: true,
          parseResult
        }
      }
      
      // Verify the parse result has the expected shape
      expect(fileData.validation.parseResult.tokens).toHaveLength(1)
      expect(fileData.validation.parseResult.metadata.totalTokens).toBe(1)
      expect(fileData.validation.parseResult.metadata.categories.color).toBe(1)
    })

    it('shows error for non-JSON files', async () => {
      render(<FileUploadStep onFileSelect={() => {}} selectedFile={null} onClear={() => {}} />)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = screen.getByTestId('file-input')
      
      // Trigger file selection with wrong type
      Object.defineProperty(fileInput, 'files', { value: [file] })
      fireEvent.change(fileInput)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })
  })

  describe('TokenMappingStep', () => {
    it('displays parsed tokens grouped by category', () => {
      const tokens = [
        { name: 'primary', category: 'color', value: { hex: '#F00' }, path: 'Color/primary', sort_order: 0 },
        { name: 'secondary', category: 'color', value: { hex: '#0F0' }, path: 'Color/secondary', sort_order: 1 },
        { name: 'md', category: 'spacing', value: { value: 16 }, path: 'Spacing/md', sort_order: 0 }
      ]
      
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={() => {}} />)
      
      // Should have category sections
      expect(screen.getByTestId('category-color')).toBeInTheDocument()
      expect(screen.getByTestId('category-spacing')).toBeInTheDocument()
    })

    it('shows warning banner when "other" category has tokens', () => {
      const tokens = [
        { name: 'unknown', category: 'other', value: { value: 'test' }, path: 'Unknown/unknown', sort_order: 0 }
      ]
      
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={() => {}} />)
      
      expect(screen.getByTestId('other-warning')).toBeInTheDocument()
    })

    it('allows category override via dropdown', async () => {
      const user = userEvent.setup()
      const tokens = [
        { name: 'test', category: 'other', value: {}, path: 'Unknown/test', sort_order: 0 }
      ]
      
      let updatedTokens = null
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={(t) => updatedTokens = t} />)
      
      // Find and change category dropdown
      const select = screen.getByTestId('category-select-Unknown/test')
      await user.selectOptions(select, 'color')
      
      expect(updatedTokens[0].category).toBe('color')
    })

    it('displays summary counts by category', () => {
      const tokens = [
        { name: 'a', category: 'color', value: {}, path: 'Color/a', sort_order: 0 },
        { name: 'b', category: 'color', value: {}, path: 'Color/b', sort_order: 1 },
        { name: 'c', category: 'spacing', value: {}, path: 'Spacing/c', sort_order: 0 }
      ]
      
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={() => {}} />)
      
      expect(screen.getByTestId('token-summary')).toBeInTheDocument()
      expect(screen.getByTestId('summary-color')).toHaveTextContent('2')
      expect(screen.getByTestId('summary-spacing')).toHaveTextContent('1')
    })
  })

  describe('Data Flow: FileUpload → Parser → Mapping', () => {
    it('complete data transformation pipeline', () => {
      // Simulate the full flow
      const rawJson = {
        Color: {
          Button: {
            primary: { $type: 'color', $value: { hex: '#657E79' } }
          }
        },
        Spacing: {
          md: { $type: 'number', $value: 16 }
        }
      }

      // Step 1: Parse (simulating FileUploadStep output)
      const { tokens, metadata } = parseTokenFile(rawJson)
      
      expect(tokens.length).toBe(2)
      expect(metadata.categories.color).toBe(1)
      expect(metadata.categories.spacing).toBe(1)

      // Step 2: Render in mapping (simulating TokenMappingStep)
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={() => {}} />)
      
      // Verify tokens are visible in the UI
      expect(screen.getByTestId('category-color')).toBeInTheDocument()
      expect(screen.getByTestId('category-spacing')).toBeInTheDocument()
    })

    it('preserves token structure through transformation', () => {
      const rawJson = {
        Color: {
          Button: {
            Primary: {
              'hover-bg': {
                $type: 'color',
                $value: { hex: '#123456' },
                $extensions: { 'com.figma.variableId': 'VariableID:123:456' }
              }
            }
          }
        }
      }

      const { tokens } = parseTokenFile(rawJson)
      
      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject({
        name: 'hover-bg',
        category: 'color',
        path: 'Color/Button/Primary/hover-bg',
        figma_variable_id: 'VariableID:123:456'
      })
      expect(tokens[0].css_variable).toMatch(/^--color/)
    })
  })
})

