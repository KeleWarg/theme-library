# Chunk 7.08 — Dashboard Page

## Purpose
Main dashboard with stats and quick actions.

---

## Inputs
- `calculateStats()`, `getComponentsNeedingAttention()` (from chunk 7.07)
- `StatCard` component (from chunk 7.07)

## Outputs
- `Dashboard` page component (consumed by router)

---

## Dependencies
- Chunk 7.07 must be complete

---

## Files Created
- `src/pages/Dashboard.jsx` — Page component
- `src/pages/__tests__/Dashboard.test.jsx` — Tests

---

## Implementation

### `src/pages/Dashboard.jsx`

```jsx
import { Link } from 'react-router-dom';
import { Package, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useComponents } from '../hooks/useComponents';
import { calculateStats, getComponentsNeedingAttention } from '../lib/dashboard/stats';
import StatCard from '../components/dashboard/StatCard';

export default function Dashboard() {
  const { components, loading } = useComponents();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const stats = calculateStats(components);
  const needsAttention = getComponentsNeedingAttention(components, 5);

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Components" value={stats.total} icon={Package} />
        <StatCard label="Published" value={stats.published} color="green" icon={CheckCircle} />
        <StatCard label="Needs Attention" value={stats.needsAttention} color="orange" icon={AlertCircle} />
      </div>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px' }}>Needs Attention</h2>
        {needsAttention.length === 0 ? (
          <p style={{ color: 'var(--color-fg-caption)' }}>All components up to date! 🎉</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {needsAttention.map(c => (
              <Link key={c.slug} to={`/components/${c.slug}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-neutral-light)', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px' }}>
        <h2 style={{ margin: '0 0 16px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/components" style={{ padding: '12px 24px', background: 'var(--color-btn-primary-bg)', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>View Components</Link>
          <Link to="/settings" style={{ padding: '12px 24px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>Export Package</Link>
        </div>
      </section>
    </div>
  );
}
```

---

## Tests

### Unit Tests
- [ ] Renders stats cards
- [ ] Renders needs attention list
- [ ] Quick actions link correctly

---

## Time Estimate
1 hour
