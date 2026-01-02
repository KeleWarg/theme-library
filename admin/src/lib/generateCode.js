const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

/**
 * Generate React component code using Claude AI
 * @param {Object} component - Component data from Figma/database
 * @param {string} feedback - Optional feedback for regeneration
 * @returns {Promise<{jsx_code: string, props: Array}>}
 */
export async function generateComponentCode(component, feedback = '') {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local')
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

/**
 * Build the prompt for Claude to generate a React component
 */
export function buildPrompt(component, feedback) {
  const variantsStr = Array.isArray(component.variants) 
    ? component.variants.map(v => typeof v === 'string' ? v : v.name || JSON.stringify(v)).join(', ')
    : 'default'

  const tokensStr = Array.isArray(component.linked_tokens)
    ? component.linked_tokens.join(', ')
    : ''

  const propsStr = Array.isArray(component.figma_properties)
    ? JSON.stringify(component.figma_properties, null, 2)
    : '[]'

  return `You are a React component generator for a design system. Generate a React component based on this data.

COMPONENT NAME: ${component.name}
DESCRIPTION: ${component.description || 'A reusable UI component'}
CATEGORY: ${component.category || 'general'}

VARIANTS: ${variantsStr}

FIGMA PROPERTIES:
${propsStr}

LINKED DESIGN TOKENS: ${tokensStr}

${feedback ? `\nFEEDBACK ON PREVIOUS CODE (apply these changes):\n${feedback}\n` : ''}

STRICT REQUIREMENTS:
1. Create a function component named "${component.name}" (not default export)
2. Use CSS variables for ALL colors - NEVER use hex values like #fff or rgb()
3. Use inline styles with the style prop (not CSS classes)
4. Support all variants via a "variant" prop with default "primary"
5. Include a "children" prop for content
6. Add proper JSDoc comment above the function
7. Handle "disabled" prop if applicable
8. Add hover states using onMouseEnter/onMouseLeave with useState

AVAILABLE CSS VARIABLES:
- Buttons: var(--color-btn-primary-bg), var(--color-btn-primary-text), var(--color-btn-primary-hover)
- Buttons: var(--color-btn-secondary-bg), var(--color-btn-secondary-text)
- Buttons: var(--color-btn-ghost-hover), var(--color-btn-ghost-text)
- Backgrounds: var(--color-bg-white), var(--color-bg-neutral-light), var(--color-bg-neutral-medium)
- Text: var(--color-fg-heading), var(--color-fg-body), var(--color-fg-caption)
- Borders: var(--color-border-default)
- Feedback: var(--color-fg-feedback-error), var(--color-fg-feedback-warning), var(--color-fg-feedback-success)
- Typography: var(--font-size-body-lg), var(--font-size-body-md), var(--font-size-body-sm)
- Font weight: var(--font-weight-bold), var(--font-weight-semibold), var(--font-weight-regular)

OUTPUT FORMAT (return ONLY this, no explanation):

\`\`\`jsx
import { useState } from 'react'

/**
 * ${component.name} component
 * @param {Object} props
 */
function ${component.name}({ variant = 'primary', children, disabled = false, onClick }) {
  // Your implementation here
}
\`\`\`

\`\`\`json
[
  {"name": "variant", "type": "'primary' | 'secondary' | 'ghost'", "default": "'primary'", "description": "Visual style variant"},
  {"name": "children", "type": "ReactNode", "default": "", "description": "Content to render"},
  {"name": "disabled", "type": "boolean", "default": "false", "description": "Whether the component is disabled"},
  {"name": "onClick", "type": "() => void", "default": "", "description": "Click handler"}
]
\`\`\`
`
}

/**
 * Parse Claude's response to extract JSX code and props
 */
export function parseResponse(text) {
  // Extract JSX code block
  const jsxMatch = text.match(/```jsx\n([\s\S]*?)\n```/)
  
  // Extract JSON props block
  const propsMatch = text.match(/```json\n([\s\S]*?)\n```/)

  if (!jsxMatch) {
    // Try without language specifier
    const codeMatch = text.match(/```\n([\s\S]*?)\n```/)
    if (!codeMatch) {
      throw new Error('Could not parse code from AI response')
    }
    return {
      jsx_code: codeMatch[1].trim(),
      props: []
    }
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

/**
 * Check if AI code generation is configured
 */
export function isAIConfigured() {
  return !!ANTHROPIC_API_KEY
}



