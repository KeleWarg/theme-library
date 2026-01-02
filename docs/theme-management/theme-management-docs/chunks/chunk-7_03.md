# Chunk 7.03 — Package Generator

## Purpose
Generate ZIP package with components, tokens, and docs.

---

## Inputs
- `ExportableComponent[]`, `PackageConfig` (from chunk 7.01)
- `generateLLMSTxt()` (from chunk 7.02)

## Outputs
- `downloadPackage()` function (consumed by chunk 7.05)
- `generatePackageJson()` function
- `generateReadme()` function

---

## Dependencies
- Chunk 7.01 must be complete
- Chunk 7.02 must be complete

---

## Implementation Notes

### Key Considerations
- Use JSZip for ZIP creation
- Use file-saver for download
- Include package.json, README, LLMS.txt, component files

### Gotchas
- Install: `npm install jszip file-saver`
- Install types: `npm install -D @types/file-saver`

---

## Files Created
- `src/lib/export/packageGenerator.ts` — Generator
- `src/lib/export/__tests__/packageGenerator.test.ts` — Tests

---

## Implementation

### `src/lib/export/packageGenerator.ts`

```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ExportableComponent, PackageConfig } from './types';
import { getPublishableComponents, generateComponentsIndex, sanitizePackageName } from './utils';
import { generateLLMSTxt } from './llmsGenerator';

export function generatePackageJson(config: PackageConfig): string {
  return JSON.stringify({
    name: config.packageName,
    version: config.version,
    description: config.description,
    main: 'dist/components/index.js',
    peerDependencies: { react: '>=17.0.0', 'react-dom': '>=17.0.0' },
    license: config.license || 'MIT',
  }, null, 2);
}

export function generateReadme(components: ExportableComponent[], config: PackageConfig): string {
  const published = getPublishableComponents(components);
  return `# ${config.packageName}

## Installation
\`\`\`bash
npm install ${config.packageName}
\`\`\`

## Components
${published.map(c => `- **${c.name}**`).join('\n')}

## Version
${config.version}
`;
}

export async function downloadPackage(
  components: ExportableComponent[],
  config: PackageConfig,
  tokensCss?: string
): Promise<{ componentCount: number; totalSize: number }> {
  const published = getPublishableComponents(components);
  const zip = new JSZip();

  zip.file('package.json', generatePackageJson(config));
  zip.file('README.md', generateReadme(components, config));
  zip.file('LLMS.txt', generateLLMSTxt(components, config));
  zip.file('dist/tokens.css', tokensCss || '/* tokens */');

  for (const c of published) {
    zip.file(`dist/components/${c.name}/${c.name}.jsx`, c.jsx_code);
    zip.file(`dist/components/${c.name}/index.js`, `export { ${c.name} } from './${c.name}';`);
  }
  zip.file('dist/components/index.js', generateComponentsIndex(published));

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${sanitizePackageName(config.packageName)}-${config.version}.zip`);

  return { componentCount: published.length, totalSize: blob.size };
}
```

---

## Tests

### Unit Tests
- [ ] generatePackageJson includes required fields
- [ ] generateReadme includes component list
- [ ] downloadPackage creates ZIP with correct files

### Verification
- [ ] `npm test src/lib/export/__tests__/packageGenerator.test.ts` passes

---

## Time Estimate
1.5 hours
