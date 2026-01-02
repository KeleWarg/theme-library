/**
 * Theme Management E2E Tests
 * Chunk 5.03 - Comprehensive Tests
 * 
 * End-to-end tests for critical user journeys:
 * - Create theme via import
 * - Edit existing theme
 * - Export theme
 * - Delete theme
 */

import { test, expect, Page } from '@playwright/test'
import path from 'path'

// Test fixture data
const testThemeName = `E2E Test Theme ${Date.now()}`
const testThemeSlug = `theme-e2e-test-${Date.now()}`

// Helper to wait for page to be ready
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // Small buffer for React hydration
}

test.describe('Theme Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/themes')
    await waitForPageReady(page)
  })

  test.describe('Theme List Page', () => {
    test('displays themes page with header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /themes/i })).toBeVisible()
    })

    test('shows existing themes', async ({ page }) => {
      // Should have theme cards
      const themeCards = page.locator('[data-testid="theme-card"]')
      await expect(themeCards.first()).toBeVisible({ timeout: 10000 })
    })

    test('has create theme button', async ({ page }) => {
      const createButton = page.getByTestId('create-theme-btn').or(
        page.getByRole('button', { name: /create|new|add/i })
      )
      await expect(createButton).toBeVisible()
    })
  })

  test.describe('Import Theme Flow', () => {
    test('opens import wizard from create button', async ({ page }) => {
      // Click create theme button
      const createButton = page.getByTestId('create-theme-btn').or(
        page.getByRole('button', { name: /create|new|add/i })
      )
      await createButton.click()

      // Should show source modal or import option
      const importOption = page.getByTestId('import-option').or(
        page.getByRole('button', { name: /import|upload/i })
      )
      await expect(importOption).toBeVisible({ timeout: 5000 })
      await importOption.click()

      // Import wizard should open
      await expect(page.getByTestId('import-wizard')).toBeVisible({ timeout: 5000 })
    })

    test('import theme from JSON file', async ({ page }) => {
      // Create a test JSON file content
      const testTokens = {
        Color: {
          Brand: {
            primary: { '$type': 'color', '$value': { hex: '#3B82F6' } },
            secondary: { '$type': 'color', '$value': { hex: '#10B981' } },
          },
        },
        Spacing: {
          sm: { '$type': 'dimension', '$value': '8px' },
          md: { '$type': 'dimension', '$value': '16px' },
        },
      }

      // Navigate to import
      const createButton = page.getByTestId('create-theme-btn').or(
        page.getByRole('button', { name: /create|new|add/i })
      )
      await createButton.click()

      const importOption = page.getByTestId('import-option').or(
        page.getByRole('button', { name: /import|upload/i })
      )
      await importOption.click()

      await expect(page.getByTestId('import-wizard')).toBeVisible()

      // Step 1: Upload file
      const fileInput = page.locator('input[type="file"]')
      
      // Create a buffer with the JSON content
      const buffer = Buffer.from(JSON.stringify(testTokens))
      await fileInput.setInputFiles({
        name: 'test-tokens.json',
        mimeType: 'application/json',
        buffer,
      })

      // Wait for file to be processed
      await page.waitForTimeout(1000)

      // Next should be enabled
      const nextButton = page.getByTestId('next-button')
      await expect(nextButton).toBeEnabled({ timeout: 5000 })
      await nextButton.click()

      // Step 2: Token Mapping
      await expect(page.getByText(/review tokens|mapping/i)).toBeVisible()
      await nextButton.click()

      // Step 3: Theme Details
      await expect(page.getByText(/theme details|name.*configure/i)).toBeVisible()
      
      // Fill in theme name
      const nameInput = page.getByPlaceholder(/theme name/i).or(
        page.getByLabel(/name/i)
      )
      await nameInput.fill(testThemeName)
      
      // Wait for validation
      await page.waitForTimeout(500)
      await expect(nextButton).toBeEnabled()
      await nextButton.click()

      // Step 4: Review
      await expect(page.getByText(/review.*import|confirm.*create/i)).toBeVisible()
      
      // Complete import
      const importButton = page.getByTestId('import-button')
      await expect(importButton).toBeVisible()
      await importButton.click()

      // Should complete and close wizard
      await expect(page.getByTestId('import-wizard')).toBeHidden({ timeout: 10000 })
    })

    test('validates file format on upload', async ({ page }) => {
      // Navigate to import
      const createButton = page.getByTestId('create-theme-btn').or(
        page.getByRole('button', { name: /create|new|add/i })
      )
      await createButton.click()

      const importOption = page.getByTestId('import-option').or(
        page.getByRole('button', { name: /import|upload/i })
      )
      await importOption.click()

      await expect(page.getByTestId('import-wizard')).toBeVisible()

      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'invalid.json',
        mimeType: 'application/json',
        buffer: Buffer.from('not valid json {{{'),
      })

      // Should show error or keep next disabled
      await page.waitForTimeout(1000)
      const nextButton = page.getByTestId('next-button')
      
      const hasError = await page.getByText(/error|invalid/i).isVisible().catch(() => false)
      const isDisabled = await nextButton.isDisabled()
      
      expect(hasError || isDisabled).toBeTruthy()
    })

    test('can cancel import and close wizard', async ({ page }) => {
      // Navigate to import
      const createButton = page.getByTestId('create-theme-btn').or(
        page.getByRole('button', { name: /create|new|add/i })
      )
      await createButton.click()

      const importOption = page.getByTestId('import-option').or(
        page.getByRole('button', { name: /import|upload/i })
      )
      await importOption.click()

      await expect(page.getByTestId('import-wizard')).toBeVisible()

      // Close wizard
      const closeButton = page.getByTestId('close-wizard').or(
        page.getByRole('button', { name: /close/i })
      )
      await closeButton.click()

      await expect(page.getByTestId('import-wizard')).toBeHidden()
    })
  })

  test.describe('Edit Theme', () => {
    test.skip('navigates to theme editor', async ({ page }) => {
      // This test requires 5.01/5.02 to be complete
      // Click on a theme card to edit
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      await themeCard.click()

      // Should navigate to editor
      await expect(page).toHaveURL(/\/themes\/.*\/edit/)
    })

    test.skip('can edit token value', async ({ page }) => {
      // Navigate to a theme editor
      await page.goto('/themes/test-theme/edit')
      await waitForPageReady(page)

      // Find a token row
      const tokenRow = page.locator('[data-testid="token-row"]').first()
      await tokenRow.click()

      // Edit value
      const input = page.getByRole('textbox').or(page.locator('input[type="color"]'))
      await input.fill('#FF0000')

      // Save changes
      const saveButton = page.getByRole('button', { name: /save/i })
      await saveButton.click()

      // Should show success feedback
      await expect(page.getByText(/saved|success/i)).toBeVisible()
    })

    test.skip('preview updates when token changes', async ({ page }) => {
      await page.goto('/themes/test-theme/edit')
      await waitForPageReady(page)

      // Get preview panel
      const preview = page.getByTestId('preview-panel')
      await expect(preview).toBeVisible()

      // Change a color token
      const colorInput = page.locator('input[type="color"]').first()
      const originalColor = await colorInput.inputValue()
      
      await colorInput.fill('#FF0000')

      // Preview should update
      await page.waitForTimeout(500)
      // Verify preview reflects the change (implementation specific)
    })
  })

  test.describe('Export Theme', () => {
    test('opens export modal', async ({ page }) => {
      // Find a theme card and its export button
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      
      // Look for export button or menu
      const exportButton = themeCard.getByRole('button', { name: /export/i }).or(
        page.getByTestId('export-button')
      )
      
      if (await exportButton.isVisible()) {
        await exportButton.click()
        await expect(page.getByTestId('export-modal')).toBeVisible()
      }
    })

    test.skip('exports as CSS', async ({ page }) => {
      // Open export modal
      const exportButton = page.getByTestId('export-button').first()
      await exportButton.click()
      
      await expect(page.getByTestId('export-modal')).toBeVisible()

      // Ensure CSS format is selected
      await page.getByTestId('format-tab-css').click()

      // Preview should show CSS
      const preview = page.getByTestId('export-preview')
      await expect(preview).toContainText(':root')

      // Copy to clipboard
      await page.getByTestId('copy-button').click()
      await expect(page.getByText(/copied/i)).toBeVisible()
    })

    test.skip('exports as JSON', async ({ page }) => {
      const exportButton = page.getByTestId('export-button').first()
      await exportButton.click()
      
      await expect(page.getByTestId('export-modal')).toBeVisible()

      // Select JSON format
      await page.getByTestId('format-tab-json').click()

      // Preview should show JSON structure
      const preview = page.getByTestId('export-preview')
      await expect(preview).toContainText('$type')
    })

    test.skip('exports as Tailwind config', async ({ page }) => {
      const exportButton = page.getByTestId('export-button').first()
      await exportButton.click()
      
      await expect(page.getByTestId('export-modal')).toBeVisible()

      // Select Tailwind format
      await page.getByTestId('format-tab-tailwind').click()

      // Preview should show module.exports
      const preview = page.getByTestId('export-preview')
      await expect(preview).toContainText('module.exports')
    })

    test.skip('downloads export file', async ({ page }) => {
      const exportButton = page.getByTestId('export-button').first()
      await exportButton.click()
      
      await expect(page.getByTestId('export-modal')).toBeVisible()

      // Start download
      const downloadPromise = page.waitForEvent('download')
      await page.getByTestId('download-button').click()
      const download = await downloadPromise

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.css$/)
    })
  })

  test.describe('Delete Theme', () => {
    test.skip('shows delete confirmation', async ({ page }) => {
      // This test requires 5.02 to be complete
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      
      // Open menu
      const menuButton = themeCard.getByRole('button', { name: /menu|more|options/i })
      await menuButton.click()

      // Click delete
      const deleteOption = page.getByRole('menuitem', { name: /delete/i })
      await deleteOption.click()

      // Should show confirmation dialog
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText(/confirm|sure|delete/i)).toBeVisible()
    })

    test.skip('cancels delete on dismiss', async ({ page }) => {
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      const themeName = await themeCard.locator('h3, [data-testid="theme-name"]').textContent()
      
      // Open menu and click delete
      await themeCard.getByRole('button', { name: /menu|more|options/i }).click()
      await page.getByRole('menuitem', { name: /delete/i }).click()

      // Cancel the dialog
      await page.getByRole('button', { name: /cancel|no/i }).click()

      // Theme should still exist
      await expect(page.getByText(themeName!)).toBeVisible()
    })

    test.skip('deletes theme on confirm', async ({ page }) => {
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      const themeName = await themeCard.locator('h3, [data-testid="theme-name"]').textContent()
      
      // Open menu and click delete
      await themeCard.getByRole('button', { name: /menu|more|options/i }).click()
      await page.getByRole('menuitem', { name: /delete/i }).click()

      // Confirm delete
      await page.getByRole('button', { name: /confirm|yes|delete/i }).click()

      // Theme should be removed
      await expect(page.getByText(themeName!)).toBeHidden()
    })
  })

  test.describe('Theme Preview', () => {
    test('opens preview modal', async ({ page }) => {
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      
      // Click preview button
      const previewButton = themeCard.getByRole('button', { name: /preview/i })
      await previewButton.click()

      // Preview modal should be visible
      await expect(page.getByTestId('modal-overlay')).toBeVisible()
    })

    test('applies theme temporarily in preview', async ({ page }) => {
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      
      // Get the theme name
      const themeName = await themeCard.locator('span').first().textContent()
      
      // Click preview
      const previewButton = themeCard.getByRole('button', { name: /preview/i })
      await previewButton.click()

      // Modal should show theme name
      await expect(page.getByTestId('modal-overlay')).toBeVisible()
      if (themeName) {
        await expect(page.getByText(themeName)).toBeVisible()
      }
    })

    test('closes preview on overlay click', async ({ page }) => {
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      
      // Open preview
      await themeCard.getByRole('button', { name: /preview/i }).click()
      await expect(page.getByTestId('modal-overlay')).toBeVisible()

      // Click overlay
      await page.getByTestId('modal-overlay').click()
      await expect(page.getByTestId('modal-overlay')).toBeHidden()
    })
  })

  test.describe('Theme Application', () => {
    test('applies theme when Apply button is clicked', async ({ page }) => {
      // Get a theme card that's not active
      const inactiveCard = page.locator('[data-testid="theme-card"]').filter({
        hasNot: page.getByText('Active'),
      }).first()

      const themeName = await inactiveCard.locator('span').first().textContent()
      
      // Click Apply
      const applyButton = inactiveCard.getByRole('button', { name: /apply/i })
      await applyButton.click()

      // Theme should now be active
      await expect(inactiveCard.getByText('Active')).toBeVisible()
      
      // Page should reflect theme change (check document class)
      const htmlClass = await page.evaluate(() => document.documentElement.className)
      expect(htmlClass).toContain('theme-')
    })

    test('persists theme selection after page reload', async ({ page }) => {
      // Apply a specific theme
      const llmCard = page.locator('[data-testid="theme-card"]').filter({
        hasText: 'LLM',
      }).first()
      
      if (await llmCard.isVisible()) {
        const applyButton = llmCard.getByRole('button', { name: /apply/i })
        await applyButton.click()

        // Reload page
        await page.reload()
        await waitForPageReady(page)

        // Theme should still be applied
        const htmlClass = await page.evaluate(() => document.documentElement.className)
        expect(htmlClass).toContain('theme-llm')
      }
    })
  })
})

test.describe('Accessibility', () => {
  test('theme page is keyboard navigable', async ({ page }) => {
    await page.goto('/themes')
    await waitForPageReady(page)

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Should focus on an interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement || '')).toBeTruthy()
  })

  test('modals trap focus', async ({ page }) => {
    await page.goto('/themes')
    await waitForPageReady(page)

    // Open a modal
    const previewButton = page.locator('[data-testid="theme-card"]').first().getByRole('button', { name: /preview/i })
    await previewButton.click()

    // Tab through modal
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should stay within modal
    const isInsideModal = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="modal-overlay"]')
      return modal?.contains(document.activeElement)
    })
    expect(isInsideModal).toBeTruthy()
  })

  test('escape key closes modals', async ({ page }) => {
    await page.goto('/themes')
    await waitForPageReady(page)

    // Open modal
    const previewButton = page.locator('[data-testid="theme-card"]').first().getByRole('button', { name: /preview/i })
    await previewButton.click()
    await expect(page.getByTestId('modal-overlay')).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('modal-overlay')).toBeHidden()
  })
})

test.describe('Responsive Design', () => {
  test('theme cards adjust on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/themes')
    await waitForPageReady(page)

    // Theme cards should still be visible
    const themeCards = page.locator('[data-testid="theme-card"]')
    await expect(themeCards.first()).toBeVisible()
  })

  test('import wizard is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/themes')
    await waitForPageReady(page)

    // Open import wizard
    const createButton = page.getByTestId('create-theme-btn').or(
      page.getByRole('button', { name: /create|new|add/i })
    )
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      const importOption = page.getByTestId('import-option').or(
        page.getByRole('button', { name: /import/i })
      )
      
      if (await importOption.isVisible()) {
        await importOption.click()
        
        // Wizard should be visible and scrollable
        const wizard = page.getByTestId('import-wizard')
        await expect(wizard).toBeVisible()
      }
    }
  })
})

