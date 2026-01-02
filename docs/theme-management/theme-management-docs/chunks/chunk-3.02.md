# Chunk 3.02 — Category Sidebar

## Purpose
Create the sidebar navigation for switching between token categories.

---

## Inputs
- Grouped tokens by category
- Current active category

## Outputs
- `src/components/themes/editor/CategorySidebar.jsx`

---

## Dependencies
- Chunk 3.01 (parent layout)

---

## Implementation Notes

### Key Considerations
- Show all categories with token counts
- Highlight active category
- Click to switch category
- Badge for categories with unsaved changes

### Gotchas
- Order categories consistently (color first, other last)
- Handle empty categories gracefully

### Algorithm/Approach
Static list of categories with dynamic counts from tokens.

---

## Files Created
- `src/components/themes/editor/CategorySidebar.jsx`

---

## UI Structure

```
┌─────────────────┐
│ Categories      │
├─────────────────┤
│ ● Colors    24  │  ← Active
│   Typography 12 │
│   Spacing    8  │
│   Shadows    4  │
│   Radius     6  │
│   Grid       4  │
│   Other      2  │
└─────────────────┘
```

---

## Tests

### Unit Tests
- [ ] Renders all categories
- [ ] Shows correct token counts
- [ ] Highlights active category
- [ ] Calls onSelectCategory on click

### Verification
- [ ] Visual appearance matches design
- [ ] Click switches displayed tokens

---

## Time Estimate
1.5 hours
