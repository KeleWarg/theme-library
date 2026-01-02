# Chunk 7.07 — Dashboard Stats

## Purpose
Stats calculation and StatCard component for dashboard.

---

## Inputs
- `ExportableComponent[]` (from chunk 7.01)

## Outputs
- `calculateStats()` function (consumed by chunk 7.08)
- `StatCard` component (consumed by chunk 7.08)

---

## Dependencies
- Phase 6 complete ✅

---

## Files Created
- `src/lib/dashboard/stats.ts` — Stats calculation
- `src/components/dashboard/StatCard.jsx` — Card component

---

## Implementation

### `src/lib/dashboard/stats.ts`

```typescript
import type { ExportableComponent } from '../export/types';

export interface DashboardStats {
  total: number;
  published: number;
  approved: number;
  generated: number;
  pending: number;
  needsAttention: number;
}

export function calculateStats(components: ExportableComponent[]): DashboardStats {
  return {
    total: components.length,
    published: components.filter(c => c.status === 'published').length,
    approved: components.filter(c => c.status === 'approved').length,
    generated: components.filter(c => c.code_status === 'generated').length,
    pending: components.filter(c => c.code_status === 'pending').length,
    needsAttention: components.filter(c => ['pending', 'generated'].includes(c.code_status || '')).length,
  };
}

export function getComponentsNeedingAttention(components: ExportableComponent[], limit = 5): ExportableComponent[] {
  return components.filter(c => ['pending', 'generated'].includes(c.code_status || '')).slice(0, limit);
}
```

### `src/components/dashboard/StatCard.jsx`

```jsx
export default function StatCard({ label, value, color = 'var(--color-fg-heading)', icon: Icon }) {
  return (
    <div style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--color-fg-caption)', fontSize: '14px', marginBottom: '8px' }}>{label}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>{value}</div>
        </div>
        {Icon && <Icon size={24} style={{ color: 'var(--color-fg-caption)' }} />}
      </div>
    </div>
  );
}
```

---

## Tests

### Unit Tests
- [ ] calculateStats returns correct counts
- [ ] getComponentsNeedingAttention filters correctly
- [ ] StatCard renders value and label

---

## Time Estimate
1 hour
