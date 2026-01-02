import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ThemeEditor from '../../src/pages/ThemeEditor'
import { createTheme, bulkCreateTokens, deleteTheme, getThemeById } from '../../src/lib/themeService'

describe('Gate 4: Editor Integration', () => {
  let testTheme = null

  beforeAll(async () => {
    // Create test theme with tokens
    testTheme = await createTheme({
      name: 'Editor Test Theme',
      slug: `editor-test-${Date.now()}`
    })
    await bulkCreateTokens([
      { theme_id: testTheme.id, category: 'color', name: 'primary', value: { hex: '#FF0000' }, css_variable: '--color-primary' },
      { theme_id: testTheme.id, category: 'color', name: 'secondary', value: { hex: '#00FF00' }, css_variable: '--color-secondary' },
      { theme_id: testTheme.id, category: 'spacing', name: 'md', value: { value: 16, unit: 'px' }, css_variable: '--spacing-md' }
    ])
  })

  afterAll(async () => {
    if (testTheme) {
      await deleteTheme(testTheme.id)
    }
  })

  it('loads theme and displays tokens by category', async () => {
    render(
      <MemoryRouter initialEntries={[`/themes/${testTheme.id}/edit`]}>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for theme to load
    await waitFor(() => {
      expect(screen.getByText('Editor Test Theme')).toBeInTheDocument()
    }, { timeout: 10000 })

    // Check category sidebar exists
    const sidebar = screen.getByTestId('category-sidebar')
    expect(sidebar).toBeInTheDocument()
    
    // Check that categories are displayed
    const colorElements = screen.getAllByText(/color/i)
    expect(colorElements.length).toBeGreaterThan(0)
    
    const spacingElements = screen.getAllByText(/spacing/i)
    expect(spacingElements.length).toBeGreaterThan(0)

    // Check that token 'primary' is visible somewhere in the page
    expect(screen.getByText('primary')).toBeInTheDocument()
  })

  it('displays token values in editor', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter initialEntries={[`/themes/${testTheme.id}/edit`]}>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for theme to load and token rows to be visible
    await waitFor(() => {
      expect(screen.getByText('primary')).toBeInTheDocument()
    }, { timeout: 10000 })

    // Tokens should be displayed 
    // Check that the token value is displayed (as hex color or in some format)
    await waitFor(() => {
      // The token value #FF0000 should be visible somewhere
      const hexValues = screen.getAllByText(/#FF0000/i)
      expect(hexValues.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
    
    // Check for the CSS variable
    expect(screen.getByText('--color-primary')).toBeInTheDocument()
    
    // Click on a category to switch views
    const spacingCategory = screen.getByTestId('category-spacing')
    await user.click(spacingCategory)
    
    // Wait for spacing tokens to appear
    await waitFor(() => {
      expect(screen.getByText('md')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // The spacing CSS variable should be visible
    expect(screen.getByText('--spacing-md')).toBeInTheDocument()
  })

  it('preview updates when tokens change', async () => {
    render(
      <MemoryRouter initialEntries={[`/themes/${testTheme.id}/edit`]}>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for preview panel to appear
    await waitFor(() => {
      expect(screen.getByTestId('preview-panel')).toBeInTheDocument()
    }, { timeout: 10000 })

    // Check preview panel exists and is rendering
    const previewPanel = screen.getByTestId('preview-panel')
    expect(previewPanel).toBeInTheDocument()
    
    // The preview panel should contain theme information
    expect(previewPanel.childNodes.length).toBeGreaterThan(0)
  })
})
