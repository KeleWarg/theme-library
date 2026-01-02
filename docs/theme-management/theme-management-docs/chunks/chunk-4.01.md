# Chunk 4.01 — Creation Wizard

## Purpose
Create the wizard for building themes from scratch with template selection.

---

## Inputs
- Theme service (from chunk 1.02)
- Existing themes (for duplicate option)

## Outputs
- `src/components/themes/create/CreationWizard.jsx`
- `src/components/themes/create/TemplateSelector.jsx`

---

## Dependencies
- Chunk 1.02 (theme service)
- Chunk 2.01 (modal/wizard patterns)

---

## Implementation Notes

### Key Considerations
- Template options: Blank, Light Mode, Dark Mode, Duplicate Existing
- Templates pre-populate token defaults
- 5 steps: Info → Colors → Typography → Spacing → Review

### Gotchas
- Duplicate needs to load source theme's tokens
- Templates are hardcoded initial values
- Must validate at each step

### Algorithm/Approach
Similar to import wizard but with editor steps instead of file upload.

---

## Files Created
- `src/components/themes/create/CreationWizard.jsx`
- `src/components/themes/create/TemplateSelector.jsx`

---

## Template Presets

| Template | Description |
|----------|-------------|
| Blank | No pre-populated tokens |
| Light Mode | Standard light theme defaults |
| Dark Mode | Dark background, light text |
| Duplicate | Copy from existing theme |

---

## Tests

### Unit Tests
- [ ] Template selector shows all options
- [ ] Selecting template updates initial tokens
- [ ] Duplicate loads source theme
- [ ] Wizard navigation works
- [ ] Creates theme on completion

### Verification
- [ ] Create blank theme
- [ ] Create from Light Mode template
- [ ] Duplicate existing theme

---

## Time Estimate
3 hours
