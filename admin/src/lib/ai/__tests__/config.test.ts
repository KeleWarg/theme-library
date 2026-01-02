import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AI_CONFIG, isAIConfigured, getApiKey } from '../config';

describe('AI Config', () => {
  describe('AI_CONFIG', () => {
    it('has required fields (apiEndpoint, model, maxTokens)', () => {
      expect(AI_CONFIG.apiEndpoint).toBe('https://api.anthropic.com/v1/messages');
      expect(AI_CONFIG.model).toBe('claude-sonnet-4-20250514');
      expect(AI_CONFIG.maxTokens).toBe(4096);
    });

    it('has apiVersion field', () => {
      expect(AI_CONFIG.apiVersion).toBe('2023-06-01');
    });

    it('has temperature field', () => {
      expect(AI_CONFIG.temperature).toBe(0.3);
    });

    it('has retry configuration', () => {
      expect(AI_CONFIG.maxRetries).toBe(2);
      expect(AI_CONFIG.retryDelayMs).toBe(1000);
    });
  });

  describe('availableTokens', () => {
    it('contains button background tokens', () => {
      expect(AI_CONFIG.availableTokens.buttonBackgrounds).toContain('var(--color-btn-primary-bg)');
      expect(AI_CONFIG.availableTokens.buttonBackgrounds).toContain('var(--color-btn-primary-hover)');
      expect(AI_CONFIG.availableTokens.buttonBackgrounds).toContain('var(--color-btn-secondary-bg)');
    });

    it('contains button text tokens', () => {
      expect(AI_CONFIG.availableTokens.buttonText).toContain('var(--color-btn-primary-text)');
      expect(AI_CONFIG.availableTokens.buttonText).toContain('var(--color-btn-secondary-text)');
    });

    it('contains background tokens', () => {
      expect(AI_CONFIG.availableTokens.backgrounds).toContain('var(--color-bg-white)');
      expect(AI_CONFIG.availableTokens.backgrounds).toContain('var(--color-bg-neutral-light)');
      expect(AI_CONFIG.availableTokens.backgrounds).toContain('var(--color-bg-neutral-medium)');
    });

    it('contains text tokens', () => {
      expect(AI_CONFIG.availableTokens.text).toContain('var(--color-fg-heading)');
      expect(AI_CONFIG.availableTokens.text).toContain('var(--color-fg-body)');
      expect(AI_CONFIG.availableTokens.text).toContain('var(--color-fg-caption)');
    });

    it('contains feedback tokens', () => {
      expect(AI_CONFIG.availableTokens.feedback).toContain('var(--color-fg-feedback-error)');
      expect(AI_CONFIG.availableTokens.feedback).toContain('var(--color-fg-feedback-success)');
    });
  });

  describe('isAIConfigured', () => {
    const originalEnv = import.meta.env.VITE_ANTHROPIC_API_KEY;

    afterEach(() => {
      // Restore original env value
      if (originalEnv !== undefined) {
        import.meta.env.VITE_ANTHROPIC_API_KEY = originalEnv;
      } else {
        delete import.meta.env.VITE_ANTHROPIC_API_KEY;
      }
    });

    it('returns false when API key is not set', () => {
      delete import.meta.env.VITE_ANTHROPIC_API_KEY;
      expect(isAIConfigured()).toBe(false);
    });

    it('returns false when API key is empty string', () => {
      import.meta.env.VITE_ANTHROPIC_API_KEY = '';
      expect(isAIConfigured()).toBe(false);
    });

    it('returns true when API key is set', () => {
      import.meta.env.VITE_ANTHROPIC_API_KEY = 'test-api-key';
      expect(isAIConfigured()).toBe(true);
    });
  });

  describe('getApiKey', () => {
    const originalEnv = import.meta.env.VITE_ANTHROPIC_API_KEY;

    afterEach(() => {
      // Restore original env value
      if (originalEnv !== undefined) {
        import.meta.env.VITE_ANTHROPIC_API_KEY = originalEnv;
      } else {
        delete import.meta.env.VITE_ANTHROPIC_API_KEY;
      }
    });

    it('returns undefined when API key is not set', () => {
      delete import.meta.env.VITE_ANTHROPIC_API_KEY;
      expect(getApiKey()).toBeUndefined();
    });

    it('returns the API key when set', () => {
      import.meta.env.VITE_ANTHROPIC_API_KEY = 'test-api-key-123';
      expect(getApiKey()).toBe('test-api-key-123');
    });
  });
});

