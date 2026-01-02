# Chunk 8.08 — Full Package + Integration

## Purpose
ZIP with all AI formats and Settings page integration.

---

## Inputs
- `AIExportPanel` component (from chunk 8.07)
- MCP server (from chunk 8.06)
- All generators (from chunks 8.03-8.05)

## Outputs
- `downloadAIPackage()` function
- Updated `Settings.jsx` with AI export section

---

## Dependencies
- Chunk 8.07 must be complete
- Chunk 8.06 must be complete

---

## Files Created
- `src/lib/aiExport/fullPackage.ts` — ZIP generator
- Update `src/pages/Settings.jsx` — Add AI export panel

---

## Implementation

### `src/lib/aiExport/fullPackage.ts`

```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AIExportBundle } from './types';
import { generateCursorRules, CURSOR_RULES_PATH } from './cursorRules';
import { generateClaudeMd, generateClaudeTokensRule, CLAUDE_CODE_PATHS } from './claudeCode';
import { generateProjectKnowledge } from './projectKnowledge';

export async function downloadAIPackage(bundle: AIExportBundle): Promise<void> {
  const zip = new JSZip();
  const { packageName, version } = bundle.metadata;

  zip.file(CURSOR_RULES_PATH, generateCursorRules(bundle));
  zip.file(CLAUDE_CODE_PATHS.main, generateClaudeMd(bundle));
  zip.file(CLAUDE_CODE_PATHS.tokens, generateClaudeTokensRule(bundle));
  zip.file('project-knowledge.txt', generateProjectKnowledge(bundle));
  zip.file('design-system.json', JSON.stringify({ tokens: bundle.tokens, components: bundle.components, themes: bundle.themes }, null, 2));
  zip.file('README.md', generateReadme(bundle));

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${packageName.replace('@', '').replace('/', '-')}-ai-export-${version}.zip`);
}

function generateReadme(bundle: AIExportBundle): string {
  return `# AI Export Package

## ${bundle.metadata.packageName} v${bundle.metadata.version}

| File | Platform |
|------|----------|
| .cursor/rules/*.mdc | Cursor |
| CLAUDE.md | Claude Code |
| project-knowledge.txt | Bolt, Lovable |
| design-system.json | MCP Server |

Tokens: ${bundle.tokens.length} | Components: ${bundle.components.filter(c => c.status === 'published').length}
`;
}
```

### Settings.jsx Addition

```jsx
// Add import
import AIExportPanel from '../components/AIExportPanel';

// Create bundle in component
const aiBundle = useMemo(() => ({
  tokens: allTokens,
  components,
  themes: availableThemes,
  metadata: { packageName, version, exportedAt: new Date().toISOString() },
}), [allTokens, components, availableThemes, packageName, version]);

// Add after existing export section
<AIExportPanel bundle={aiBundle} />
```

---

## Tests

### Integration Tests
- [ ] ZIP contains all expected files
- [ ] Settings page shows AI export panel

---

## Time Estimate
1 hour
