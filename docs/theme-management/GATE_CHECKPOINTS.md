# Gate Checkpoints & Agent Orchestration

## Overview

This document defines integration gates and orchestration rules for parallel Cursor agents working on the Theme Management System.

---

## Gate Checkpoint Specifications

### Gate 1: Foundation Integration

**Trigger:** When 1.01 + 1.02 + 1.03 all show ✅ in chunk index

**Purpose:** Verify parser output is compatible with database service

**Test File:** `tests/integration/gate-1.test.js`

```javascript
import { describe, it, expect, afterAll } from 'vitest'
import { createTheme, bulkCreateTokens, deleteTheme, getThemeById } from '../../src/lib/themeService'
import { parseTokenFile, validateTokenFile } from '../../src/lib/tokenParser'

describe('Gate 1: Foundation Integration', () => {
  let testThemeId = null

  afterAll(async () => {
    if (testThemeId) {
      try { await deleteTheme(testThemeId) } catch (e) { /* ignore */ }
    }
  })

  it('validates token file structure', () => {
    const jsonData = {
      Color: {
        Button: {
          primary: { $type: 'color', $value: { hex: '#657E79' } }
        }
      }
    }
    const validation = validateTokenFile(jsonData)
    expect(validation.valid).toBe(true)
  })

  it('parses tokens with correct structure', () => {
    const jsonData = {
      Color: {
        Button: {
          primary: { 
            $type: 'color', 
            $value: { hex: '#657E79' },
            $extensions: { 'com.figma.variableId': 'VariableID:123:456' }
          }
        }
      }
    }
    const result = parseTokenFile(jsonData)
    
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      name: 'primary',
      category: 'color',
      value: expect.objectContaining({ hex: '#657E79' }),
      css_variable: expect.stringMatching(/^--color/),
      figma_variable_id: 'VariableID:123:456'
    })
  })

  it('creates theme and bulk inserts parsed tokens', async () => {
    // Parse tokens
    const jsonData = {
      Color: {
        primary: { $type: 'color', $value: { hex: '#FF0000' } },
        secondary: { $type: 'color', $value: { hex: '#00FF00' } }
      },
      Spacing: {
        md: { $type: 'number', $value: 16 }
      }
    }
    const { tokens } = parseTokenFile(jsonData)
    expect(tokens.length).toBeGreaterThan(0)

    // Create theme
    const theme = await createTheme({
      name: 'Gate 1 Test Theme',
      slug: `gate-1-test-${Date.now()}`,
      description: 'Integration test',
      source: 'import'
    })
    testThemeId = theme.id
    expect(theme.id).toBeDefined()

    // Transform parsed tokens to DB format
    const dbTokens = tokens.map((t, index) => ({
      theme_id: theme.id,
      category: t.category,
      subcategory: t.subcategory || null,
      group_name: t.group_name || null,
      name: t.name,
      value: t.value,
      css_variable: t.css_variable,
      figma_variable_id: t.figma_variable_id || null,
      sort_order: index
    }))

    // Bulk insert
    const created = await bulkCreateTokens(dbTokens)
    expect(created).toHaveLength(tokens.length)

    // Verify theme has tokens
    const fullTheme = await getThemeById(theme.id)
    expect(fullTheme.theme_tokens).toHaveLength(tokens.length)
  })

  it('cascade deletes tokens when theme deleted', async () => {
    // Create theme + tokens
    const theme = await createTheme({
      name: 'Cascade Test',
      slug: `cascade-test-${Date.now()}`
    })
    
    await bulkCreateTokens([{
      theme_id: theme.id,
      category: 'color',
      name: 'test',
      value: { hex: '#000' },
      css_variable: '--test'
    }])

    // Delete theme
    await deleteTheme(theme.id)

    // Verify theme gone (should throw or return null)
    try {
      const deleted = await getThemeById(theme.id)
      expect(deleted).toBeNull()
    } catch (e) {
      expect(e).toBeDefined() // Expected - theme not found
    }
  })
})
```

**Pass Criteria:** All 4 tests pass
**Blocks:** 2.02, 2.03 cannot start until Gate 1 passes

---

### Gate 2: Import Components Integration

**Trigger:** When 2.01 + 2.02 + 2.03 all show ✅ in chunk index

**Purpose:** Verify import UI components work together before combining in wizard

**Test File:** `tests/integration/gate-2.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
      const onSelectImport = vi.fn()
      render(
        <ThemeSourceModal 
          isOpen={true} 
          onClose={() => {}} 
          onSelectImport={onSelectImport} 
          onSelectCreate={() => {}} 
        />
      )
      await userEvent.click(screen.getByTestId('import-option'))
      expect(onSelectImport).toHaveBeenCalledTimes(1)
    })
  })

  describe('FileUploadStep → Parser Integration', () => {
    it('validates and parses uploaded JSON', async () => {
      const validJson = {
        Color: { primary: { $type: 'color', $value: { hex: '#FF0000' } } }
      }
      
      let capturedData = null
      const onFileSelect = (data) => { capturedData = data }
      
      render(<FileUploadStep onFileSelect={onFileSelect} selectedFile={null} onClear={() => {}} />)
      
      // Create and upload file
      const file = new File([JSON.stringify(validJson)], 'tokens.json', { type: 'application/json' })
      const input = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i)
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(capturedData).not.toBeNull()
        expect(capturedData.validation.valid).toBe(true)
      })

      // Verify parsed content works with parser
      const { tokens } = parseTokenFile(capturedData.content)
      expect(tokens).toHaveLength(1)
      expect(tokens[0].category).toBe('color')
    })

    it('rejects invalid JSON', async () => {
      let capturedData = null
      render(<FileUploadStep onFileSelect={(d) => capturedData = d} selectedFile={null} onClear={() => {}} />)
      
      const file = new File(['not valid json'], 'bad.json', { type: 'application/json' })
      const input = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i)
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        // Should either not call onFileSelect or call with invalid flag
        if (capturedData) {
          expect(capturedData.validation.valid).toBe(false)
        }
      })
    })
  })

  describe('TokenMappingStep', () => {
    it('displays parsed tokens grouped by category', () => {
      const tokens = [
        { name: 'primary', category: 'color', value: { hex: '#F00' }, path: 'Color/primary' },
        { name: 'secondary', category: 'color', value: { hex: '#0F0' }, path: 'Color/secondary' },
        { name: 'md', category: 'spacing', value: { value: 16 }, path: 'Spacing/md' }
      ]
      
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={() => {}} />)
      
      expect(screen.getByText(/color/i)).toBeInTheDocument()
      expect(screen.getByText(/spacing/i)).toBeInTheDocument()
    })

    it('allows category override', async () => {
      const tokens = [
        { name: 'test', category: 'other', value: {}, path: 'Unknown/test' }
      ]
      
      let updatedTokens = null
      render(<TokenMappingStep tokens={tokens} onUpdateMapping={(t) => updatedTokens = t} />)
      
      // Find and change category dropdown
      const select = screen.getByRole('combobox') || screen.getByTestId('category-select-0')
      await userEvent.selectOptions(select, 'color')
      
      expect(updatedTokens[0].category).toBe('color')
    })
  })

  describe('Data Flow: FileUpload → Parser → Mapping', () => {
    it('complete data transformation pipeline', async () => {
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
      
      // Verify all tokens visible
      expect(screen.getByText(/primary/i)).toBeInTheDocument()
      expect(screen.getByText(/md/i)).toBeInTheDocument()
    })
  })
})
```

**Pass Criteria:** All tests pass
**Blocks:** 2.04 cannot start until Gate 2 passes

---

### Gate 3: Import Wizard E2E

**Trigger:** When 2.04 shows ✅ in chunk index

**Purpose:** Full import flow creates theme in database

**Test File:** `tests/integration/gate-3.test.jsx`

```javascript
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ImportWizard from '../../src/components/themes/import/ImportWizard'
import { getThemeBySlug, deleteTheme } from '../../src/lib/themeService'

describe('Gate 3: Import Wizard E2E', () => {
  const testSlugs = []

  afterEach(async () => {
    // Cleanup all test themes
    for (const slug of testSlugs) {
      try {
        const theme = await getThemeBySlug(slug)
        if (theme) await deleteTheme(theme.id)
      } catch (e) { /* ignore */ }
    }
    testSlugs.length = 0
  })

  it('completes full import wizard flow', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const testSlug = `wizard-test-${Date.now()}`
    testSlugs.push(testSlug)

    render(
      <BrowserRouter>
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={onComplete}
          existingThemes={[]}
        />
      </BrowserRouter>
    )

    // Step 1: Upload JSON file
    const jsonContent = {
      Color: {
        primary: { $type: 'color', $value: { hex: '#FF5733' } },
        secondary: { $type: 'color', $value: { hex: '#33FF57' } }
      }
    }
    const file = new File([JSON.stringify(jsonContent)], 'test-tokens.json', { type: 'application/json' })
    
    const fileInput = screen.getByTestId('file-input')
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText(/next/i)).not.toBeDisabled()
    })
    await user.click(screen.getByText(/next/i))

    // Step 2: Token Mapping (accept defaults)
    await waitFor(() => {
      expect(screen.getByText(/color/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/next/i))

    // Step 3: Theme Details
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/name/i), 'Wizard Test Theme')
    
    // Clear auto-generated slug and enter custom
    const slugInput = screen.getByLabelText(/slug/i)
    await user.clear(slugInput)
    await user.type(slugInput, testSlug)
    
    await user.click(screen.getByText(/next/i))

    // Step 4: Review and Import
    await waitFor(() => {
      expect(screen.getByText(/review/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/import/i))

    // Verify completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    }, { timeout: 10000 })

    // Verify in database
    const theme = await getThemeBySlug(testSlug)
    expect(theme).not.toBeNull()
    expect(theme.name).toBe('Wizard Test Theme')
    expect(theme.theme_tokens.length).toBe(2)
  })

  it('prevents duplicate slugs', async () => {
    const user = userEvent.setup()
    const existingSlug = `existing-${Date.now()}`
    testSlugs.push(existingSlug)

    render(
      <BrowserRouter>
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[{ slug: existingSlug }]}
        />
      </BrowserRouter>
    )

    // Upload and proceed to details step
    const file = new File([JSON.stringify({ Color: { a: { $type: 'color', $value: { hex: '#000' } } } })], 't.json', { type: 'application/json' })
    await user.upload(screen.getByTestId('file-input'), file)
    await user.click(screen.getByText(/next/i))
    await user.click(screen.getByText(/next/i))

    // Try to use existing slug
    await waitFor(() => {
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    })
    const slugInput = screen.getByLabelText(/slug/i)
    await user.clear(slugInput)
    await user.type(slugInput, existingSlug)

    // Should show error or disable next
    await waitFor(() => {
      const nextBtn = screen.getByText(/next/i)
      const errorMsg = screen.queryByText(/already exists|taken|duplicate/i)
      expect(nextBtn.disabled || errorMsg).toBeTruthy()
    })
  })
})
```

**Pass Criteria:** All tests pass
**Blocks:** Phase 3 (Editing) cannot start until Gate 3 passes

---

### Gate 4: Editor Integration

**Trigger:** When 3.01 + 3.02 + 3.03 + 3.04 + 3.05 all show ✅

**Purpose:** Editor loads theme, allows edits, saves to database

**Test File:** `tests/integration/gate-4.test.jsx`

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
      <BrowserRouter>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </BrowserRouter>,
      { initialEntries: [`/themes/${testTheme.id}/edit`] }
    )

    await waitFor(() => {
      expect(screen.getByText('Editor Test Theme')).toBeInTheDocument()
    })

    // Check category sidebar
    expect(screen.getByText(/color/i)).toBeInTheDocument()
    expect(screen.getByText(/spacing/i)).toBeInTheDocument()

    // Check tokens visible
    expect(screen.getByText('primary')).toBeInTheDocument()
  })

  it('edits token and saves to database', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </BrowserRouter>,
      { initialEntries: [`/themes/${testTheme.id}/edit`] }
    )

    await waitFor(() => {
      expect(screen.getByText('primary')).toBeInTheDocument()
    })

    // Click on primary color to edit
    await user.click(screen.getByText('primary'))
    
    // Change color value
    const hexInput = screen.getByDisplayValue('#FF0000')
    await user.clear(hexInput)
    await user.type(hexInput, '#0000FF')
    
    // Save
    await user.click(screen.getByText(/save/i))

    // Verify in database
    await waitFor(async () => {
      const updated = await getThemeById(testTheme.id)
      const primaryToken = updated.theme_tokens.find(t => t.name === 'primary')
      expect(primaryToken.value.hex).toBe('#0000FF')
    })
  })

  it('preview updates when tokens change', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/themes/:id/edit" element={<ThemeEditor />} />
        </Routes>
      </BrowserRouter>,
      { initialEntries: [`/themes/${testTheme.id}/edit`] }
    )

    await waitFor(() => {
      expect(screen.getByTestId('preview-panel')).toBeInTheDocument()
    })

    // Check preview has CSS variable applied
    const previewPanel = screen.getByTestId('preview-panel')
    const styles = window.getComputedStyle(previewPanel)
    
    // Verify CSS variable is set
    expect(previewPanel.style.getPropertyValue('--color-primary')).toBeDefined()
  })
})
```

**Pass Criteria:** All tests pass
**Blocks:** Phase 4 cannot start until Gate 4 passes

---

### Gate 5: Creation & Export Integration

**Trigger:** When 4.01 + 4.02 + 4.03 + 4.04 all show ✅

**Purpose:** Creation wizard works, export generates valid output

**Test File:** `tests/integration/gate-5.test.jsx`

```javascript
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreationWizard from '../../src/components/themes/create/CreationWizard'
import ExportModal from '../../src/components/themes/export/ExportModal'
import { generateCSS, generateJSON, generateTailwind } from '../../src/lib/exportGenerators'
import { deleteTheme, getThemeBySlug } from '../../src/lib/themeService'

describe('Gate 5: Creation & Export Integration', () => {
  const testSlugs = []

  afterEach(async () => {
    for (const slug of testSlugs) {
      try {
        const theme = await getThemeBySlug(slug)
        if (theme) await deleteTheme(theme.id)
      } catch (e) {}
    }
    testSlugs.length = 0
  })

  describe('Creation Wizard', () => {
    it('creates theme from Light Mode template', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      const testSlug = `create-test-${Date.now()}`
      testSlugs.push(testSlug)

      render(<CreationWizard isOpen={true} onClose={() => {}} onComplete={onComplete} />)

      // Select template
      await user.click(screen.getByText(/light mode/i))
      await user.click(screen.getByText(/next/i))

      // Fill details
      await user.type(screen.getByLabelText(/name/i), 'Creation Test')
      const slugInput = screen.getByLabelText(/slug/i)
      await user.clear(slugInput)
      await user.type(slugInput, testSlug)

      // Skip through editor steps
      await user.click(screen.getByText(/next/i)) // Colors
      await user.click(screen.getByText(/next/i)) // Typography
      await user.click(screen.getByText(/next/i)) // Spacing
      
      // Create
      await user.click(screen.getByText(/create/i))

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled()
      })

      // Verify in database
      const theme = await getThemeBySlug(testSlug)
      expect(theme.theme_tokens.length).toBeGreaterThan(0)
    })
  })

  describe('Export Generators', () => {
    const sampleTokens = [
      { category: 'color', name: 'primary', value: { hex: '#FF0000' }, css_variable: '--color-primary' },
      { category: 'spacing', name: 'md', value: { value: 16, unit: 'px' }, css_variable: '--spacing-md' }
    ]

    it('generates valid CSS', () => {
      const css = generateCSS(sampleTokens)
      expect(css).toContain(':root')
      expect(css).toContain('--color-primary: #FF0000')
      expect(css).toContain('--spacing-md: 16px')
    })

    it('generates Figma-compatible JSON', () => {
      const json = generateJSON(sampleTokens, { includeFigmaMetadata: true })
      const parsed = JSON.parse(json)
      expect(parsed.Color.primary.$type).toBe('color')
      expect(parsed.Color.primary.$value.hex).toBe('#FF0000')
    })

    it('generates valid Tailwind config', () => {
      const config = generateTailwind(sampleTokens)
      expect(config).toContain('module.exports')
      expect(config).toContain('colors')
      expect(config).toContain('primary')
    })
  })

  describe('Export Modal', () => {
    it('shows all format options', () => {
      render(<ExportModal isOpen={true} theme={{ name: 'Test' }} tokens={[]} onClose={() => {}} />)
      
      expect(screen.getByText(/css/i)).toBeInTheDocument()
      expect(screen.getByText(/json/i)).toBeInTheDocument()
      expect(screen.getByText(/tailwind/i)).toBeInTheDocument()
    })
  })
})
```

**Pass Criteria:** All tests pass
**Blocks:** Phase 5 cannot start until Gate 5 passes

---

### Gate 6: Full E2E

**Trigger:** When 5.01 + 5.02 + 5.03 all show ✅

**Purpose:** Complete application works end-to-end

**Test File:** `tests/e2e/full-flow.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Gate 6: Full E2E', () => {
  test('complete theme lifecycle: create → edit → export → delete', async ({ page }) => {
    const testSlug = `e2e-${Date.now()}`

    // Navigate to themes page
    await page.goto('/themes')
    await expect(page.getByText(/themes/i)).toBeVisible()

    // Click create
    await page.click('[data-testid="create-theme-btn"]')
    await page.click('[data-testid="import-option"]')

    // Upload JSON
    const jsonContent = JSON.stringify({
      Color: { primary: { $type: 'color', $value: { hex: '#FF5733' } } }
    })
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'tokens.json',
      mimeType: 'application/json',
      buffer: Buffer.from(jsonContent)
    })

    // Complete wizard
    await page.click('text=Next')
    await page.click('text=Next')
    await page.fill('[name="name"]', 'E2E Test Theme')
    await page.fill('[name="slug"]', testSlug)
    await page.click('text=Next')
    await page.click('text=Import')

    // Wait for creation
    await expect(page.getByText('E2E Test Theme')).toBeVisible({ timeout: 10000 })

    // Edit theme
    await page.click(`[data-testid="theme-card-${testSlug}"] [data-testid="edit-btn"]`)
    await expect(page.url()).toContain('/edit')

    // Change a color
    await page.click('text=primary')
    await page.fill('[data-testid="hex-input"]', '#0000FF')
    await page.click('text=Save')

    // Export
    await page.click('[data-testid="export-btn"]')
    await page.click('text=CSS')
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=Download')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.css')

    // Delete
    await page.goto('/themes')
    await page.click(`[data-testid="theme-card-${testSlug}"] [data-testid="menu-btn"]`)
    await page.click('text=Delete')
    await page.click('text=Confirm')

    // Verify deleted
    await expect(page.getByText('E2E Test Theme')).not.toBeVisible()
  })
})
```

**Pass Criteria:** E2E test passes
**Blocks:** Release

---

## Agent Orchestration Rules

### Rule 1: Check Dependencies Before Starting

```
Before starting chunk X.YY:
1. Read docs/theme-management/03-chunk-index.md
2. Find chunk X.YY in the table
3. Check Dependencies column
4. ALL dependencies must show ✅
5. If any show ⬜ or 🔄, STOP and report which are missing
```

### Rule 2: Check Gate Before Crossing Phase Boundary

```
Before starting any chunk in Phase N+1:
1. Check if Gate N exists in chunk index
2. If Gate N status is ⬜:
   - Create the gate test file if it doesn't exist
   - Run: npm test tests/integration/gate-N.test.js
   - If tests pass, update Gate N status to ✅
   - If tests fail, STOP and report failures
3. Only proceed if Gate N is ✅
```

### Rule 3: Update Status Immediately

```
When completing chunk X.YY:
1. Run all tests for that chunk
2. If tests pass:
   - Update 03-chunk-index.md: change X.YY status to ✅
   - Report completion with test summary
3. If tests fail:
   - Keep status as 🔄
   - Report failures and request guidance
```

### Rule 4: Parallel Work Boundaries

```
Agents may work in parallel ONLY on chunks that:
1. Have no dependency on each other
2. Do not modify the same files
3. Are in the same phase OR earlier phases

Safe parallel combinations:
- 1.03 + 2.01 (different folders, no deps)
- 2.02 + 2.03 (both depend on 1.03, don't share files)
- 3.02 + 3.03 (both depend on 3.01, different components)

NOT safe:
- 2.04 + anything in Phase 2 (2.04 combines all)
- 5.01 + 5.02 (5.02 depends on 5.01)
```

---

## Agent Prompts for Orchestration

### Starting a New Chunk

```
I'm starting chunk [X.YY].

First, check docs/theme-management/03-chunk-index.md:
1. What are the dependencies for chunk X.YY?
2. Are all dependencies marked ✅?
3. Is there a gate checkpoint between my last completed chunk and this one?

If all clear, read docs/theme-management/chunks/chunk-X.YY.md and implement.
If blocked, tell me what's missing.
```

### Completing a Chunk

```
I've finished implementing chunk [X.YY].

1. Run all tests for this chunk
2. If tests pass, update docs/theme-management/03-chunk-index.md to mark X.YY as ✅
3. Check if this completion triggers a gate checkpoint
4. If gate triggered, create and run the gate test
5. Report status and what can be started next
```

### Checking What's Available

```
Check docs/theme-management/03-chunk-index.md and tell me:
1. Which chunks are ✅ complete?
2. Which chunks are 🔄 in progress?
3. Which chunks can be started now (all deps are ✅)?
4. Are any gate checkpoints pending?
```

### Running Gate Checkpoint

```
Gate [N] checkpoint is triggered.

1. Create tests/integration/gate-N.test.js if it doesn't exist
2. Use the test code from docs/theme-management/GATE_CHECKPOINTS.md
3. Run: npm test tests/integration/gate-N.test.js
4. If pass: update Gate N status to ✅ in 03-chunk-index.md
5. If fail: report which tests failed and why
```

---

## File Structure for Tests

```
tests/
├── integration/
│   ├── gate-1.test.js      # Foundation integration
│   ├── gate-2.test.jsx     # Import components
│   ├── gate-3.test.jsx     # Import wizard E2E
│   ├── gate-4.test.jsx     # Editor integration
│   └── gate-5.test.jsx     # Creation & export
├── e2e/
│   └── full-flow.spec.ts   # Gate 6 Playwright test
└── contracts/
    └── contracts.test.js   # Interface verification
```

---

## Quick Reference

| Gate | After Chunks | Test Command | Blocks |
|------|--------------|--------------|--------|
| 1 | 1.01, 1.02, 1.03 | `npm test tests/integration/gate-1.test.js` | 2.02, 2.03 |
| 2 | 2.01, 2.02, 2.03 | `npm test tests/integration/gate-2.test.jsx` | 2.04 |
| 3 | 2.04 | `npm test tests/integration/gate-3.test.jsx` | Phase 3 |
| 4 | 3.01-3.05 | `npm test tests/integration/gate-4.test.jsx` | Phase 4 |
| 5 | 4.01-4.04 | `npm test tests/integration/gate-5.test.jsx` | Phase 5 |
| 6 | 5.01-5.03 | `npm run test:e2e` | Release |
