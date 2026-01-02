# Chunk 2.04 — Import Wizard

## Purpose
Combine all import steps into a complete wizard with navigation, state management, and database persistence.

---

## Inputs
- FileUploadStep component (from chunk 2.02)
- TokenMappingStep component (from chunk 2.03)
- Theme service functions (from chunk 1.02)
- Token parser (from chunk 1.03)

## Outputs
- `src/components/themes/import/ImportWizard.jsx` (consumed by chunk 5.01)
- `src/components/themes/import/ThemeDetailsStep.jsx`
- `src/components/themes/import/ImportReviewStep.jsx`
- Theme record + tokens in database

---

## Dependencies
- Chunk 1.02 (theme service)
- Chunk 1.03 (token parser)
- Chunk 2.01 (modal pattern/styles)
- Chunk 2.02 (file upload step)
- Chunk 2.03 (token mapping step)

---

## Implementation Notes

### Key Considerations
- 4-step wizard: Upload → Mapping → Details → Review
- Progress indicator showing current step
- Back/Next navigation with step validation
- State persists across step changes
- Final submit creates theme + bulk inserts tokens

### Gotchas
- Don't lose uploaded file data on back navigation
- Validate slug uniqueness before final step
- Show loading state during import
- Handle API errors gracefully

### Algorithm/Approach
1. Manage wizard state (currentStep, file data, tokens, details)
2. Validate step completion before allowing Next
3. On final submit: create theme, then bulk create tokens
4. Call onComplete callback with new theme

---

## Files Created
- `src/components/themes/import/ImportWizard.jsx`
- `src/components/themes/import/ThemeDetailsStep.jsx`
- `src/components/themes/import/ImportReviewStep.jsx`
- `src/components/themes/import/index.js` (exports)

---

## Wizard Steps

| Step | Component | Validation |
|------|-----------|------------|
| 1 | FileUploadStep | File selected and valid |
| 2 | TokenMappingStep | At least 1 token |
| 3 | ThemeDetailsStep | Name filled, slug unique |
| 4 | ImportReviewStep | None (review only) |

---

## Key Props

```typescript
interface ImportWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (theme: Theme) => void
  existingThemes: Theme[]  // For slug uniqueness check
}
```

---

## Tests

### Unit Tests
- [ ] Renders first step initially
- [ ] Next button disabled when step invalid
- [ ] Back button disabled on first step
- [ ] Step indicator shows correct state
- [ ] Navigates forward on Next click
- [ ] Navigates backward on Back click
- [ ] Shows loading during import
- [ ] Shows error on API failure
- [ ] Calls onComplete on success

### Integration Tests
- [ ] Full flow: upload → mapping → details → import
- [ ] Theme created in database
- [ ] Tokens created with correct theme_id
- [ ] Duplicate slug prevented

### Verification
- [ ] Complete import with real JSON file
- [ ] Verify theme appears in database
- [ ] Verify tokens appear in database

---

## Time Estimate
3 hours
