# Chunk 2.03 — Token Mapping Step

## Purpose
Create the token mapping interface where users review and adjust category assignments.

---

## Inputs
- Parsed tokens array (from FileUploadStep via wizard)
- `groupTokensByCategory` function (from chunk 1.03)

## Outputs
- `src/components/themes/import/TokenMappingStep.jsx` (consumed by chunk 2.04)
- Updated tokens array with user overrides

---

## Dependencies
- Chunk 1.03 must be complete (grouping function)

---

## Implementation Notes

### Key Considerations
- Expandable category sections
- Category override dropdown per token
- Warning banner for "other" category tokens
- Real-time summary update on changes

### Gotchas
- Override state must be preserved when category changes
- Summary should reflect current state, not original
- Large token lists need virtualization (future)

### Algorithm/Approach
1. Group tokens by category on mount
2. Track overrides in local state
3. Apply overrides when computing grouped view
4. Notify parent of changes via callback

---

## Files Created
- `src/components/themes/import/TokenMappingStep.jsx`
- `src/components/themes/import/TokenMappingStep.test.jsx`

---

## Key Props

```typescript
interface TokenMappingStepProps {
  tokens: ParsedToken[]
  onUpdateMapping: (updatedTokens: ParsedToken[]) => void
}
```

---

## UI Structure

```
┌─────────────────────────────────────────────┐
│ ⚠️ X tokens couldn't be categorized         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ▶ Color (24 tokens)                         │
├─────────────────────────────────────────────┤
│   Color/Button/primary-bg    [Color    ▼]   │
│   Color/Button/primary-text  [Color    ▼]   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Summary                                     │
│ Color: 24  Typography: 12  Spacing: 8       │
└─────────────────────────────────────────────┘
```

---

## Tests

### Unit Tests
- [ ] Renders categories with correct counts
- [ ] Expands/collapses category on click
- [ ] Shows token path and name
- [ ] Dropdown changes token category
- [ ] Summary updates after change
- [ ] Shows warning when "other" has tokens
- [ ] Calls onUpdateMapping on change

### Verification
- [ ] Works with real parsed token data
- [ ] Performance acceptable with 100+ tokens

---

## Time Estimate
2.5 hours
