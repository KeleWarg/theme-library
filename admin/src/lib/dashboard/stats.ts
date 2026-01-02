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

