# Phase 7: AI Code Generation

## Prerequisites
- Phases 1-6 complete
- Component detail page working
- Anthropic API key

## Outcome
- AI generates React code from Figma component data
- Regeneration with feedback
- Integrated into component detail page

---

## Task 7.1: Setup Anthropic Client

### Instructions
Add Anthropic API key to environment.

### Steps
1. Get API key from https://console.anthropic.com
2. Add to `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Verification
- [ ] API key added to .env.local

---

## Task 7.2: Create Code Generation Service

### Instructions
Create `src/lib/generateCode.js`

### Code
```javascript
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function generateComponentCode(component, feedback = '') {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const prompt = buildPrompt(component, feedback)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API request failed')
  }

  const data = await response.json()
  return parseResponse(data.content[0].text)
}

function buildPrompt(component, feedback) {
  return `You are a React component generator for a design system. Generate a React component based on this data.

COMPONENT NAME: ${component.name}
DESCRIPTION: ${component.description || 'No description provided'}

VARIANTS:
${JSON.stringify(component.variants || [], null, 2)}

FIGMA PROPERTIES:
${JSON.stringify(component.figma_properties || [], null, 2)}

LINKED TOKENS:
${(component.linked_tokens || []).join(', ')}

${feedback ? `FEEDBACK ON PREVIOUS CODE:\n${feedback}\n` : ''}

REQUIREMENTS:
1. Create a named export function component (e.g., export function Button)
2. Use CSS variables for ALL colors: var(--color-btn-primary-bg), NOT hex values
3. Use inline styles with the style prop
4. Support all variants via a "variant" prop
5. Include a "children" prop for content
6. Add JSDoc comment above the function describing props
7. Handle disabled state if applicable
8. Add hover/active states using onMouseEnter/onMouseLeave if needed

AVAILABLE CSS VARIABLES:
- Button backgrounds: var(--color-btn-primary-bg), var(--color-btn-primary-hover), var(--color-btn-secondary-bg), var(--color-btn-ghost-hover)
- Button text: var(--color-btn-primary-text), var(--color-btn-secondary-text), var(--color-btn-ghost-text)
- Backgrounds: var(--color-bg-white), var(--color-bg-neutral-light), var(--color-bg-neutral-medium)
- Text: var(--color-fg-heading), var(--color-fg-body), var(--color-fg-caption)
- Feedback: var(--color-fg-feedback-error), var(--color-fg-feedback-warning), var(--color-fg-feedback-success)
- Typography: var(--font-size-body-md), var(--font-size-body-sm), var(--font-weight-semibold), var(--font-weight-regular)

OUTPUT FORMAT:
Return ONLY the following, no other text:

\`\`\`jsx
// Your component code here
\`\`\`

\`\`\`json
[
  {"name": "variant", "type": "string", "default": "primary", "description": "Component variant", "required": false},
  {"name": "children", "type": "ReactNode", "default": "-", "description": "Content", "required": true}
]
\`\`\`
`
}

function parseResponse(text) {
  const jsxMatch = text.match(/```jsx\n([\s\S]*?)\n```/)
  const propsMatch = text.match(/```json\n([\s\S]*?)\n```/)

  if (!jsxMatch) {
    throw new Error('Could not parse JSX code from response')
  }

  let props = []
  if (propsMatch) {
    try {
      props = JSON.parse(propsMatch[1])
    } catch (e) {
      console.warn('Could not parse props JSON:', e)
    }
  }

  return {
    jsx_code: jsxMatch[1].trim(),
    props
  }
}

export function isAIConfigured() {
  return !!ANTHROPIC_API_KEY
}
```

### Test File
Create `src/lib/generateCode.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Note: We mock the fetch call since we can't test against real API
describe('generateCode', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'test-key')
  })

  describe('buildPrompt', () => {
    it('includes component name', async () => {
      // Would need to export buildPrompt for testing
      // Or test via integration
    })
  })

  describe('parseResponse', () => {
    it('extracts jsx code from response', () => {
      // Import and test parseResponse directly
    })
  })

  describe('isAIConfigured', () => {
    it('returns true when API key is set', async () => {
      const { isAIConfigured } = await import('./generateCode')
      expect(isAIConfigured()).toBe(true)
    })
  })
})
```

### Verification
- [ ] Function builds correct prompt
- [ ] Response parsing works
- [ ] Error handling works

---

## Task 7.3: Create GenerateButton Component

### Instructions
Create `src/components/ui/GenerateButton.jsx`

### Requirements
- Props: `onClick`, `loading`, `hasExistingCode`
- Shows "Generate with AI" or "Regenerate"
- Loading state
- Disabled when AI not configured

### Code
```javascript
import { Sparkles, RefreshCw } from 'lucide-react'
import { isAIConfigured } from '../../lib/generateCode'

export default function GenerateButton({ onClick, loading = false, hasExistingCode = false }) {
  const configured = isAIConfigured()
  
  const Icon = hasExistingCode ? RefreshCw : Sparkles
  const label = hasExistingCode ? 'Regenerate with AI' : 'Generate with AI'

  return (
    <button
      onClick={onClick}
      disabled={loading || !configured}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: configured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: loading || !configured ? 'not-allowed' : 'pointer',
        fontSize: 'var(--font-size-body-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        opacity: loading ? 0.7 : 1,
      }}
      title={!configured ? 'API key not configured' : ''}
    >
      <Icon size={16} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Generating...' : label}
    </button>
  )
}
```

### Test File
Create `src/components/ui/GenerateButton.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GenerateButton from './GenerateButton'

vi.mock('../../lib/generateCode', () => ({
  isAIConfigured: () => true
}))

describe('GenerateButton', () => {
  it('shows Generate text when no existing code', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={false} />)
    expect(screen.getByText('Generate with AI')).toBeInTheDocument()
  })

  it('shows Regenerate text when code exists', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={true} />)
    expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />)
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<GenerateButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when loading', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Verification
- [ ] Button renders correctly
- [ ] Loading state works
- [ ] Tests pass

---

## Task 7.4: Create Feedback Modal

### Instructions
Create `src/components/ui/FeedbackModal.jsx`

### Requirements
- Props: `isOpen`, `onClose`, `onSubmit`, `loading`
- Text area for feedback
- Submit and cancel buttons

### Code
```javascript
import { useState } from 'react'
import { X } from 'lucide-react'

export default function FeedbackModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [feedback, setFeedback] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(feedback)
    setFeedback('')
  }

  return (
    <div 
      data-testid="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          margin: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-fg-heading)' }}>Regenerate with Feedback</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--color-fg-body)', marginBottom: '16px' }}>
          Provide feedback to guide the AI in generating better code:
        </p>

        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="e.g., Make the hover effect more subtle, add focus ring for accessibility..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid var(--color-bg-neutral-medium)',
            borderRadius: '8px',
            resize: 'vertical',
            fontSize: 'var(--font-size-body-md)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--color-bg-neutral-medium)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Test File
Create `src/components/ui/FeedbackModal.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FeedbackModal from './FeedbackModal'

describe('FeedbackModal', () => {
  it('renders nothing when closed', () => {
    render(<FeedbackModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />)
    expect(screen.queryByText('Regenerate with Feedback')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument()
  })

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={() => {}} />)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with feedback', () => {
    const onSubmit = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />)
    
    const textarea = screen.getByPlaceholderText(/make the hover effect/i)
    fireEvent.change(textarea, { target: { value: 'My feedback' } })
    fireEvent.click(screen.getByText('Regenerate'))
    
    expect(onSubmit).toHaveBeenCalledWith('My feedback')
  })
})
```

### Verification
- [ ] Modal opens/closes
- [ ] Feedback submitted
- [ ] Tests pass

---

## Task 7.5: Integrate AI Generation into ComponentDetail

### Instructions
Update `src/pages/ComponentDetail.jsx` to add AI generation.

### Changes
Add to the Code tab section:

```javascript
// Add imports
import { generateComponentCode, isAIConfigured } from '../lib/generateCode'
import GenerateButton from '../components/ui/GenerateButton'
import FeedbackModal from '../components/ui/FeedbackModal'

// Add state
const [generating, setGenerating] = useState(false)
const [showFeedbackModal, setShowFeedbackModal] = useState(false)

// Add handlers
const handleGenerate = async (feedback = '') => {
  setGenerating(true)
  setShowFeedbackModal(false)
  
  try {
    const result = await generateComponentCode(component, feedback)
    setLocalCode(result.jsx_code)
    setLocalProps(result.props)
    
    // Optionally auto-save
    await update({
      jsx_code: result.jsx_code,
      props: result.props,
      code_status: 'generated'
    })
  } catch (err) {
    alert('Generation failed: ' + err.message)
  } finally {
    setGenerating(false)
  }
}

// In the Code tab render:
{activeTab === 'code' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
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
    
    <CodeEditor
      value={localCode}
      onChange={setLocalCode}
    />
    
    <FeedbackModal
      isOpen={showFeedbackModal}
      onClose={() => setShowFeedbackModal(false)}
      onSubmit={handleGenerate}
      loading={generating}
    />
  </div>
)}
```

### Verification
- [ ] Generate button appears
- [ ] Generation works
- [ ] Feedback modal works
- [ ] Code updates after generation

---

## Phase 7 Complete Checklist

- [ ] Task 7.1: API key configured
- [ ] Task 7.2: Generate code service
- [ ] Task 7.3: GenerateButton component with tests
- [ ] Task 7.4: FeedbackModal component with tests
- [ ] Task 7.5: Integration into ComponentDetail
- [ ] All tests passing: `npm test`
- [ ] AI generation works end-to-end

## Next Phase
Proceed to `PHASE_8_EXPORT.md`
