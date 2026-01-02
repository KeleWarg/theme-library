# Chunk 5.02 — ThemeCard Updates

## Purpose
Update ThemeCard component to add edit, delete, and duplicate actions.

---

## Inputs
- Theme object
- Action callbacks (onEdit, onDelete, onDuplicate)

## Outputs
- Updated `src/components/ui/ThemeCard.jsx`

---

## Dependencies
- Chunk 5.01 (parent page provides callbacks)

---

## Implementation Notes

### Key Considerations
- Dropdown menu for actions (three-dot menu)
- Edit navigates to editor
- Delete with confirmation
- Duplicate opens creation wizard
- Hide actions for static themes

### Gotchas
- Click outside should close dropdown
- Confirm dialog for delete
- Visual difference for active theme

### Algorithm/Approach
Add dropdown menu component with action buttons.

---

## Files Created
- Updated `src/components/ui/ThemeCard.jsx`

---

## UI Addition

```
┌─────────────────────────────────────────┐
│ Theme Name          [Active] [Preview] [⋮]│
│                               ┌────────┐ │
│ [Color Swatches]              │ Edit   │ │
│                               │ Dup    │ │
│                               │ Delete │ │
│ Status: Published             └────────┘ │
└─────────────────────────────────────────┘
```

---

## Tests

### Unit Tests
- [ ] Renders menu button
- [ ] Menu opens on click
- [ ] Edit calls onEdit
- [ ] Duplicate calls onDuplicate
- [ ] Delete shows confirmation
- [ ] Delete calls onDelete after confirm
- [ ] Menu hidden for static themes

### Verification
- [ ] Edit navigates to editor
- [ ] Delete removes theme
- [ ] Duplicate opens wizard

---

## Time Estimate
1.5 hours
