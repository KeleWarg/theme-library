import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateLLMSTxt, downloadLLMSTxt } from '../llmsGenerator';
import type { ExportableComponent, PackageConfig } from '../types';

describe('llmsGenerator', () => {
  const mockConfig: PackageConfig = {
    packageName: '@test/design-system',
    version: '1.0.0',
    description: 'Test design system',
  };

  const mockComponents: ExportableComponent[] = [
    {
      id: '1',
      name: 'Button',
      slug: 'button',
      description: 'A clickable button component',
      jsx_code: 'export const Button = () => <button>Click</button>;',
      props: [
        { name: 'variant', type: 'string', default: "'primary'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      status: 'published',
    },
    {
      id: '2',
      name: 'Card',
      slug: 'card',
      description: 'A card container',
      jsx_code: 'export const Card = () => <div>Card</div>;',
      props: [{ name: 'title', type: 'string' }],
      status: 'published',
    },
    {
      id: '3',
      name: 'DraftComponent',
      slug: 'draft',
      jsx_code: 'export const DraftComponent = () => <div>Draft</div>;',
      status: 'pending',
    },
  ];

  describe('generateLLMSTxt', () => {
    it('includes package name in title', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('# @test/design-system - AI Assistant Guide');
    });

    it('includes quick start with correct imports', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain("import '@test/design-system/dist/tokens.css'");
      expect(result).toContain("import { Button, Card } from '@test/design-system'");
    });

    it('includes component sections for published components', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('### Button');
      expect(result).toContain('### Card');
      expect(result).not.toContain('### DraftComponent');
    });

    it('includes component descriptions', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('A clickable button component');
      expect(result).toContain('A card container');
    });

    it('includes props table for components', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('| variant | `string` |');
      expect(result).toContain('| disabled | `boolean` |');
      expect(result).toContain('| title | `string` |');
    });

    it('includes default values in props table', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain("'primary'");
      expect(result).toContain('false');
    });

    it('handles missing props gracefully', () => {
      const componentsWithNoProps: ExportableComponent[] = [
        {
          id: '1',
          name: 'Simple',
          slug: 'simple',
          jsx_code: 'export const Simple = () => <div>Simple</div>;',
          status: 'published',
        },
      ];
      const result = generateLLMSTxt(componentsWithNoProps, mockConfig);
      expect(result).toContain('### Simple');
      expect(result).toContain('| - | - | - |');
    });

    it('includes themes list', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('## Themes');
      expect(result).toContain('`theme-health-sem`');
      expect(result).toContain('`theme-home-sem`');
      expect(result).toContain('`theme-llm`');
      expect(result).toContain('`theme-forbes-media-seo`');
    });

    it('includes design tokens reference', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('## Design Tokens');
      expect(result).toContain('var(--color-bg-white)');
      expect(result).toContain('var(--color-fg-heading)');
    });

    it('includes rules section', () => {
      const result = generateLLMSTxt(mockComponents, mockConfig);
      expect(result).toContain('## Rules');
      expect(result).toContain('✅ Use CSS variables for all styling');
      expect(result).toContain('❌ Never hardcode colors');
    });

    it('handles empty components array', () => {
      const result = generateLLMSTxt([], mockConfig);
      expect(result).toContain('# @test/design-system - AI Assistant Guide');
      expect(result).toContain('import {  } from');
    });

    it('filters out non-published components', () => {
      const mixedComponents: ExportableComponent[] = [
        {
          id: '1',
          name: 'Published',
          slug: 'published',
          jsx_code: 'code',
          status: 'published',
        },
        {
          id: '2',
          name: 'Approved',
          slug: 'approved',
          jsx_code: 'code',
          status: 'approved',
        },
        {
          id: '3',
          name: 'Generated',
          slug: 'generated',
          jsx_code: 'code',
          status: 'generated',
        },
      ];
      const result = generateLLMSTxt(mixedComponents, mockConfig);
      expect(result).toContain('### Published');
      expect(result).not.toContain('### Approved');
      expect(result).not.toContain('### Generated');
    });
  });

  describe('downloadLLMSTxt', () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('creates blob with correct content type', () => {
      downloadLLMSTxt(mockComponents, mockConfig);
      expect(createObjectURLSpy).toHaveBeenCalled();
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('text/plain');
    });

    it('creates anchor element', () => {
      downloadLLMSTxt(mockComponents, mockConfig);
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('sets correct download filename', () => {
      downloadLLMSTxt(mockComponents, mockConfig);
      expect(mockAnchor.download).toBe('LLMS.txt');
    });

    it('triggers click on anchor', () => {
      downloadLLMSTxt(mockComponents, mockConfig);
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('revokes object URL after download', () => {
      downloadLLMSTxt(mockComponents, mockConfig);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
    });
  });
});

