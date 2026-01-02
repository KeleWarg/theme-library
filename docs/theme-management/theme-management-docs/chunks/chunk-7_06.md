# Chunk 7.06 — Settings Page

## Purpose
Settings page with export controls and AI configuration status.

---

## Inputs
- `ExportModal` component (from chunk 7.05)
- `isAIConfigured()` (from chunk 6.03)

## Outputs
- `Settings` page component (consumed by router)

---

## Dependencies
- Chunk 7.05 must be complete

---

## Files Created
- `src/pages/Settings.jsx` — Page component
- `src/pages/__tests__/Settings.test.jsx` — Tests

---

## Implementation

### `src/pages/Settings.jsx`

```jsx
import { useState } from 'react';
import { Download, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { useComponents } from '../hooks/useComponents';
import { isAIConfigured } from '../lib/ai/generateCode';
import ExportModal from '../components/export/ExportModal';

export default function Settings() {
  const { components } = useComponents();
  const [showExportModal, setShowExportModal] = useState(false);

  const publishedCount = components.filter(c => c.status === 'published' && c.jsx_code).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <SettingsIcon size={28} /> Settings
      </h1>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px' }}>Export Package</h2>
        <p style={{ marginBottom: '16px' }}>Export your design system as an npm package.</p>
        <div style={{ display: 'flex', gap: '24px', padding: '16px', background: 'var(--color-bg-neutral-light)', borderRadius: '6px', marginBottom: '24px' }}>
          <div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{publishedCount}</div><div style={{ color: 'var(--color-fg-caption)' }}>Published</div></div>
          <div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{components.length}</div><div style={{ color: 'var(--color-fg-caption)' }}>Total</div></div>
        </div>
        <button onClick={() => setShowExportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--color-btn-primary-bg)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          <Download size={16} /> Export Package
        </button>
      </section>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px' }}>
        <h2 style={{ margin: '0 0 16px' }}>AI Configuration</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAIConfigured() ? (
            <><CheckCircle size={20} style={{ color: 'green' }} /> API configured</>
          ) : (
            <><XCircle size={20} style={{ color: 'red' }} /> API key not configured</>
          )}
        </div>
      </section>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} components={components} />
    </div>
  );
}
```

---

## Tests

### Unit Tests
- [ ] Renders export section
- [ ] Shows published count
- [ ] Shows AI configuration status

---

## Time Estimate
1.5 hours
