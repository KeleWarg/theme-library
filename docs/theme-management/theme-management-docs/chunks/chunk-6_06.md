# Chunk 6.06 — ComponentDetail Integration

## Purpose
Integrate AI generation into the ComponentDetail page.

---

## Inputs
- `generateComponentCode()` (from chunk 6.03)
- `GenerateButton` component (from chunk 6.04)
- `FeedbackModal` component (from chunk 6.05)

## Outputs
- Updated `ComponentDetail.jsx` with AI generation capabilities

---

## Dependencies
- Chunk 6.03 must be complete
- Chunk 6.04 must be complete
- Chunk 6.05 must be complete

---

## Implementation Notes

### Key Considerations
- Add state for generating, showFeedbackModal, generationError
- Generate button in Code tab header
- Show feedback modal for regeneration

### Gotchas
- Update local state AND save to database after generation
- Clear error on new generation attempt
- Close modal when generation starts

### Algorithm/Approach
Add hooks and handlers to existing ComponentDetail. Conditional rendering based on existing code.

---

## Files Created
- Update `src/pages/ComponentDetail.jsx` — Add AI integration
- `src/pages/__tests__/ComponentDetail.ai.test.jsx` — Integration tests

---

## Implementation

### Changes to `src/pages/ComponentDetail.jsx`

```jsx
// Add imports
import { useState, useCallback } from 'react';
import { generateComponentCode, isAIConfigured } from '../lib/ai/generateCode';
import GenerateButton from '../components/ui/GenerateButton';
import FeedbackModal from '../components/ui/FeedbackModal';

// Inside component, add state:
const [generating, setGenerating] = useState(false);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [generationError, setGenerationError] = useState(null);

// Add handler:
const handleGenerate = useCallback(async (feedback = '') => {
  setGenerating(true);
  setGenerationError(null);
  setShowFeedbackModal(false);

  try {
    const result = await generateComponentCode({
      component,
      feedback: feedback || undefined,
    });

    setLocalCode(result.jsx_code);
    setLocalProps(result.props);

    await updateComponent({
      jsx_code: result.jsx_code,
      props: result.props,
      code_status: 'generated',
    });
  } catch (err) {
    setGenerationError(err.message);
  } finally {
    setGenerating(false);
  }
}, [component, updateComponent]);

// In Code tab section, add:
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
  <div>
    {generationError && (
      <span style={{ color: 'var(--color-fg-feedback-error)', fontSize: '14px' }}>
        {generationError}
      </span>
    )}
  </div>

  {localCode ? (
    <GenerateButton
      onClick={() => setShowFeedbackModal(true)}
      loading={generating}
      hasExistingCode={true}
    />
  ) : (
    <GenerateButton
      onClick={() => handleGenerate()}
      loading={generating}
      hasExistingCode={false}
    />
  )}
</div>

<FeedbackModal
  isOpen={showFeedbackModal}
  onClose={() => setShowFeedbackModal(false)}
  onSubmit={handleGenerate}
  loading={generating}
/>
```

---

## Tests

### Integration Tests
- [ ] Generate button appears on Code tab
- [ ] Clicking generate calls API (mocked)
- [ ] Generated code appears in editor
- [ ] Regenerate shows feedback modal
- [ ] Error displays on failure

### Verification
- [ ] Manual test: generate code for a component
- [ ] Manual test: regenerate with feedback
- [ ] `npm test src/pages/__tests__/ComponentDetail.ai.test.jsx` passes

---

## Time Estimate
2 hours

---

## Notes
- This is the main integration point for Phase 6
- Consider adding code preview/diff view in future
