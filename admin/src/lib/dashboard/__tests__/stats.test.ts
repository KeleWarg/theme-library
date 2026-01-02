import { describe, it, expect } from 'vitest';
import { calculateStats, getComponentsNeedingAttention, type DashboardStats } from '../stats';
import type { ExportableComponent } from '../../export/types';

// Helper to create test components
function createComponent(overrides: Partial<ExportableComponent> = {}): ExportableComponent {
  return {
    id: 'test-id',
    name: 'TestComponent',
    slug: 'test-component',
    jsx_code: '<div>Test</div>',
    status: 'pending',
    code_status: 'pending',
    ...overrides,
  };
}

describe('calculateStats', () => {
  it('returns correct counts for empty array', () => {
    const stats = calculateStats([]);
    
    expect(stats).toEqual({
      total: 0,
      published: 0,
      approved: 0,
      generated: 0,
      pending: 0,
      needsAttention: 0,
    });
  });

  it('returns correct counts for mixed statuses', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', status: 'published', code_status: 'published' }),
      createComponent({ id: '2', status: 'published', code_status: 'published' }),
      createComponent({ id: '3', status: 'approved', code_status: 'approved' }),
      createComponent({ id: '4', status: 'generated', code_status: 'generated' }),
      createComponent({ id: '5', status: 'pending', code_status: 'pending' }),
      createComponent({ id: '6', status: 'pending', code_status: 'pending' }),
    ];

    const stats = calculateStats(components);

    expect(stats.total).toBe(6);
    expect(stats.published).toBe(2);
    expect(stats.approved).toBe(1);
    expect(stats.generated).toBe(1);
    expect(stats.pending).toBe(2);
    expect(stats.needsAttention).toBe(3); // 1 generated + 2 pending
  });

  it('handles undefined code_status', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', status: 'pending', code_status: undefined }),
      createComponent({ id: '2', status: 'approved', code_status: undefined }),
    ];

    const stats = calculateStats(components);

    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(0);
    expect(stats.needsAttention).toBe(0);
  });

  it('counts needsAttention correctly for generated and pending', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', code_status: 'generated' }),
      createComponent({ id: '2', code_status: 'generated' }),
      createComponent({ id: '3', code_status: 'pending' }),
      createComponent({ id: '4', code_status: 'approved' }),
      createComponent({ id: '5', code_status: 'published' }),
    ];

    const stats = calculateStats(components);

    expect(stats.needsAttention).toBe(3); // 2 generated + 1 pending
  });
});

describe('getComponentsNeedingAttention', () => {
  it('returns empty array when no components need attention', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', status: 'published', code_status: 'published' }),
      createComponent({ id: '2', status: 'approved', code_status: 'approved' }),
    ];

    const result = getComponentsNeedingAttention(components);

    expect(result).toEqual([]);
  });

  it('filters to only pending and generated components', () => {
    const pending = createComponent({ id: '1', code_status: 'pending' });
    const generated = createComponent({ id: '2', code_status: 'generated' });
    const approved = createComponent({ id: '3', code_status: 'approved' });
    const published = createComponent({ id: '4', code_status: 'published' });

    const result = getComponentsNeedingAttention([pending, generated, approved, published]);

    expect(result).toHaveLength(2);
    expect(result).toContain(pending);
    expect(result).toContain(generated);
  });

  it('respects the default limit of 5', () => {
    const components: ExportableComponent[] = Array.from({ length: 10 }, (_, i) =>
      createComponent({ id: String(i), code_status: 'pending' })
    );

    const result = getComponentsNeedingAttention(components);

    expect(result).toHaveLength(5);
  });

  it('respects custom limit', () => {
    const components: ExportableComponent[] = Array.from({ length: 10 }, (_, i) =>
      createComponent({ id: String(i), code_status: 'pending' })
    );

    const result = getComponentsNeedingAttention(components, 3);

    expect(result).toHaveLength(3);
  });

  it('returns all if fewer than limit', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', code_status: 'pending' }),
      createComponent({ id: '2', code_status: 'generated' }),
    ];

    const result = getComponentsNeedingAttention(components, 10);

    expect(result).toHaveLength(2);
  });

  it('handles undefined code_status', () => {
    const components: ExportableComponent[] = [
      createComponent({ id: '1', code_status: undefined }),
      createComponent({ id: '2', code_status: 'pending' }),
    ];

    const result = getComponentsNeedingAttention(components);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

