import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePackageJson, generateReadme, downloadPackage } from '../packageGenerator';
import type { ExportableComponent, PackageConfig } from '../types';

// Mock jszip
vi.mock('jszip', () => {
  const mockZip = {
    file: vi.fn(),
    generateAsync: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/zip' })),
  };
  return {
    default: vi.fn(() => mockZip),
  };
});

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('packageGenerator', () => {
  const mockConfig: PackageConfig = {
    packageName: '@test/design-system',
    version: '1.0.0',
    description: 'Test design system',
    license: 'MIT',
  };

  const mockComponents: ExportableComponent[] = [
    {
      id: '1',
      name: 'Button',
      slug: 'button',
      description: 'A button component',
      jsx_code: 'export const Button = () => <button>Click</button>;',
      props: [{ name: 'variant', type: 'string' }],
      status: 'published',
    },
    {
      id: '2',
      name: 'Card',
      slug: 'card',
      description: 'A card component',
      jsx_code: 'export const Card = () => <div>Card</div>;',
      status: 'published',
    },
    {
      id: '3',
      name: 'Draft',
      slug: 'draft',
      jsx_code: 'export const Draft = () => <div>Draft</div>;',
      status: 'pending',
    },
  ];

  describe('generatePackageJson', () => {
    it('includes package name', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('@test/design-system');
    });

    it('includes version', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.version).toBe('1.0.0');
    });

    it('includes description', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.description).toBe('Test design system');
    });

    it('includes main entry point', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.main).toBe('dist/components/index.js');
    });

    it('includes peer dependencies for React', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.peerDependencies).toEqual({
        react: '>=17.0.0',
        'react-dom': '>=17.0.0',
      });
    });

    it('includes license', () => {
      const result = generatePackageJson(mockConfig);
      const parsed = JSON.parse(result);
      expect(parsed.license).toBe('MIT');
    });

    it('defaults license to MIT if not provided', () => {
      const configWithoutLicense: PackageConfig = {
        packageName: '@test/pkg',
        version: '1.0.0',
      };
      const result = generatePackageJson(configWithoutLicense);
      const parsed = JSON.parse(result);
      expect(parsed.license).toBe('MIT');
    });

    it('returns valid JSON', () => {
      const result = generatePackageJson(mockConfig);
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('generateReadme', () => {
    it('includes package name as title', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).toContain('# @test/design-system');
    });

    it('includes installation instructions', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).toContain('## Installation');
      expect(result).toContain('npm install @test/design-system');
    });

    it('includes component list section', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).toContain('## Components');
    });

    it('lists published components', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).toContain('- **Button**');
      expect(result).toContain('- **Card**');
    });

    it('excludes non-published components', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).not.toContain('- **Draft**');
    });

    it('includes version', () => {
      const result = generateReadme(mockComponents, mockConfig);
      expect(result).toContain('## Version');
      expect(result).toContain('1.0.0');
    });

    it('handles empty components array', () => {
      const result = generateReadme([], mockConfig);
      expect(result).toContain('# @test/design-system');
      expect(result).toContain('## Components');
    });
  });

  describe('downloadPackage', () => {
    let JSZip: typeof import('jszip').default;
    let saveAs: typeof import('file-saver').saveAs;
    let mockZipInstance: { file: ReturnType<typeof vi.fn>; generateAsync: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      vi.clearAllMocks();
      JSZip = (await import('jszip')).default;
      saveAs = (await import('file-saver')).saveAs;
      mockZipInstance = new (JSZip as unknown as new () => typeof mockZipInstance)();
    });

    it('creates ZIP with package.json', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'package.json',
        expect.stringContaining('"name": "@test/design-system"')
      );
    });

    it('creates ZIP with README.md', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'README.md',
        expect.stringContaining('# @test/design-system')
      );
    });

    it('creates ZIP with LLMS.txt', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'LLMS.txt',
        expect.stringContaining('AI Assistant Guide')
      );
    });

    it('creates ZIP with tokens.css', async () => {
      const tokensCss = ':root { --color-primary: blue; }';
      await downloadPackage(mockComponents, mockConfig, tokensCss);
      expect(mockZipInstance.file).toHaveBeenCalledWith('dist/tokens.css', tokensCss);
    });

    it('uses default tokens when not provided', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith('dist/tokens.css', '/* tokens */');
    });

    it('creates component files for published components', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'dist/components/Button/Button.jsx',
        'export const Button = () => <button>Click</button>;'
      );
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'dist/components/Card/Card.jsx',
        'export const Card = () => <div>Card</div>;'
      );
    });

    it('creates index files for each component', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'dist/components/Button/index.js',
        "export { Button } from './Button';"
      );
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'dist/components/Card/index.js',
        "export { Card } from './Card';"
      );
    });

    it('creates main components index', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'dist/components/index.js',
        expect.stringContaining("export { Button } from './Button'")
      );
    });

    it('excludes non-published components from ZIP', async () => {
      await downloadPackage(mockComponents, mockConfig);
      const calls = mockZipInstance.file.mock.calls.map((c: unknown[]) => c[0]);
      expect(calls).not.toContain('dist/components/Draft/Draft.jsx');
    });

    it('calls saveAs with correct filename', async () => {
      await downloadPackage(mockComponents, mockConfig);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'test-design-system-1.0.0.zip'
      );
    });

    it('returns component count', async () => {
      const result = await downloadPackage(mockComponents, mockConfig);
      expect(result.componentCount).toBe(2); // Only published: Button, Card
    });

    it('returns total size', async () => {
      const result = await downloadPackage(mockComponents, mockConfig);
      expect(result.totalSize).toBeGreaterThan(0);
    });

    it('handles empty components array', async () => {
      const result = await downloadPackage([], mockConfig);
      expect(result.componentCount).toBe(0);
    });
  });
});

