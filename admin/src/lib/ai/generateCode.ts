import type { GenerationRequest, GenerationResult, ClaudeResponse } from './types';
import { AI_CONFIG, getApiKey, isAIConfigured } from './config';
import { buildSystemPrompt, buildComponentPrompt, parseGenerationResponse } from './promptBuilder';

export { isAIConfigured };

export async function generateComponentCode(
  request: GenerationRequest
): Promise<GenerationResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local');
  }

  const { model, maxTokens, apiEndpoint, apiVersion } = AI_CONFIG;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': apiVersion,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: request.options?.model || model,
      max_tokens: request.options?.maxTokens || maxTokens,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildComponentPrompt(request) }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data: ClaudeResponse = await response.json();
  const text = data.content[0]?.text;

  if (!text) {
    throw new Error('Empty response from API');
  }

  const { jsx_code, props } = parseGenerationResponse(text);

  return {
    jsx_code,
    props,
    tokensUsed: data.usage?.output_tokens,
  };
}

export async function generateWithRetry(
  request: GenerationRequest,
  maxRetries = AI_CONFIG.maxRetries
): Promise<GenerationResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateComponentCode(request);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (lastError.message.includes('API key')) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, AI_CONFIG.retryDelayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

