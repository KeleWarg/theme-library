import { useState } from 'react';
import { Copy, Download, Check, Sparkles } from 'lucide-react';
import { generateCursorRules } from '../lib/aiExport/cursorRules';
import { generateClaudeMd, generateClaudeTokensRule } from '../lib/aiExport/claudeCode';
import { generateProjectKnowledge } from '../lib/aiExport/projectKnowledge';

const formats = [
  { id: 'cursor', name: 'Cursor Rules', desc: '.cursor/rules/*.mdc', actions: ['copy', 'download'] },
  { id: 'claude', name: 'Claude Code', desc: 'CLAUDE.md + rules', actions: ['copy', 'download'] },
  { id: 'bolt', name: 'Bolt/Lovable', desc: 'Project Knowledge', actions: ['copy'] },
];

export default function AIExportPanel({ bundle }) {
  const [copied, setCopied] = useState(null);

  const getContent = (format) => {
    switch (format) {
      case 'cursor': return generateCursorRules(bundle);
      case 'claude': return generateClaudeMd(bundle) + '\n---\n' + generateClaudeTokensRule(bundle);
      case 'bolt': return generateProjectKnowledge(bundle);
      default: return '';
    }
  };

  const handleCopy = async (format) => {
    await navigator.clipboard.writeText(getContent(format));
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (format) => {
    const content = getContent(format);
    const filename = format === 'cursor' ? 'design-system.mdc' : 'CLAUDE.md';
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <section data-testid="ai-export-panel" style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sparkles size={18} style={{ color: '#7c3aed' }} />
        <h3 style={{ margin: 0 }}>Export for AI Platforms</h3>
      </div>

      <p data-testid="bundle-stats" style={{ color: 'var(--color-fg-caption)', marginBottom: '16px', fontSize: '14px' }}>
        {bundle.tokens.length} tokens • {bundle.components.filter(c => c.status === 'published').length} components
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {formats.map((f) => (
          <div key={f.id} data-testid={`format-${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '6px' }}>
            <div>
              <strong>{f.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--color-fg-caption)' }}>{f.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {f.actions.includes('copy') && (
                <button 
                  data-testid={`copy-${f.id}`}
                  onClick={() => handleCopy(f.id)} 
                  style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: 'white' }}
                >
                  {copied === f.id ? <Check size={14} /> : <Copy size={14} />}
                  {copied === f.id ? 'Copied!' : 'Copy'}
                </button>
              )}
              {f.actions.includes('download') && (
                <button 
                  data-testid={`download-${f.id}`}
                  onClick={() => handleDownload(f.id)} 
                  style={{ padding: '8px 12px', background: 'var(--color-btn-primary-bg)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

