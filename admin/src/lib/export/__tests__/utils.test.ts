import { describe, it, expect } from 'vitest';
import {
  getPublishableComponents,
  generateComponentsIndex,
  sanitizePackageName,
  formatFileSize,
} from '../utils';
import type { ExportableComponent } from '../types';

describe('Export Utils', () => {
  describe('getPublishableComponents', () => {
    it('filters components by published status and presence of code', () => {
      const components: ExportableComponent[] = [
        { id: '1', name: 'Button', slug: 'button', jsx_code: 'export const Button = () => <button>Click</button>;', status: 'published' },
        { id: '2', name: 'Card', slug: 'card', jsx_code: 'export const Card = () => <div>Card</div>;', status: 'approved' },
        { id: '3', name: 'Input', slug: 'input', jsx_code: 'export const Input = () => <input />;', status: 'published' },
        { id: '4', name: 'Empty', slug: 'empty', jsx_code: '', status: 'published' },
        { id: '5', name: 'Pending', slug: 'pending', jsx_code: 'code', status: 'pending' },
      ];

      const result = getPublishableComponents(components);

      expect(result).toHaveLength(2);
      expect(result.map(c => c.name)).toEqual(['Button', 'Input']);
    });

    it('returns empty array when no components are publishable', () => {
      const components: ExportableComponent[] = [
        { id: '1', name: 'Draft', slug: 'draft', jsx_code: '', status: 'pending' },
        { id: '2', name: 'Approved', slug: 'approved', jsx_code: 'code', status: 'approved' },
      ];

      const result = getPublishableComponents(components);

      expect(result).toHaveLength(0);
    });

    it('filters out components with whitespace-only code', () => {
      const components: ExportableComponent[] = [
        { id: '1', name: 'Whitespace', slug: 'whitespace', jsx_code: '   \n\t  ', status: 'published' },
        { id: '2', name: 'Valid', slug: 'valid', jsx_code: 'export const Valid = () => null;', status: 'published' },
      ];

      const result = getPublishableComponents(components);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Valid');
    });

    it('handles empty array input', () => {
      const result = getPublishableComponents([]);
      expect(result).toEqual([]);
    });
  });

  describe('generateComponentsIndex', () => {
    it('creates export statements for components', () => {
      const components: ExportableComponent[] = [
        { id: '1', name: 'Button', slug: 'button', jsx_code: 'code', status: 'published' },
        { id: '2', name: 'Card', slug: 'card', jsx_code: 'code', status: 'published' },
        { id: '3', name: 'Input', slug: 'input', jsx_code: 'code', status: 'published' },
      ];

      const result = generateComponentsIndex(components);

      expect(result).toBe(
        `export { Button } from './Button';\nexport { Card } from './Card';\nexport { Input } from './Input';`
      );
    });

    it('returns empty string for empty array', () => {
      const result = generateComponentsIndex([]);
      expect(result).toBe('');
    });

    it('handles single component', () => {
      const components: ExportableComponent[] = [
        { id: '1', name: 'Button', slug: 'button', jsx_code: 'code', status: 'published' },
      ];

      const result = generateComponentsIndex(components);

      expect(result).toBe(`export { Button } from './Button';`);
    });
  });

  describe('sanitizePackageName', () => {
    it('handles @ symbol in scoped package names', () => {
      expect(sanitizePackageName('@myorg/design-system')).toBe('myorg-design-system');
    });

    it('handles / in package names', () => {
      expect(sanitizePackageName('org/package')).toBe('org-package');
    });

    it('replaces invalid characters with hyphens', () => {
      expect(sanitizePackageName('my_package!name')).toBe('my-package-name');
    });

    it('preserves valid characters', () => {
      expect(sanitizePackageName('valid-package-123')).toBe('valid-package-123');
    });

    it('handles complex scoped package names', () => {
      expect(sanitizePackageName('@scope/my_package.name')).toBe('scope-my-package-name');
    });

    it('handles empty string', () => {
      expect(sanitizePackageName('')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    });

    it('handles boundary values', () => {
      expect(formatFileSize(1024 - 1)).toBe('1023 B');
      expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.0 KB');
    });
  });
});

