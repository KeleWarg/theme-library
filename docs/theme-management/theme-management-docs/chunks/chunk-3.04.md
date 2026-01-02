# Chunk 3.04 — Type-Specific Editors

## Purpose
Create specialized editor components for each token type (color picker, number input, shadow editor).

---

## Inputs
- Token value object
- Token type
- onChange callback

## Outputs
- `src/components/themes/editor/ColorPicker.jsx`
- `src/components/themes/editor/NumberInput.jsx`
- `src/components/themes/editor/ShadowEditor.jsx`
- `src/components/themes/editor/ValueEditor.jsx` (router)

---

## Dependencies
- Chunk 3.03 (token row uses these editors)

---

## Implementation Notes

### Key Considerations
- ColorPicker: Swatch, hex input, RGB/HSL modes
- NumberInput: Value with unit selector
- ShadowEditor: X, Y, blur, spread, color fields
- ValueEditor: Routes to correct editor by type

### Gotchas
- Color formats need validation (hex format)
- Number units should be selectable
- Shadow is a composite value

### Algorithm/Approach
Type-specific controlled inputs with validation and change callbacks.

---

## Files Created
- `src/components/themes/editor/ColorPicker.jsx`
- `src/components/themes/editor/NumberInput.jsx`
- `src/components/themes/editor/ShadowEditor.jsx`
- `src/components/themes/editor/ValueEditor.jsx`

---

## Color Picker UI

```
┌────────────────────────────┐
│  ████████████████████████  │ ← Gradient area
├────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Hue slider
├────────────────────────────┤
│  HEX  │ #657E79            │
│  RGB  │ 101, 126, 121      │
│  HSL  │ 168°, 11%, 45%     │
└────────────────────────────┘
```

---

## Tests

### Unit Tests
- [ ] ColorPicker shows correct initial value
- [ ] ColorPicker updates on hex input
- [ ] NumberInput handles unit changes
- [ ] ShadowEditor updates composite value
- [ ] ValueEditor routes to correct component

### Verification
- [ ] Color picker visually correct
- [ ] Hex validation works
- [ ] All changes propagate to parent

---

## Time Estimate
3 hours
