import type { ComponentSpec, GenerationRequest, PropDefinition } from './types';
import { AI_CONFIG } from './config';

export function buildSystemPrompt(): string {
  return `You are a React component generator for a design system.
Generate production-ready React components that:
1. Use CSS variables for ALL styling (never hardcode colors)
2. Support variants via props
3. Are accessible and well-documented
4. Follow React best practices`;
}

export function buildComponentPrompt(request: GenerationRequest): string {
  const { component, feedback } = request;

  return `Generate a React component based on this specification:

## Component: ${component.name}

**Description:** ${component.description || 'No description provided'}

**Variants:**
${formatVariants(component.variants)}

**Figma Properties:**
${formatProperties(component.figma_properties)}

**Linked Tokens:**
${(component.linked_tokens || []).join(', ') || 'None specified'}

${feedback ? `## Feedback on Previous Code\n${feedback}\n` : ''}
## Requirements

1. Create a named export function component
2. Use CSS variables for ALL colors and typography:
${formatAvailableTokens()}
3. Use inline styles with the style prop
4. Support all variants via a "variant" prop
5. Include JSDoc comment describing props

## Output Format

Return ONLY:

\`\`\`jsx
// Component code here
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "..."}]
\`\`\``;
}

function formatVariants(variants?: { name: string; description?: string }[]): string {
  if (!variants?.length) return 'None';
  return variants.map(v => `- ${v.name}`).join('\n');
}

function formatProperties(props?: { name: string; type: string; defaultValue?: string }[]): string {
  if (!props?.length) return 'None';
  return JSON.stringify(props, null, 2);
}

function formatAvailableTokens(): string {
  const t = AI_CONFIG.availableTokens;
  return `- Buttons: ${t.buttonBackgrounds.slice(0, 2).join(', ')}
- Text: ${t.text.join(', ')}
- Backgrounds: ${t.backgrounds.join(', ')}`;
}

export function parseGenerationResponse(text: string): { jsx_code: string; props: PropDefinition[] } {
  const jsxMatch = text.match(/```jsx\n([\s\S]*?)\n```/);
  const propsMatch = text.match(/```json\n([\s\S]*?)\n```/);

  if (!jsxMatch) {
    throw new Error('Could not parse JSX code from response');
  }

  let props: PropDefinition[] = [];
  if (propsMatch) {
    try {
      props = JSON.parse(propsMatch[1]);
    } catch {
      console.warn('Could not parse props JSON');
    }
  }

  return { jsx_code: jsxMatch[1].trim(), props };
}

