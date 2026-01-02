# Chunk 4.03 — Export Modal

## Purpose
Create the export modal with format selection and options.

---

## Inputs
- Theme with tokens
- Export config (from 04-config-reference.md)

## Outputs
- `src/components/themes/export/ExportModal.jsx`
- `src/components/themes/export/FormatSelector.jsx`

---

## Dependencies
- Chunk 1.02 (load theme data)

---

## Implementation Notes

### Key Considerations
- Format options: CSS, JSON, Tailwind, SCSS
- Format-specific options (minify, scope, etc.)
- Preview of generated output
- Download and copy-to-clipboard

### Gotchas
- Large outputs need truncated preview
- Syntax highlighting for preview (optional)
- Filename should include theme name

### Algorithm/Approach
Modal with format tabs, options panel, preview area, and action buttons.

---

## Files Created
- `src/components/themes/export/ExportModal.jsx`
- `src/components/themes/export/FormatSelector.jsx`
- `src/components/themes/export/ExportOptions.jsx`

---

## UI Structure

```
┌─────────────────────────────────────────────┐
│ Export Theme                            X   │
├─────────────────────────────────────────────┤
│ [CSS] [JSON] [Tailwind] [SCSS]              │
├─────────────────────────────────────────────┤
│ Options:                                    │
│ ☐ Minify output                            │
│ ☐ Include comments                         │
│ Scope to class: [_____________]            │
├─────────────────────────────────────────────┤
│ Preview:                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ :root {                                 │ │
│ │   --color-primary: #657E79;             │ │
│ │   ...                                   │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│              [Copy] [Download]              │
└─────────────────────────────────────────────┘
```

---

## Tests

### Unit Tests
- [ ] Format tabs switch content
- [ ] Options update preview
- [ ] Copy button works
- [ ] Download triggers file save

### Verification
- [ ] Export each format
- [ ] Verify output is valid

---

## Time Estimate
1.5 hours
