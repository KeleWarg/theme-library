# Chunk 7.05 — Export Modal Component

## Purpose
Modal UI for configuring and triggering package export.

---

## Inputs
- `downloadPackage()` (from chunk 7.03)
- `downloadLLMSTxt()` (from chunk 7.02)

## Outputs
- `ExportModal` component (consumed by chunk 7.06)

---

## Dependencies
- Chunk 7.03 must be complete

---

## Files Created
- `src/components/export/ExportModal.jsx` — Component
- `src/components/export/__tests__/ExportModal.test.jsx` — Tests

---

## Implementation

### `src/components/export/ExportModal.jsx`

```jsx
import { useState } from 'react';
import { X, Download, FileText, Package } from 'lucide-react';
import { downloadPackage } from '../../lib/export/packageGenerator';
import { downloadLLMSTxt } from '../../lib/export/llmsGenerator';
import { DEFAULT_PACKAGE_CONFIG } from '../../lib/export/types';

export default function ExportModal({ isOpen, onClose, components }) {
  const [packageName, setPackageName] = useState(DEFAULT_PACKAGE_CONFIG.packageName);
  const [version, setVersion] = useState(DEFAULT_PACKAGE_CONFIG.version);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const publishedCount = components.filter(c => c.status === 'published' && c.jsx_code).length;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await downloadPackage(components, { packageName, version });
      setResult({ success: true, message: `Exported ${res.componentCount} components` });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg-white)', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Export Package</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <input value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="Package name" style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
        <input value={version} onChange={e => setVersion(e.target.value)} placeholder="Version" style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '6px' }} />

        <p style={{ color: 'var(--color-fg-caption)', marginBottom: '16px' }}>{publishedCount} components ready</p>

        {result && <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '16px', background: result.success ? '#e6f4ea' : '#fce8e6' }}>{result.message}</div>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} disabled={exporting || !publishedCount} style={{ flex: 1, padding: '12px', background: 'var(--color-btn-primary-bg)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            <Package size={16} style={{ marginRight: '8px' }} />{exporting ? 'Exporting...' : 'Export Package'}
          </button>
          <button onClick={() => downloadLLMSTxt(components, { packageName, version })} style={{ padding: '12px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
            <FileText size={16} /> LLMS.txt
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Tests

### Unit Tests
- [ ] Renders when open, hides when closed
- [ ] Shows published count
- [ ] Export button triggers download

---

## Time Estimate
1.5 hours
