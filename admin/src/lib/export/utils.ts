import type { ExportableComponent } from './types';

export function getPublishableComponents(components: ExportableComponent[]): ExportableComponent[] {
  return components.filter(c => c.status === 'published' && c.jsx_code?.trim());
}

export function generateComponentsIndex(components: ExportableComponent[]): string {
  return components.map(c => `export { ${c.name} } from './${c.name}';`).join('\n');
}

export function sanitizePackageName(name: string): string {
  return name.replace('@', '').replace('/', '-').replace(/[^a-z0-9-]/gi, '-');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

