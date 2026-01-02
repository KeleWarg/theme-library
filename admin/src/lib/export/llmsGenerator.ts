import type { ExportableComponent, PackageConfig } from './types';
import { getPublishableComponents } from './utils';

const THEMES = ['theme-health-sem', 'theme-home-sem', 'theme-llm', 'theme-forbes-media-seo'];

export function generateLLMSTxt(components: ExportableComponent[], config: PackageConfig): string {
  const published = getPublishableComponents(components);
  const { packageName } = config;

  return `# ${packageName} - AI Assistant Guide

## Quick Start
\`\`\`jsx
import '${packageName}/dist/tokens.css';
import { ${published.map(c => c.name).join(', ')} } from '${packageName}';
\`\`\`

## Components
${published.map(c => formatComponent(c, packageName)).join('\n')}

## Design Tokens
- Backgrounds: \`var(--color-bg-white)\`, \`var(--color-bg-neutral-light)\`
- Text: \`var(--color-fg-heading)\`, \`var(--color-fg-body)\`
- Buttons: \`var(--color-btn-primary-bg)\`, \`var(--color-btn-primary-text)\`

## Themes
${THEMES.map(t => `- \`${t}\``).join('\n')}

## Rules
✅ Use CSS variables for all styling
✅ Apply theme class to root element
❌ Never hardcode colors
❌ Don't recreate existing components
`;
}

function formatComponent(c: ExportableComponent, pkg: string): string {
  const props = (c.props || []).map(p => `| ${p.name} | \`${p.type}\` | ${p.default || '-'} |`).join('\n');
  return `
### ${c.name}
${c.description || ''}
**Import:** \`import { ${c.name} } from '${pkg}';\`
| Prop | Type | Default |
|------|------|---------|
${props || '| - | - | - |'}
`;
}

export function downloadLLMSTxt(components: ExportableComponent[], config: PackageConfig): void {
  const content = generateLLMSTxt(components, config);
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'LLMS.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

