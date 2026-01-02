# Chunk 6.04 — GenerateButton Component

## Purpose
Button component for triggering AI generation with loading state.

---

## Inputs
- `isAIConfigured()` (from chunk 6.01 via 6.03)

## Outputs
- `GenerateButton` component (consumed by chunk 6.06)

---

## Dependencies
- Chunk 6.01 must be complete

---

## Implementation Notes

### Key Considerations
- Shows different text for generate vs regenerate
- Disabled when loading or API not configured
- Gradient background for visual distinction

### Gotchas
- Check `isAIConfigured()` to disable when no API key
- Spinner animation uses CSS keyframes

### Algorithm/Approach
Simple stateless component with conditional rendering.

---

## Files Created
- `src/components/ui/GenerateButton.jsx` — Component
- `src/components/ui/__tests__/GenerateButton.test.jsx` — Tests

---

## Implementation

### `src/components/ui/GenerateButton.jsx`

```jsx
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { isAIConfigured } from '../../lib/ai/generateCode';

export default function GenerateButton({
  onClick,
  loading = false,
  hasExistingCode = false,
  disabled = false,
}) {
  const configured = isAIConfigured();
  const isDisabled = loading || !configured || disabled;

  const Icon = loading ? Loader2 : hasExistingCode ? RefreshCw : Sparkles;
  const label = loading
    ? 'Generating...'
    : hasExistingCode
    ? 'Regenerate with AI'
    : 'Generate with AI';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={!configured ? 'API key not configured' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: configured
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'var(--color-bg-neutral-medium)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontSize: 'var(--font-size-body-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Icon
        size={16}
        style={{
          animation: loading ? 'spin 1s linear infinite' : 'none',
        }}
      />
      {label}
    </button>
  );
}
```

---

## Tests

### Unit Tests
- [ ] Shows "Generate with AI" when no existing code
- [ ] Shows "Regenerate with AI" when code exists
- [ ] Shows "Generating..." when loading
- [ ] Calls onClick when clicked
- [ ] Disabled when loading
- [ ] Disabled when API not configured

### Verification
- [ ] Button renders with gradient
- [ ] Spinner animates during loading
- [ ] `npm test src/components/ui/__tests__/GenerateButton.test.jsx` passes

---

## Time Estimate
1 hour

---

## Notes
- CSS keyframes for spin animation may need global styles or styled-components
- Consider adding hover/active states
