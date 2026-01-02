# Chunk 5.01 — Themes Page Integration

## Purpose
Update the existing Themes page to integrate all new theme management features.

---

## Inputs
- ThemeSourceModal (from chunk 2.01)
- ImportWizard (from chunk 2.04)
- CreationWizard (from chunk 4.01)
- Theme service (from chunk 1.02)

## Outputs
- Updated `src/pages/Themes.jsx`

---

## Dependencies
- Phase 2 complete (import flow)
- Phase 3 complete (editor)
- Phase 4 partial (creation wizard)

---

## Implementation Notes

### Key Considerations
- Load themes from database
- Fallback to static themes if DB fails
- "Create Theme" button in header
- Modal state management
- Navigation to editor

### Gotchas
- Need to merge DB themes with static themes
- Handle loading and error states
- Refresh list after create/import

### Algorithm/Approach
Enhance existing page with database integration and modal triggers.

---

## Files Created
- Updated `src/pages/Themes.jsx`

---

## State Management

```javascript
const [themes, setThemes] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)
const [showSourceModal, setShowSourceModal] = useState(false)
const [showImportWizard, setShowImportWizard] = useState(false)
const [showCreateWizard, setShowCreateWizard] = useState(false)
```

---

## Tests

### Unit Tests
- [ ] Renders create button
- [ ] Opens source modal on click
- [ ] Shows import wizard from modal
- [ ] Shows create wizard from modal
- [ ] Loads themes from database
- [ ] Shows error state on failure

### Integration Tests
- [ ] Full create → import → display flow

### Verification
- [ ] Page loads with themes
- [ ] Create flow works end-to-end
- [ ] New theme appears in list

---

## Time Estimate
2 hours
