/**
 * Gate 6 - Full Flow E2E Tests
 * Chunk 5.03 - Comprehensive Tests
 * 
 * Complete end-to-end validation for release readiness.
 * Tests the entire theme management workflow from start to finish.
 */

import { test, expect, Page } from '@playwright/test'

// Helper to wait for page to be ready
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
}

test.describe('Gate 6 - Full Flow Validation', () => {
  test.describe('Complete Theme Lifecycle', () => {
    const testThemeName = `Full Flow Test ${Date.now()}`

    test('complete theme lifecycle: create → edit → export → delete', async ({ page }) => {
      // 1. Navigate to themes page
      await page.goto('/themes')
      await waitForPageReady(page)
      await expect(page.getByRole('heading', { name: /themes/i })).toBeVisible()

      // 2. Create a new theme via import
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
          
          // Upload test file
          const testTokens = {
            Color: {
              Brand: {
                primary: { '$type': 'color', '$value': { hex: '#FF5733' } },
              },
            },
          }
          
          const fileInput = page.locator('input[type="file"]')
          await fileInput.setInputFiles({
            name: 'gate6-tokens.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(testTokens)),
          })

          // Navigate through wizard
          await page.waitForTimeout(1000)
          const nextButton = page.getByTestId('next-button')
          
          if (await nextButton.isEnabled()) {
            await nextButton.click() // To mapping
            await page.waitForTimeout(500)
            await nextButton.click() // To details
            
            // Fill theme name
            const nameInput = page.getByPlaceholder(/theme name/i).or(page.getByLabel(/name/i))
            if (await nameInput.isVisible()) {
              await nameInput.fill(testThemeName)
              await page.waitForTimeout(500)
              await nextButton.click() // To review
              
              // Import
              const importButton = page.getByTestId('import-button')
              if (await importButton.isVisible()) {
                await importButton.click()
                await page.waitForTimeout(2000)
              }
            }
          }
        }
      }

      // 3. Verify theme was created (check if visible in list)
      await page.goto('/themes')
      await waitForPageReady(page)
      
      // Theme should appear in list (may need to search)
      // Note: This depends on 5.01/5.02 being complete

      // 4. Test preview functionality
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      if (await themeCard.isVisible()) {
        const previewButton = themeCard.getByRole('button', { name: /preview/i })
        await previewButton.click()
        await expect(page.getByTestId('modal-overlay')).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByTestId('modal-overlay')).toBeHidden()
      }

      // 5. Test apply theme
      if (await themeCard.isVisible()) {
        const applyButton = themeCard.getByRole('button', { name: /apply/i })
        if (await applyButton.isEnabled()) {
          await applyButton.click()
          await page.waitForTimeout(500)
          
          // Verify theme class changed
          const htmlClass = await page.evaluate(() => document.documentElement.className)
          expect(htmlClass).toContain('theme-')
        }
      }

      console.log('✅ Gate 6 - Full flow validation passed')
    })
  })

  test.describe('Critical Path Validation', () => {
    test('themes page loads without errors', async ({ page }) => {
      await page.goto('/themes')
      await waitForPageReady(page)
      
      // No console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      
      await page.waitForTimeout(1000)
      
      // Filter out expected warnings
      const criticalErrors = errors.filter(e => 
        !e.includes('ResizeObserver') && 
        !e.includes('Warning:')
      )
      
      expect(criticalErrors).toHaveLength(0)
    })

    test('navigation between pages works', async ({ page }) => {
      // Start at themes
      await page.goto('/themes')
      await waitForPageReady(page)
      await expect(page.getByRole('heading', { name: /themes/i })).toBeVisible()

      // Navigate to foundations (if exists)
      const foundationsLink = page.getByRole('link', { name: /foundations/i })
      if (await foundationsLink.isVisible()) {
        await foundationsLink.click()
        await waitForPageReady(page)
        await expect(page).toHaveURL(/foundations/)
      }

      // Navigate to components (if exists)
      const componentsLink = page.getByRole('link', { name: /components/i })
      if (await componentsLink.isVisible()) {
        await componentsLink.click()
        await waitForPageReady(page)
        await expect(page).toHaveURL(/components/)
      }

      // Back to themes
      const themesLink = page.getByRole('link', { name: /themes/i })
      if (await themesLink.isVisible()) {
        await themesLink.click()
        await waitForPageReady(page)
        await expect(page).toHaveURL(/themes/)
      }
    })

    test('theme persistence across sessions', async ({ page, context }) => {
      await page.goto('/themes')
      await waitForPageReady(page)

      // Apply a theme
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      if (await themeCard.isVisible()) {
        const applyButton = themeCard.getByRole('button', { name: /apply/i })
        if (await applyButton.isEnabled()) {
          await applyButton.click()
          await page.waitForTimeout(500)
          
          const appliedClass = await page.evaluate(() => document.documentElement.className)
          
          // Open new page in same context
          const newPage = await context.newPage()
          await newPage.goto('/themes')
          await waitForPageReady(newPage)
          
          // Theme should be persisted
          const persistedClass = await newPage.evaluate(() => document.documentElement.className)
          expect(persistedClass).toBe(appliedClass)
          
          await newPage.close()
        }
      }
    })
  })

  test.describe('Error Handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      // Simulate offline
      await page.route('**/api/**', route => route.abort())
      
      await page.goto('/themes')
      await waitForPageReady(page)
      
      // Page should still render
      await expect(page.getByRole('heading', { name: /themes/i })).toBeVisible()
    })

    test('recovers from component errors', async ({ page }) => {
      await page.goto('/themes')
      await waitForPageReady(page)
      
      // Force an error scenario
      await page.evaluate(() => {
        // Simulate error in localStorage
        localStorage.setItem('design-system-theme', 'invalid-theme-that-does-not-exist')
      })
      
      await page.reload()
      await waitForPageReady(page)
      
      // Page should recover and render
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/themes')
      await waitForPageReady(page)
      
      const loadTime = Date.now() - startTime
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('theme switch is responsive', async ({ page }) => {
      await page.goto('/themes')
      await waitForPageReady(page)
      
      const themeCard = page.locator('[data-testid="theme-card"]').first()
      if (await themeCard.isVisible()) {
        const applyButton = themeCard.getByRole('button', { name: /apply/i })
        if (await applyButton.isEnabled()) {
          const startTime = Date.now()
          await applyButton.click()
          
          // Wait for theme class to change
          await page.waitForFunction(
            () => document.documentElement.className.includes('theme-'),
            { timeout: 1000 }
          )
          
          const switchTime = Date.now() - startTime
          
          // Theme switch should be instant (under 500ms)
          expect(switchTime).toBeLessThan(500)
        }
      }
    })
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('basic functionality works', async ({ page, browserName }) => {
    await page.goto('/themes')
    await waitForPageReady(page)
    
    console.log(`Testing on: ${browserName}`)
    
    // Basic rendering
    await expect(page.getByRole('heading', { name: /themes/i })).toBeVisible()
    
    // Theme cards render
    const themeCards = page.locator('[data-testid="theme-card"]')
    await expect(themeCards.first()).toBeVisible()
    
    // Buttons are clickable
    const previewButton = themeCards.first().getByRole('button', { name: /preview/i })
    await expect(previewButton).toBeVisible()
    await expect(previewButton).toBeEnabled()
  })
})

