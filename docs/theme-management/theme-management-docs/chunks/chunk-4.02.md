# Chunk 4.02 — Token Editor Steps

## Purpose
Create the step components for editing tokens during theme creation (Color, Typography, Spacing).

---

## Inputs
- Current token values
- onChange callback

## Outputs
- `src/components/themes/create/ColorEditorStep.jsx`
- `src/components/themes/create/TypographyEditorStep.jsx`
- `src/components/themes/create/SpacingEditorStep.jsx`

---

## Dependencies
- Chunk 4.01 (parent wizard)
- Chunk 3.04 (type-specific editors)

---

## Implementation Notes

### Key Considerations
- Organized sections within each step
- Add/remove custom tokens
- Preset scales (typography, spacing)
- Live preview of changes

### Gotchas
- Preset application should confirm (replaces custom)
- Adding tokens needs name validation

### Algorithm/Approach
Step components wrapping type-specific editors with add/remove controls.

---

## Files Created
- `src/components/themes/create/ColorEditorStep.jsx`
- `src/components/themes/create/TypographyEditorStep.jsx`
- `src/components/themes/create/SpacingEditorStep.jsx`

---

## Color Editor Sections

- Brand Colors (primary, secondary)
- Background Colors
- Foreground/Text Colors
- Button Colors
- Status Colors (success, warning, error)

## Typography Editor Sections

- Font Families (heading, body, mono)
- Font Sizes (scale selection)
- Font Weights
- Line Heights

## Spacing Editor Sections

- Base Unit (4px or 8px)
- Spacing Scale
- Border Radius
- Shadow Definitions

---

## Tests

### Unit Tests
- [ ] Each step renders sections
- [ ] Preset buttons apply values
- [ ] Add token creates new entry
- [ ] Remove token with confirmation
- [ ] Changes propagate to parent

### Verification
- [ ] Walk through creation flow
- [ ] Verify created tokens correct

---

## Time Estimate
3 hours
