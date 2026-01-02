# Chunk 9.05 — API Sync

## Purpose
Sync exported tokens directly to admin dashboard API.

---

## Inputs
- Export logic (from chunk 9.04)
- Theme service API endpoint (from chunk 1.02)

## Outputs
- Sync functionality in plugin
- API endpoint in admin dashboard (if needed)

---

## Dependencies
- Chunk 9.04 must be complete
- Chunk 1.02 (Theme Service) exists

---

## Files Created
- Update `figma-variables-exporter/src/code.ts` — Add sync handler
- `src/api/tokens.js` (admin dashboard) — API endpoint

---

## Implementation

### Update `code.ts` — Add sync handler

```typescript
// Add to figma.ui.onmessage handler
if (msg.type === 'sync') {
  try {
    figma.ui.postMessage({ type: 'loading', message: 'Syncing...' });
    
    const files = await exportVariables(msg.collections, msg.options);
    
    const response = await fetch(msg.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${msg.apiKey}`,
      },
      body: JSON.stringify({
        tokens: files,
        timestamp: new Date().toISOString(),
        source: 'figma-plugin',
      }),
    });

    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    figma.ui.postMessage({ type: 'sync-complete' });
    figma.notify('✓ Synced to dashboard');
  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: `Sync failed: ${e}` });
  }
}
```

### Admin Dashboard API — `src/api/tokens.js`

```javascript
import { supabase } from '../lib/supabase';

export async function POST(request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ') || auth.slice(7) !== process.env.FIGMA_SYNC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { tokens, timestamp, source } = await request.json();

    for (const file of tokens) {
      const themeName = file.name.replace(/_tokens\.json$/, '').replace(/_/g, ' ');
      const slug = themeName.toLowerCase().replace(/\s+/g, '-');
      
      const { data: theme } = await supabase
        .from('themes')
        .upsert({ name: themeName, slug, source, updated_at: timestamp }, { onConflict: 'slug' })
        .select()
        .single();

      const flatTokens = flattenTokens(JSON.parse(file.content), theme.id);
      await supabase.from('theme_tokens').upsert(flatTokens, { onConflict: 'theme_id,category,name' });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

function flattenTokens(data, themeId, path = []) {
  const tokens = [];
  for (const [key, value] of Object.entries(data)) {
    if (value.$type && value.$value !== undefined) {
      tokens.push({ theme_id: themeId, category: path[0] || 'other', name: key, value: value.$value, css_variable: `--${[...path, key].join('-')}` });
    } else if (typeof value === 'object') {
      tokens.push(...flattenTokens(value, themeId, [...path, key]));
    }
  }
  return tokens;
}
```

---

## Verification
- [ ] Sync button calls API
- [ ] Tokens appear in dashboard after sync

---

## Time Estimate
1 hour
