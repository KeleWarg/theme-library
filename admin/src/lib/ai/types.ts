export interface ComponentSpec {
  id: string;
  name: string;
  slug: string;
  description?: string;
  variants?: { name: string; description?: string }[];
  figma_properties?: { name: string; type: string; defaultValue?: string }[];
  linked_tokens?: string[];
  jsx_code?: string;
  props?: PropDefinition[];
  code_status?: 'pending' | 'generating' | 'generated' | 'approved' | 'published';
}

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

export interface GenerationRequest {
  component: ComponentSpec;
  feedback?: string;
  options?: GenerationOptions;
}

export interface GenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResult {
  jsx_code: string;
  props: PropDefinition[];
  tokensUsed?: number;
}

export interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  usage?: { input_tokens: number; output_tokens: number };
}

