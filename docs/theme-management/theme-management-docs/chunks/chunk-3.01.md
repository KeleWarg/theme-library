# Chunk 3.01 — Theme Editor Layout

## Purpose
Create the main editor page layout with header, sidebar, editor panel, and optional preview panel.

---

## Inputs
- Theme ID (from URL params)
- Theme service (from chunk 1.02)

## Outputs
- `src/pages/ThemeEditor.jsx` (consumed by router)
- `src/components/themes/editor/EditorLayout.jsx`

---

## Dependencies
- Chunk 1.02 (theme service for loading data)

---

## Implementation Notes

### Key Considerations
- Three-panel layout: sidebar | editor | preview (collapsible)
- Header with theme name, status, save/publish actions
- Unsaved changes indicator
- Auto-save after configurable interval

### Gotchas
- Preview panel should be toggleable
- Handle loading and error states
- Preserve scroll position on re-render

### Algorithm/Approach
1. Load theme and tokens on mount
2. Initialize editor state with loaded data
3. Track changes for unsaved indicator
4. Render three-column layout with responsive behavior

---

## Files Created
- `src/pages/ThemeEditor.jsx`
- `src/components/themes/editor/EditorLayout.jsx`
- `src/components/themes/editor/EditorHeader.jsx`

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Theme Name (editable)  │ Draft │ Undo Redo │ Save │ Publish │
├────────────┬─────────────────────────────┬───────────────────┤
│            │                             │                   │
│  Category  │     Token Editor Panel      │   Preview Panel   │
│  Sidebar   │                             │    (toggleable)   │
│            │                             │                   │
│  - Colors  │  [Token rows here]          │  [Live preview]   │
│  - Type    │                             │                   │
│  - Spacing │                             │                   │
│            │                             │                   │
└────────────┴─────────────────────────────┴───────────────────┘
```

---

## Tests

### Unit Tests
- [ ] Renders loading state initially
- [ ] Renders error if theme not found
- [ ] Renders layout with loaded theme
- [ ] Shows unsaved indicator when changes made
- [ ] Auto-save triggers after interval

### Verification
- [ ] Navigate to /themes/:id/edit
- [ ] Theme data loads correctly
- [ ] Layout responsive at different widths

---

## Time Estimate
2 hours
