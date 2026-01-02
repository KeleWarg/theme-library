import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateComponentCode, generateWithRetry, isAIConfigured } from '../generateCode';
import type { GenerationRequest, ClaudeResponse } from '../types';

// Mock the config module
vi.mock('../config', async () => {
  const actual = await vi.importActual('../config');
  return {
    ...actual,
    AI_CONFIG: {
      apiEndpoint: 'https://api.anthropic.com/v1/messages',
      apiVersion: '2023-06-01',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.3,
      maxRetries: 2,
      retryDelayMs: 10, // Short delay for tests
      availableTokens: {
        buttonBackgrounds: ['var(--color-btn-primary-bg)'],
        buttonText: ['var(--color-btn-primary-text)'],
        backgrounds: ['var(--color-bg-white)'],
        text: ['var(--color-fg-heading)'],
        feedback: ['var(--color-fg-feedback-error)'],
      },
    },
    getApiKey: vi.fn(),
    isAIConfigured: vi.fn(),
  };
});

// Get the mocked functions
import { getApiKey, isAIConfigured as mockIsAIConfigured } from '../config';

const mockGetApiKey = vi.mocked(getApiKey);
const mockIsAIConfiguredFn = vi.mocked(mockIsAIConfigured);

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRequest: GenerationRequest = {
  component: {
    id: 'test-1',
    name: 'TestButton',
    slug: 'test-button',
    description: 'A test button component',
    variants: [{ name: 'primary' }, { name: 'secondary' }],
    linked_tokens: ['var(--color-btn-primary-bg)'],
  },
};

const mockSuccessResponse: ClaudeResponse = {
  content: [
    {
      type: 'text',
      text: `Here's the component:

\`\`\`jsx
export function TestButton({ variant = 'primary', children }) {
  return <button style={{ backgroundColor: 'var(--color-btn-primary-bg)' }}>{children}</button>;
}
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "Button variant"}]
\`\`\``,
    },
  ],
  usage: { input_tokens: 100, output_tokens: 200 },
};

describe('generateCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiKey.mockReturnValue('test-api-key');
    mockIsAIConfiguredFn.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateComponentCode', () => {
    it('throws when API key missing', async () => {
      mockGetApiKey.mockReturnValue(undefined);

      await expect(generateComponentCode(mockRequest)).rejects.toThrow(
        'Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local'
      );
    });

    it('calls fetch with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      await generateComponentCode(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
        })
      );
    });

    it('parses successful response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      const result = await generateComponentCode(mockRequest);

      expect(result.jsx_code).toContain('export function TestButton');
      expect(result.props).toEqual([
        { name: 'variant', type: 'string', default: 'primary', description: 'Button variant' },
      ]);
      expect(result.tokensUsed).toBe(200);
    });

    it('throws on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Invalid request' } }),
      });

      await expect(generateComponentCode(mockRequest)).rejects.toThrow('Invalid request');
    });

    it('throws with status code when error has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(generateComponentCode(mockRequest)).rejects.toThrow('API request failed: 500');
    });

    it('throws on empty response content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      await expect(generateComponentCode(mockRequest)).rejects.toThrow('Empty response from API');
    });

    it('uses custom options when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      await generateComponentCode({
        ...mockRequest,
        options: { model: 'custom-model', maxTokens: 8192 },
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.model).toBe('custom-model');
      expect(callBody.max_tokens).toBe(8192);
    });
  });

  describe('generateWithRetry', () => {
    it('retries on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse),
        });

      const result = await generateWithRetry(mockRequest);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.jsx_code).toContain('export function TestButton');
    });

    it('does not retry on auth error', async () => {
      mockGetApiKey.mockReturnValue(undefined);

      await expect(generateWithRetry(mockRequest)).rejects.toThrow(
        'Anthropic API key not configured'
      );

      // Should not have called fetch at all since API key check happens first
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('throws after max retries exhausted', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Server error' } }),
      });

      await expect(generateWithRetry(mockRequest, 2)).rejects.toThrow('Server error');

      // Initial attempt + 2 retries = 3 calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('respects custom maxRetries parameter', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Server error' } }),
      });

      await expect(generateWithRetry(mockRequest, 1)).rejects.toThrow('Server error');

      // Initial attempt + 1 retry = 2 calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('isAIConfigured', () => {
    it('re-exports isAIConfigured from config', () => {
      expect(typeof isAIConfigured).toBe('function');
    });
  });
});

