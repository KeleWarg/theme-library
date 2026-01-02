/**
 * ExportOptions Tests
 * Chunk 4.03 - Export Modal
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportOptions, { DEFAULT_OPTIONS } from './ExportOptions'

describe('ExportOptions', () => {
  const defaultProps = {
    format: 'css',
    options: DEFAULT_OPTIONS.css,
    onOptionsChange: vi.fn(),
  }

  describe('CSS options', () => {
    it('renders CSS-specific options', () => {
      render(<ExportOptions {...defaultProps} />)
      
      expect(screen.getByTestId('option-minify')).toBeInTheDocument()
      expect(screen.getByTestId('option-includeComments')).toBeInTheDocument()
      expect(screen.getByTestId('option-scopeClass')).toBeInTheDocument()
    })

    it('minify checkbox defaults to unchecked', () => {
      render(<ExportOptions {...defaultProps} />)
      
      const minify = screen.getByTestId('option-minify')
      expect(minify).not.toBeChecked()
    })

    it('includeComments checkbox defaults to checked', () => {
      render(<ExportOptions {...defaultProps} />)
      
      const includeComments = screen.getByTestId('option-includeComments')
      expect(includeComments).toBeChecked()
    })

    it('calls onOptionsChange when minify is toggled', () => {
      const onOptionsChange = vi.fn()
      render(<ExportOptions {...defaultProps} onOptionsChange={onOptionsChange} />)
      
      fireEvent.click(screen.getByTestId('option-minify'))
      expect(onOptionsChange).toHaveBeenCalledWith({
        ...DEFAULT_OPTIONS.css,
        minify: true,
      })
    })

    it('calls onOptionsChange when scopeClass is changed', () => {
      const onOptionsChange = vi.fn()
      render(<ExportOptions {...defaultProps} onOptionsChange={onOptionsChange} />)
      
      fireEvent.change(screen.getByTestId('option-scopeClass'), {
        target: { value: 'my-theme' },
      })
      expect(onOptionsChange).toHaveBeenCalledWith({
        ...DEFAULT_OPTIONS.css,
        scopeClass: 'my-theme',
      })
    })
  })

  describe('JSON options', () => {
    const jsonProps = {
      format: 'json',
      options: DEFAULT_OPTIONS.json,
      onOptionsChange: vi.fn(),
    }

    it('renders JSON-specific options', () => {
      render(<ExportOptions {...jsonProps} />)
      
      expect(screen.getByTestId('option-prettyPrint')).toBeInTheDocument()
      expect(screen.getByTestId('option-includeFigmaMetadata')).toBeInTheDocument()
    })

    it('prettyPrint defaults to checked', () => {
      render(<ExportOptions {...jsonProps} />)
      
      const prettyPrint = screen.getByTestId('option-prettyPrint')
      expect(prettyPrint).toBeChecked()
    })

    it('includeFigmaMetadata defaults to checked', () => {
      render(<ExportOptions {...jsonProps} />)
      
      const includeFigmaMetadata = screen.getByTestId('option-includeFigmaMetadata')
      expect(includeFigmaMetadata).toBeChecked()
    })

    it('calls onOptionsChange when options are toggled', () => {
      const onOptionsChange = vi.fn()
      render(<ExportOptions {...jsonProps} onOptionsChange={onOptionsChange} />)
      
      fireEvent.click(screen.getByTestId('option-prettyPrint'))
      expect(onOptionsChange).toHaveBeenCalledWith({
        ...DEFAULT_OPTIONS.json,
        prettyPrint: false,
      })
    })
  })

  describe('Tailwind options', () => {
    const tailwindProps = {
      format: 'tailwind',
      options: DEFAULT_OPTIONS.tailwind,
      onOptionsChange: vi.fn(),
    }

    it('renders Tailwind-specific options', () => {
      render(<ExportOptions {...tailwindProps} />)
      
      expect(screen.getByTestId('option-version')).toBeInTheDocument()
    })

    it('version select defaults to 3.x', () => {
      render(<ExportOptions {...tailwindProps} />)
      
      const version = screen.getByTestId('option-version')
      expect(version.value).toBe('3.x')
    })

    it('calls onOptionsChange when version is changed', () => {
      const onOptionsChange = vi.fn()
      render(<ExportOptions {...tailwindProps} onOptionsChange={onOptionsChange} />)
      
      fireEvent.change(screen.getByTestId('option-version'), {
        target: { value: '4.x' },
      })
      expect(onOptionsChange).toHaveBeenCalledWith({
        ...DEFAULT_OPTIONS.tailwind,
        version: '4.x',
      })
    })
  })

  describe('SCSS options', () => {
    const scssProps = {
      format: 'scss',
      options: DEFAULT_OPTIONS.scss,
      onOptionsChange: vi.fn(),
    }

    it('renders SCSS-specific options', () => {
      render(<ExportOptions {...scssProps} />)
      
      expect(screen.getByTestId('option-useMap')).toBeInTheDocument()
      expect(screen.getByTestId('option-includeComments')).toBeInTheDocument()
    })

    it('useMap defaults to unchecked', () => {
      render(<ExportOptions {...scssProps} />)
      
      const useMap = screen.getByTestId('option-useMap')
      expect(useMap).not.toBeChecked()
    })

    it('includeComments defaults to checked', () => {
      render(<ExportOptions {...scssProps} />)
      
      const includeComments = screen.getByTestId('option-includeComments')
      expect(includeComments).toBeChecked()
    })

    it('calls onOptionsChange when useMap is toggled', () => {
      const onOptionsChange = vi.fn()
      render(<ExportOptions {...scssProps} onOptionsChange={onOptionsChange} />)
      
      fireEvent.click(screen.getByTestId('option-useMap'))
      expect(onOptionsChange).toHaveBeenCalledWith({
        ...DEFAULT_OPTIONS.scss,
        useMap: true,
      })
    })
  })
})

describe('DEFAULT_OPTIONS', () => {
  it('provides defaults for all formats', () => {
    expect(DEFAULT_OPTIONS.css).toBeDefined()
    expect(DEFAULT_OPTIONS.json).toBeDefined()
    expect(DEFAULT_OPTIONS.tailwind).toBeDefined()
    expect(DEFAULT_OPTIONS.scss).toBeDefined()
  })

  it('css defaults match expected values', () => {
    expect(DEFAULT_OPTIONS.css).toEqual({
      minify: false,
      includeComments: true,
      scopeClass: '',
    })
  })

  it('json defaults match expected values', () => {
    expect(DEFAULT_OPTIONS.json).toEqual({
      prettyPrint: true,
      includeFigmaMetadata: true,
    })
  })

  it('tailwind defaults match expected values', () => {
    expect(DEFAULT_OPTIONS.tailwind).toEqual({
      version: '3.x',
    })
  })

  it('scss defaults match expected values', () => {
    expect(DEFAULT_OPTIONS.scss).toEqual({
      useMap: false,
      includeComments: true,
    })
  })
})

