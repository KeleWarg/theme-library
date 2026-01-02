import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ImportReviewStep from './ImportReviewStep'

describe('ImportReviewStep', () => {
  const mockFileData = {
    name: 'tokens.json',
    size: 12345,
  }

  const mockTokens = [
    { category: 'color', name: 'primary', path: 'Color/primary', value: '#000' },
    { category: 'color', name: 'secondary', path: 'Color/secondary', value: '#fff' },
    { category: 'typography', name: 'heading', path: 'Typography/heading', value: '24px' },
    { category: 'other', name: 'unknown', path: 'Unknown/token', value: 'test' },
  ]

  const mockThemeDetails = {
    name: 'Test Theme',
    slug: 'theme-test',
    description: 'A test theme description',
  }

  it('renders the review step', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('import-review-step')).toBeInTheDocument()
  })

  it('displays ready to import banner', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByText('Ready to Import')).toBeInTheDocument()
  })

  it('displays theme details', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('theme-details-card')).toBeInTheDocument()
    expect(screen.getByTestId('review-name')).toHaveTextContent('Test Theme')
    expect(screen.getByTestId('review-slug')).toHaveTextContent('theme-test')
    expect(screen.getByTestId('review-description')).toHaveTextContent('A test theme description')
  })

  it('displays source file information', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('source-file-card')).toBeInTheDocument()
    expect(screen.getByTestId('review-filename')).toHaveTextContent('tokens.json')
    expect(screen.getByTestId('review-filesize')).toHaveTextContent('12.1 KB')
  })

  it('displays total token count', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('total-token-count')).toHaveTextContent('4 total')
  })

  it('displays token counts by category', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('category-count-color')).toHaveTextContent('2 tokens')
    expect(screen.getByTestId('category-count-typography')).toHaveTextContent('1 token')
    expect(screen.getByTestId('category-count-other')).toHaveTextContent('1 token')
  })

  it('displays warning for uncategorized tokens', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('uncategorized-warning')).toBeInTheDocument()
    expect(screen.getByText(/1 uncategorized token/)).toBeInTheDocument()
  })

  it('does not show warning when no uncategorized tokens', () => {
    const tokensWithoutOther = mockTokens.filter(t => t.category !== 'other')
    
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={tokensWithoutOther}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.queryByTestId('uncategorized-warning')).not.toBeInTheDocument()
  })

  it('handles empty tokens array', () => {
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={[]}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.getByTestId('total-token-count')).toHaveTextContent('0 total')
  })

  it('handles missing file data gracefully', () => {
    render(
      <ImportReviewStep
        fileData={null}
        tokens={mockTokens}
        themeDetails={mockThemeDetails}
      />
    )
    
    expect(screen.queryByTestId('source-file-card')).not.toBeInTheDocument()
  })

  it('handles missing description', () => {
    const detailsWithoutDescription = {
      name: 'Test Theme',
      slug: 'theme-test',
    }
    
    render(
      <ImportReviewStep
        fileData={mockFileData}
        tokens={mockTokens}
        themeDetails={detailsWithoutDescription}
      />
    )
    
    expect(screen.queryByTestId('review-description')).not.toBeInTheDocument()
  })
})

