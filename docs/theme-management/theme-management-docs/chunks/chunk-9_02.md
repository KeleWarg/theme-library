# Chunk 9.02 — Plugin UI

## Purpose
HTML/CSS UI for the Figma plugin.

---

## Inputs
- Plugin scaffold (from chunk 9.01)

## Outputs
- `ui.html` — Plugin interface

---

## Dependencies
- Chunk 9.01 must be complete

---

## Files Created
- `figma-variables-exporter/ui.html`

---

## Implementation

### `ui.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 16px; font-size: 13px; }
    h2 { font-size: 14px; margin-bottom: 16px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 8px; }
    .collection-list { max-height: 150px; overflow-y: auto; border: 1px solid #e5e5e5; border-radius: 6px; padding: 8px; }
    .collection-item { display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; }
    .collection-item:hover { background: #f5f5f5; }
    .checkbox-group { display: flex; flex-direction: column; gap: 10px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .button-group { display: flex; gap: 8px; margin-top: 20px; }
    button { flex: 1; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #18a0fb; color: white; border: none; }
    .btn-secondary { background: white; border: 1px solid #e5e5e5; }
    .status { margin-top: 16px; padding: 12px; border-radius: 6px; display: none; }
    .status.success { display: block; background: #e6f4ea; color: #1e7e34; }
    .status.error { display: block; background: #fce8e6; color: #c5221f; }
    .api-section { padding: 12px; background: #f9f9f9; border-radius: 6px; margin-bottom: 16px; }
    .api-section input { width: 100%; padding: 8px; border: 1px solid #e5e5e5; border-radius: 4px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h2>📦 Variables Exporter</h2>
  
  <div class="section">
    <div class="section-title">Collections</div>
    <div id="collections" class="collection-list">Loading...</div>
  </div>
  
  <div class="section">
    <div class="section-title">Options</div>
    <div class="checkbox-group">
      <label class="checkbox-label"><input type="checkbox" id="exportColors" checked> Colors</label>
      <label class="checkbox-label"><input type="checkbox" id="exportTypography" checked> Typography</label>
      <label class="checkbox-label"><input type="checkbox" id="exportSpacing" checked> Spacing</label>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">API Sync (Optional)</div>
    <div class="api-section">
      <input type="text" id="apiUrl" placeholder="Dashboard URL">
      <input type="password" id="apiKey" placeholder="API Key">
    </div>
  </div>
  
  <div class="button-group">
    <button class="btn-secondary" id="cancelBtn">Cancel</button>
    <button class="btn-primary" id="exportBtn">Export JSON</button>
  </div>
  
  <div id="status" class="status"></div>

  <script>
    const selected = new Set();
    
    window.onmessage = (e) => {
      const msg = e.data.pluginMessage;
      if (msg.type === 'collections') renderCollections(msg.collections);
      if (msg.type === 'export-complete') { showStatus('success', `✓ Exported ${msg.fileCount} files`); msg.files.forEach((f, i) => setTimeout(() => download(f.name, f.content), i * 300)); }
      if (msg.type === 'error') showStatus('error', msg.message);
    };
    
    function renderCollections(cols) {
      const el = document.getElementById('collections');
      el.innerHTML = cols.map(c => `<div class="collection-item" data-id="${c.id}"><input type="checkbox" checked><span>${c.name}</span></div>`).join('');
      el.querySelectorAll('.collection-item').forEach(item => { selected.add(item.dataset.id); item.querySelector('input').onchange = (e) => e.target.checked ? selected.add(item.dataset.id) : selected.delete(item.dataset.id); });
    }
    
    function showStatus(type, msg) { const el = document.getElementById('status'); el.className = `status ${type}`; el.textContent = msg; }
    function download(name, content) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content])); a.download = name; a.click(); }
    
    document.getElementById('exportBtn').onclick = () => parent.postMessage({ pluginMessage: { type: 'export', collections: [...selected], options: { colors: document.getElementById('exportColors').checked, typography: document.getElementById('exportTypography').checked, spacing: document.getElementById('exportSpacing').checked }}}, '*');
    document.getElementById('cancelBtn').onclick = () => parent.postMessage({ pluginMessage: { type: 'cancel' }}, '*');
  </script>
</body>
</html>
```

---

## Verification
- [ ] UI renders in Figma plugin window
- [ ] Collections list populates

---

## Time Estimate
1 hour
