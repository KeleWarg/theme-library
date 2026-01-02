import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIExportBundle } from '../types';

// Use vi.hoisted to ensure mocks are available before module imports
const { mockFile, mockGenerateAsync, mockSaveAs } = vi.hoisted(() => ({
  mockFile: vi.fn(),
  mockGenerateAsync: vi.fn(),
  mockSaveAs: vi.fn(),
}));

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      file: mockFile,
      generateAsync: mockGenerateAsync,
    })),
  };
});

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs,
}));

// Import after mocks are set up
import { downloadAIPackage, generateReadme } from '../fullPackage';

describe('downloadAIPackage', () => {
  const mockBundle: AIExportBundle = {
    tokens: [
      { path: 'color.bg.white', name: 'white', category: 'color', type: 'color', value: '#FFFFFF', cssVar: '--color-bg-white' },
      { path: 'color.btn.primary-bg', name: 'primary-bg', category: 'color', type: 'color', value: '#657E79', cssVar: '--color-btn-primary-bg' },
      { path: 'typography.font-size.body', name: 'body', category: 'typography', type: 'number', value: 16, cssVar: '--typography-font-size-body' },
    ],
    components: [
      { name: 'Button', slug: 'button', description: 'A button component', status: 'published' },
      { name: 'Card', slug: 'card', description: 'A card component', status: 'approved' },
    ],
    themes: ['health-sem', 'home-sem', 'llm'],
    metadata: {
      packageName: '@design-system/tokens',
      version: '1.0.0',
      exportedAt: '2025-01-01T00:00:00.000Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateAsync.mockResolvedValue(new Blob(['test'], { type: 'application/zip' }));
  });

  it('creates ZIP with all expected files', async () => {
    await downloadAIPackage(mockBundle);

    // Should add 6 files to the ZIP
    expect(mockFile).toHaveBeenCalledTimes(6);

    // Check file paths
    const filePaths = mockFile.mock.calls.map((call) => call[0]);
    expect(filePaths).toContain('.cursor/rules/design-system.mdc');
    expect(filePaths).toContain('CLAUDE.md');
    expect(filePaths).toContain('.claude/rules/tokens.md');
    expect(filePaths).toContain('project-knowledge.txt');
    expect(filePaths).toContain('design-system.json');
    expect(filePaths).toContain('README.md');
  });

  it('generates ZIP with correct filename', async () => {
    await downloadAIPackage(mockBundle);

    expect(mockGenerateAsync).toHaveBeenCalledWith({ type: 'blob' });
    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'design-system-tokens-ai-export-1.0.0.zip'
    );
  });

  it('includes design-system.json with correct structure', async () => {
    await downloadAIPackage(mockBundle);

    // Find the design-system.json call
    const jsonCall = mockFile.mock.calls.find((call) => call[0] === 'design-system.json');
    expect(jsonCall).toBeDefined();

    const jsonContent = JSON.parse(jsonCall[1]);
    expect(jsonContent).toHaveProperty('tokens');
    expect(jsonContent).toHaveProperty('components');
    expect(jsonContent).toHaveProperty('themes');
    expect(jsonContent.tokens).toEqual(mockBundle.tokens);
    expect(jsonContent.components).toEqual(mockBundle.components);
    expect(jsonContent.themes).toEqual(mockBundle.themes);
  });

  it('handles scoped package names correctly', async () => {
    await downloadAIPackage(mockBundle);

    // @design-system/tokens should become design-system-tokens
    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'design-system-tokens-ai-export-1.0.0.zip'
    );
  });

  it('handles unscoped package names', async () => {
    const unscopedBundle: AIExportBundle = {
      ...mockBundle,
      metadata: {
        ...mockBundle.metadata,
        packageName: 'my-design-system',
      },
    };

    await downloadAIPackage(unscopedBundle);

    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'my-design-system-ai-export-1.0.0.zip'
    );
  });
});

describe('generateReadme', () => {
  const mockBundle: AIExportBundle = {
    tokens: [
      { path: 'color.bg.white', name: 'white', category: 'color', type: 'color', value: '#FFFFFF', cssVar: '--color-bg-white' },
      { path: 'color.btn.primary-bg', name: 'primary-bg', category: 'color', type: 'color', value: '#657E79', cssVar: '--color-btn-primary-bg' },
    ],
    components: [
      { name: 'Button', slug: 'button', status: 'published' },
      { name: 'Card', slug: 'card', status: 'published' },
      { name: 'Modal', slug: 'modal', status: 'approved' },
    ],
    themes: ['health-sem', 'home-sem'],
    metadata: {
      packageName: '@acme/design-tokens',
      version: '2.1.0',
      exportedAt: '2025-01-02T00:00:00.000Z',
    },
  };

  it('includes package name and version', () => {
    const readme = generateReadme(mockBundle);

    expect(readme).toContain('@acme/design-tokens');
    expect(readme).toContain('v2.1.0');
  });

  it('includes platform file table', () => {
    const readme = generateReadme(mockBundle);

    expect(readme).toContain('| File | Platform |');
    expect(readme).toContain('.cursor/rules/*.mdc | Cursor');
    expect(readme).toContain('CLAUDE.md | Claude Code');
    expect(readme).toContain('project-knowledge.txt | Bolt, Lovable');
    expect(readme).toContain('design-system.json | MCP Server');
  });

  it('counts tokens correctly', () => {
    const readme = generateReadme(mockBundle);

    expect(readme).toContain('Tokens: 2');
  });

  it('counts only published components', () => {
    const readme = generateReadme(mockBundle);

    // Only 2 published components (Button and Card), not Modal (approved)
    expect(readme).toContain('Components: 2');
  });

  it('handles empty tokens', () => {
    const emptyBundle: AIExportBundle = {
      ...mockBundle,
      tokens: [],
    };

    const readme = generateReadme(emptyBundle);

    expect(readme).toContain('Tokens: 0');
  });

  it('handles no published components', () => {
    const noPublishedBundle: AIExportBundle = {
      ...mockBundle,
      components: [
        { name: 'Button', slug: 'button', status: 'approved' },
        { name: 'Card', slug: 'card', status: 'pending_code' },
      ],
    };

    const readme = generateReadme(noPublishedBundle);

    expect(readme).toContain('Components: 0');
  });
});

