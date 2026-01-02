export type TokenCategory = 'color' | 'typography' | 'spacing' | 'layout' | 'border' | 'shadow' | 'other';

export interface DesignToken {
  path: string;           // "color.btn.primary-bg"
  name: string;           // "primary-bg"
  category: TokenCategory;
  type: 'color' | 'number' | 'string';
  value: string | number;
  cssVar: string;         // "--color-btn-primary-bg"
  theme?: string;
}

export interface ComponentData {
  name: string;
  slug: string;
  description?: string;
  props?: { name: string; type: string; default?: string }[];
  variants?: { name: string }[];
  jsx_code?: string;
  status?: string;
}

export interface AIExportBundle {
  tokens: DesignToken[];
  components: ComponentData[];
  themes: string[];
  metadata: {
    packageName: string;
    version: string;
    exportedAt: string;
  };
}

export type AIExportFormat = 'cursor-rules' | 'claude-code' | 'project-knowledge' | 'mcp-server' | 'full-package';

export interface GeneratorOptions {
  packageName?: string;
  version?: string;
  includeExamples?: boolean;
}
