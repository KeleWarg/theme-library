import { describe, it, expect, vi } from 'vitest';
import {
  buildSystemPrompt,
  buildComponentPrompt,
  parseGenerationResponse,
} from '../promptBuilder';
import type { ComponentSpec, GenerationRequest } from '../types';

describe('promptBuilder', () => {
  describe('buildSystemPrompt', () => {
    it('returns a system prompt for React component generation', () => {
      const prompt = buildSystemPrompt();
      
      expect(prompt).toContain('React component generator');
      expect(prompt).toContain('CSS variables');
      expect(prompt).toContain('accessible');
    });
  });

  describe('buildComponentPrompt', () => {
    const mockComponent: ComponentSpec = {
      id: 'comp-1',
      name: 'TestButton',
      slug: 'test-button',
      description: 'A test button component',
      variants: [
        { name: 'primary', description: 'Primary variant' },
        { name: 'secondary', description: 'Secondary variant' },
      ],
      figma_properties: [
        { name: 'label', type: 'string', defaultValue: 'Click me' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      ],
      linked_tokens: ['--color-btn-primary-bg', '--color-btn-primary-text'],
    };

    it('includes component name in prompt', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('## Component: TestButton');
    });

    it('includes component description', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('A test button component');
    });

    it('includes variants in prompt', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('- primary');
      expect(prompt).toContain('- secondary');
    });

    it('includes figma properties', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('"name": "label"');
      expect(prompt).toContain('"type": "string"');
    });

    it('includes linked tokens', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('--color-btn-primary-bg');
      expect(prompt).toContain('--color-btn-primary-text');
    });

    it('includes feedback when provided', () => {
      const request: GenerationRequest = {
        component: mockComponent,
        feedback: 'Please add hover state styling',
      };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('## Feedback on Previous Code');
      expect(prompt).toContain('Please add hover state styling');
    });

    it('does not include feedback section when not provided', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).not.toContain('## Feedback on Previous Code');
    });

    it('includes available tokens reference', () => {
      const request: GenerationRequest = { component: mockComponent };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('var(--color-btn-primary-bg)');
      expect(prompt).toContain('var(--color-fg-heading)');
      expect(prompt).toContain('var(--color-bg-white)');
    });

    it('handles component with no variants', () => {
      const componentNoVariants: ComponentSpec = {
        id: 'comp-2',
        name: 'SimpleComponent',
        slug: 'simple-component',
      };
      const request: GenerationRequest = { component: componentNoVariants };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('**Variants:**\nNone');
    });

    it('handles component with no figma properties', () => {
      const componentNoProps: ComponentSpec = {
        id: 'comp-3',
        name: 'BasicComponent',
        slug: 'basic-component',
      };
      const request: GenerationRequest = { component: componentNoProps };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('**Figma Properties:**\nNone');
    });

    it('handles component with no linked tokens', () => {
      const componentNoTokens: ComponentSpec = {
        id: 'comp-4',
        name: 'PlainComponent',
        slug: 'plain-component',
      };
      const request: GenerationRequest = { component: componentNoTokens };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('**Linked Tokens:**\nNone specified');
    });

    it('handles missing description', () => {
      const componentNoDesc: ComponentSpec = {
        id: 'comp-5',
        name: 'NoDescComponent',
        slug: 'no-desc-component',
      };
      const request: GenerationRequest = { component: componentNoDesc };
      const prompt = buildComponentPrompt(request);
      
      expect(prompt).toContain('**Description:** No description provided');
    });
  });

  describe('parseGenerationResponse', () => {
    it('extracts JSX code correctly', () => {
      const response = `Here's the component:

\`\`\`jsx
export function TestButton({ variant = 'primary' }) {
  return <button style={{ color: 'var(--color-btn-primary-text)' }}>Click</button>;
}
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "Button variant"}]
\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.jsx_code).toContain('export function TestButton');
      expect(result.jsx_code).toContain('var(--color-btn-primary-text)');
    });

    it('extracts props array correctly', () => {
      const response = `\`\`\`jsx
export function TestButton() { return <button>Test</button>; }
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "Button variant"}, {"name": "disabled", "type": "boolean", "default": "false", "description": "Disabled state"}]
\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.props).toHaveLength(2);
      expect(result.props[0]).toEqual({
        name: 'variant',
        type: 'string',
        default: 'primary',
        description: 'Button variant',
      });
      expect(result.props[1]).toEqual({
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disabled state',
      });
    });

    it('throws error when JSX code is missing', () => {
      const response = `Here's some text without code blocks.
      
\`\`\`json
[{"name": "variant", "type": "string"}]
\`\`\``;

      expect(() => parseGenerationResponse(response)).toThrow(
        'Could not parse JSX code from response'
      );
    });

    it('returns empty props array when json block is missing', () => {
      const response = `\`\`\`jsx
export function TestButton() { return <button>Test</button>; }
\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.jsx_code).toContain('export function TestButton');
      expect(result.props).toEqual([]);
    });

    it('returns empty props array when json is malformed', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const response = `\`\`\`jsx
export function TestButton() { return <button>Test</button>; }
\`\`\`

\`\`\`json
{invalid json here}
\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.jsx_code).toContain('export function TestButton');
      expect(result.props).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Could not parse props JSON');
      
      consoleSpy.mockRestore();
    });

    it('trims whitespace from extracted JSX code', () => {
      const response = `\`\`\`jsx

  export function TestButton() {
    return <button>Test</button>;
  }

\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.jsx_code).toBe(`export function TestButton() {
    return <button>Test</button>;
  }`);
    });

    it('handles multiline JSX code', () => {
      const response = `\`\`\`jsx
/**
 * TestButton component
 * @param {Object} props - Component props
 */
export function TestButton({ variant = 'primary', children }) {
  const style = {
    backgroundColor: 'var(--color-btn-primary-bg)',
    color: 'var(--color-btn-primary-text)',
  };
  
  return (
    <button style={style}>
      {children}
    </button>
  );
}
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "Button variant"}]
\`\`\``;

      const result = parseGenerationResponse(response);
      
      expect(result.jsx_code).toContain('TestButton component');
      expect(result.jsx_code).toContain('backgroundColor');
      expect(result.jsx_code).toContain('{children}');
    });
  });
});

