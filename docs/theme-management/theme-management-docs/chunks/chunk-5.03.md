# Chunk 5.03 — Comprehensive Tests

## Purpose
Add integration tests, E2E tests, and ensure comprehensive test coverage.

---

## Inputs
- All components and services
- Test fixtures (JSON files)

## Outputs
- Integration test files
- E2E test files (Playwright)
- CI configuration

---

## Dependencies
- All previous chunks complete

---

## Implementation Notes

### Key Considerations
- Integration tests for multi-component flows
- E2E tests for critical user journeys
- Database tests (with test DB or mocks)
- 80% code coverage target

### Gotchas
- E2E tests need running dev server
- Database tests need isolation
- Mock Supabase for unit tests

### Algorithm/Approach
Layered testing: unit → integration → E2E

---

## Files Created
- `src/components/themes/import/ImportWizard.integration.test.jsx`
- `e2e/themes.spec.ts`
- `playwright.config.ts`
- `.github/workflows/test.yml`

---

## Test Coverage

### Unit Tests (per chunk)
Already defined in each chunk spec.

### Integration Tests
- [ ] Import wizard full flow
- [ ] Theme editor load → edit → save
- [ ] Export generates valid output

### E2E Tests
- [ ] Create theme via import
- [ ] Edit existing theme
- [ ] Export theme
- [ ] Delete theme

---

## E2E Test Cases

```typescript
// e2e/themes.spec.ts
test('import theme from JSON', async ({ page }) => {
  await page.goto('/themes')
  await page.click('[data-testid="create-theme-btn"]')
  await page.click('[data-testid="import-option"]')
  // Upload file
  // Complete wizard
  // Verify theme appears
})

test('edit theme token', async ({ page }) => {
  await page.goto('/themes/[id]/edit')
  // Change color value
  // Save
  // Verify persisted
})

test('export theme as CSS', async ({ page }) => {
  // Open export modal
  // Select CSS
  // Download
  // Verify file contents
})
```

---

## CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## Tests

### Verification
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Coverage > 80%
- [ ] CI pipeline green

---

## Time Estimate
4 hours
