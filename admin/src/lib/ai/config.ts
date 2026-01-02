export const AI_CONFIG = {
  apiEndpoint: 'https://api.anthropic.com/v1/messages',
  apiVersion: '2023-06-01',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  maxRetries: 2,
  retryDelayMs: 1000,

  availableTokens: {
    buttonBackgrounds: [
      'var(--color-btn-primary-bg)',
      'var(--color-btn-primary-hover)',
      'var(--color-btn-secondary-bg)',
    ],
    buttonText: [
      'var(--color-btn-primary-text)',
      'var(--color-btn-secondary-text)',
    ],
    backgrounds: [
      'var(--color-bg-white)',
      'var(--color-bg-neutral-light)',
      'var(--color-bg-neutral-medium)',
    ],
    text: [
      'var(--color-fg-heading)',
      'var(--color-fg-body)',
      'var(--color-fg-caption)',
    ],
    feedback: [
      'var(--color-fg-feedback-error)',
      'var(--color-fg-feedback-success)',
    ],
  },
} as const;

export function isAIConfigured(): boolean {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

export function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY;
}

