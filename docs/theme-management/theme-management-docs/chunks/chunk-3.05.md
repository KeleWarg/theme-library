# Chunk 3.05 — Preview Panel

## Purpose
Create the live preview panel showing sample components with current theme tokens applied.

---

## Inputs
- Current theme tokens
- Preview viewport selection

## Outputs
- `src/components/themes/editor/PreviewPanel.jsx`
- `src/components/themes/editor/PreviewComponents.jsx`

---

## Dependencies
- Chunk 3.01 (parent layout)
- Chunk 3.04 (token changes trigger preview update)

---

## Implementation Notes

### Key Considerations
- Real-time CSS variable updates
- Sample components: Button, Card, Form, Typography
- Viewport toggle: Desktop, Tablet, Mobile
- Light/Dark mode toggle (if supported)

### Gotchas
- CSS variables must be scoped to preview container
- Viewport changes need iframe or width constraint
- Performance: don't regenerate CSS on every keystroke

### Algorithm/Approach
1. Generate CSS custom properties from tokens
2. Apply to preview container via style element
3. Render sample components using those variables
4. Debounce updates for performance

---

## Files Created
- `src/components/themes/editor/PreviewPanel.jsx`
- `src/components/themes/editor/PreviewComponents.jsx`

---

## Preview Components

```jsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// Card
<Card>
  <CardTitle>Sample Card</CardTitle>
  <CardBody>Content preview</CardBody>
</Card>

// Form elements
<Input label="Text Input" />
<Select label="Select" />

// Typography
<h1>Heading 1</h1>
<p>Body text sample</p>
```

---

## Tests

### Unit Tests
- [ ] Renders preview components
- [ ] CSS variables applied to container
- [ ] Viewport toggle changes width
- [ ] Updates when tokens change

### Verification
- [ ] Visual inspection of preview
- [ ] Color changes reflect immediately
- [ ] Viewport sizes correct

---

## Time Estimate
2.5 hours
