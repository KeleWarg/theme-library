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

export { generateReadme };

