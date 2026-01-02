# Chunk 6.05 — FeedbackModal Component

## Purpose
Modal for providing feedback when regenerating code.

---

## Inputs
- None (standalone UI component)

## Outputs
- `FeedbackModal` component (consumed by chunk 6.06)

---

## Dependencies
- Chunk 6.01 must be complete

---

## Implementation Notes

### Key Considerations
- Overlay closes on backdrop click
- Textarea for multiline feedback
- ⌘+Enter keyboard shortcut for submit

### Gotchas
- Stop propagation on modal content click
- Clear feedback after submit
- Handle Escape key to close

### Algorithm/Approach
Controlled modal with local state for feedback text.

---

## Files Created
- `src/components/ui/FeedbackModal.jsx` — Component
- `src/components/ui/__tests__/FeedbackModal.test.jsx` — Tests

---

## Implementation

### `src/components/ui/FeedbackModal.jsx`

```jsx
import { useState } from 'react';
import { X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.metaKey) handleSubmit();
  };

  return (
    <div
      data-testid="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          margin: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Regenerate with Feedback</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--color-fg-body)', marginBottom: '16px' }}>
          Provide feedback to guide the AI:
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g., Make hover effect more subtle, add focus ring..."
          autoFocus
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid var(--color-bg-neutral-medium)',
            borderRadius: '8px',
            resize: 'vertical',
          }}
        />

        <p style={{ fontSize: '12px', color: 'var(--color-fg-caption)', marginTop: '8px' }}>
          Press ⌘+Enter to submit
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 18px', background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Tests

### Unit Tests
- [ ] Renders nothing when isOpen=false
- [ ] Renders modal when isOpen=true
- [ ] Calls onClose when overlay clicked
- [ ] Calls onSubmit with feedback text
- [ ] Clears feedback after submit
- [ ] Shows loading state

### Verification
- [ ] `npm test src/components/ui/__tests__/FeedbackModal.test.jsx` passes

---

## Time Estimate
1 hour
