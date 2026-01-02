# Chunk 2.01 — Theme Source Modal

## Purpose
Create the entry point modal where users choose between importing a JSON file or creating a theme from scratch.

---

## Inputs
- None (UI entry point)

## Outputs
- `src/components/themes/ThemeSourceModal.jsx` (consumed by chunk 5.01)
- `src/components/themes/ThemeSourceModal.test.jsx`
- CSS styles in `src/styles/themes.css`

---

## Dependencies
- None (can be developed independently)

---

## Implementation Notes

### Key Considerations
- Modal should be accessible (focus trap, escape to close)
- Two clear options with icons and descriptions
- Clean, professional design matching existing UI

### Gotchas
- Click on overlay should close, click on content should not
- Tab navigation should work between options
- Icon imports from lucide-react

### Algorithm/Approach
Standard modal pattern with overlay, content container, and two card buttons. Callbacks for each option selection.

---

## Files Created
- `src/components/themes/ThemeSourceModal.jsx` — Component
- `src/components/themes/ThemeSourceModal.test.jsx` — Tests
- CSS additions to `src/styles/themes.css`

---

## Implementation

```jsx
// src/components/themes/ThemeSourceModal.jsx
import { X, Upload, Plus } from 'lucide-react'

export default function ThemeSourceModal({ 
  isOpen, 
  onClose, 
  onSelectImport, 
  onSelectCreate 
}) {
  if (!isOpen) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-source-title"
      data-testid="theme-source-modal"
    >
      <div 
        className="modal-content theme-source-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="theme-source-title">Create New Theme</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Choose how you'd like to create your design system theme.
          </p>

          <div className="theme-source-options">
            <button 
              className="theme-source-card"
              onClick={onSelectImport}
              data-testid="import-option"
            >
              <div className="source-card-icon">
                <Upload size={32} />
              </div>
              <h3>Import from JSON</h3>
              <p>Upload a Figma Variables export or existing token file</p>
            </button>

            <button 
              className="theme-source-card"
              onClick={onSelectCreate}
              data-testid="create-option"
            >
              <div className="source-card-icon">
                <Plus size={32} />
              </div>
              <h3>Create from Scratch</h3>
              <p>Build a new design system with guided setup</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### CSS

```css
/* Add to src/styles/themes.css */

/* Modal Base */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-heading-md);
}

.modal-close-btn {
  padding: var(--spacing-xs);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-fg-caption);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: var(--color-bg-neutral-light);
  color: var(--color-fg-body);
}

.modal-body {
  padding: var(--spacing-lg);
}

/* Theme Source Modal */
.theme-source-modal {
  max-width: 600px;
  width: 100%;
}

.modal-description {
  color: var(--color-fg-caption);
  margin: 0 0 var(--spacing-lg) 0;
}

.theme-source-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.theme-source-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.theme-source-card:hover {
  border-color: var(--color-btn-primary-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.theme-source-card:focus {
  outline: 2px solid var(--color-btn-primary-bg);
  outline-offset: 2px;
}

.source-card-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-neutral-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  color: var(--color-btn-primary-bg);
}

.theme-source-card h3 {
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-heading);
  margin: 0 0 var(--spacing-xs) 0;
}

.theme-source-card p {
  font-size: var(--font-size-body-sm);
  color: var(--color-fg-caption);
  margin: 0;
}

@media (max-width: 480px) {
  .theme-source-options {
    grid-template-columns: 1fr;
  }
}
```

---

## Tests

### Unit Tests
- [ ] Renders nothing when `isOpen` is false
- [ ] Renders modal when `isOpen` is true
- [ ] Shows both option cards
- [ ] Calls `onSelectImport` when import clicked
- [ ] Calls `onSelectCreate` when create clicked
- [ ] Calls `onClose` when overlay clicked
- [ ] Calls `onClose` when X button clicked
- [ ] Calls `onClose` on Escape key

### Integration Tests
- [ ] N/A (unit tests sufficient)

### Verification
- [ ] Visual review of modal appearance
- [ ] Tab navigation works between options
- [ ] Click outside closes modal
- [ ] Responsive at mobile widths

---

## Time Estimate
1.5 hours

---

## Notes
- Modal pattern can be extracted to reusable component if needed elsewhere
- Consider adding entrance/exit animations in future
- Focus should be trapped within modal when open
