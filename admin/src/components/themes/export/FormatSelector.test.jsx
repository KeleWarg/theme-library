/**
 * FormatSelector Tests
 * Chunk 4.03 - Export Modal
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormatSelector, { FORMATS } from './FormatSelector'

describe('FormatSelector', () => {
  const defaultProps = {
    selectedFormat: 'css',
    onFormatChange: vi.fn(),
  }

  it('renders all format tabs', () => {
    render(<FormatSelector {...defaultProps} />)
    
    expect(screen.getByTestId('format-tab-css')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-json')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-tailwind')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-scss')).toBeInTheDocument()
  })

  it('displays format labels', () => {
    render(<FormatSelector {...defaultProps} />)
    
    expect(screen.getByText('CSS')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText('Tailwind')).toBeInTheDocument()
    expect(screen.getByText('SCSS')).toBeInTheDocument()
  })

  it('highlights selected format', () => {
    render(<FormatSelector {...defaultProps} selectedFormat="json" />)
    
    const jsonTab = screen.getByTestId('format-tab-json')
    expect(jsonTab).toHaveAttribute('aria-selected', 'true')
    
    const cssTab = screen.getByTestId('format-tab-css')
    expect(cssTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onFormatChange when tab is clicked', () => {
    const onFormatChange = vi.fn()
    render(<FormatSelector {...defaultProps} onFormatChange={onFormatChange} />)
    
    fireEvent.click(screen.getByTestId('format-tab-json'))
    expect(onFormatChange).toHaveBeenCalledWith('json')
    
    fireEvent.click(screen.getByTestId('format-tab-tailwind'))
    expect(onFormatChange).toHaveBeenCalledWith('tailwind')
    
    fireEvent.click(screen.getByTestId('format-tab-scss'))
    expect(onFormatChange).toHaveBeenCalledWith('scss')
  })

  it('has correct role attributes for accessibility', () => {
    render(<FormatSelector {...defaultProps} />)
    
    FORMATS.forEach(format => {
      const tab = screen.getByTestId(`format-tab-${format.id}`)
      expect(tab).toHaveAttribute('role', 'tab')
    })
  })
})

describe('FORMATS constant', () => {
  it('exports all supported formats', () => {
    expect(FORMATS).toHaveLength(4)
    expect(FORMATS.map(f => f.id)).toEqual(['css', 'json', 'tailwind', 'scss'])
  })

  it('each format has required properties', () => {
    FORMATS.forEach(format => {
      expect(format).toHaveProperty('id')
      expect(format).toHaveProperty('label')
      expect(format).toHaveProperty('icon')
    })
  })
})

