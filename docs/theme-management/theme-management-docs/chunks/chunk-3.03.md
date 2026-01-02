# Chunk 3.03 — Token Row Editor

## Purpose
Create the inline token row component for viewing and editing individual tokens.

---

## Inputs
- Token data object
- onUpdate callback
- onDelete callback

## Outputs
- `src/components/themes/editor/TokenRow.jsx`

---

## Dependencies
- Chunk 3.01 (parent layout)

---

## Implementation Notes

### Key Considerations
- Display token name, value preview, CSS variable
- Click to edit value inline
- Copy CSS variable to clipboard
- Delete with confirmation
- Drag handle for reordering (future)

### Gotchas
- Value display varies by type (color swatch vs text)
- Edit mode should focus input
- Escape cancels edit, Enter saves

### Algorithm/Approach
Row component with view/edit states. Type-specific value display.

---

## Files Created
- `src/components/themes/editor/TokenRow.jsx`

---

## UI Structure

```
┌────────────────────────────────────────────────────────────┐
│ ≡ │ primary-bg │ [████] #657E79 │ --color-btn-primary-bg │ 🗑 │
└────────────────────────────────────────────────────────────┘
  │       │             │                    │              │
Drag   Name          Value              CSS Var          Delete
```

---

## Tests

### Unit Tests
- [ ] Renders token name
- [ ] Renders type-appropriate value
- [ ] Shows CSS variable
- [ ] Copy button copies to clipboard
- [ ] Delete shows confirmation
- [ ] Calls onUpdate on value change
- [ ] Calls onDelete on confirm

### Verification
- [ ] Edit flow works end-to-end
- [ ] Changes persist after save

---

## Time Estimate
2.5 hours
