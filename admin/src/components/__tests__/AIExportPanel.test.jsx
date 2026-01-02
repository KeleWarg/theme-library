import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AIExportPanel from '../AIExportPanel';

// Mock the AI export generators
vi.mock('../../lib/aiExport/cursorRules', () => ({
  generateCursorRules: vi.fn(() => 'mock cursor rules content'),
}));

vi.mock('../../lib/aiExport/claudeCode', () => ({
  generateClaudeMd: vi.fn(() => 'mock claude md'),
  generateClaudeTokensRule: vi.fn(() => 'mock tokens rule'),
}));

vi.mock('../../lib/aiExport/projectKnowledge', () => ({
  generateProjectKnowledge: vi.fn(() => 'mock project knowledge'),
}));

import { generateCursorRules } from '../../lib/aiExport/cursorRules';
import { generateClaudeMd, generateClaudeTokensRule } from '../../lib/aiExport/claudeCode';
import { generateProjectKnowledge } from '../../lib/aiExport/projectKnowledge';

const mockBundle = {
  tokens: [
    { path: 'color.btn.primary-bg', name: 'primary-bg', category: 'color', type: 'color', value: '#667eea', cssVar: '--color-btn-primary-bg' },
    { path: 'color.bg.white', name: 'white', category: 'color', type: 'color', value: '#ffffff', cssVar: '--color-bg-white' },
    { path: 'typography.body-md', name: 'body-md', category: 'typography', type: 'string', value: '16px', cssVar: '--font-size-body-md' },
  ],
  components: [
    { name: 'Button', slug: 'button', status: 'published' },
    { name: 'Card', slug: 'card', status: 'published' },
    { name: 'Modal', slug: 'modal', status: 'pending' },
  ],
  themes: ['health-sem', 'home-sem'],
  metadata: {
    packageName: '@company/design-system',
    version: '1.0.0',
    exportedAt: '2024-01-01T00:00:00.000Z',
  },
};

describe('AIExportPanel', () => {
  let clipboardWriteText;
  let createObjectURL;
  let revokeObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock clipboard
    clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteText,
      },
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    createObjectURL = vi.fn(() => 'blob:mock-url');
    revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
  });

  describe('Rendering', () => {
    it('renders all format options', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByTestId('format-cursor')).toBeInTheDocument();
      expect(screen.getByTestId('format-claude')).toBeInTheDocument();
      expect(screen.getByTestId('format-bolt')).toBeInTheDocument();
    });

    it('renders format names correctly', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByText('Cursor Rules')).toBeInTheDocument();
      expect(screen.getByText('Claude Code')).toBeInTheDocument();
      expect(screen.getByText('Bolt/Lovable')).toBeInTheDocument();
    });

    it('renders format descriptions', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByText('.cursor/rules/*.mdc')).toBeInTheDocument();
      expect(screen.getByText('CLAUDE.md + rules')).toBeInTheDocument();
      expect(screen.getByText('Project Knowledge')).toBeInTheDocument();
    });

    it('renders bundle stats showing tokens and published components', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      const stats = screen.getByTestId('bundle-stats');
      expect(stats).toHaveTextContent('3 tokens');
      expect(stats).toHaveTextContent('2 components'); // Only published components
    });

    it('renders header with sparkles icon', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByText('Export for AI Platforms')).toBeInTheDocument();
    });

    it('renders copy buttons for all formats', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByTestId('copy-cursor')).toBeInTheDocument();
      expect(screen.getByTestId('copy-claude')).toBeInTheDocument();
      expect(screen.getByTestId('copy-bolt')).toBeInTheDocument();
    });

    it('renders download buttons only for cursor and claude', () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      expect(screen.getByTestId('download-cursor')).toBeInTheDocument();
      expect(screen.getByTestId('download-claude')).toBeInTheDocument();
      expect(screen.queryByTestId('download-bolt')).not.toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('copies cursor rules content when copy button clicked', async () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      const copyButton = screen.getByTestId('copy-cursor');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(clipboardWriteText).toHaveBeenCalledWith('mock cursor rules content');
      });
      expect(generateCursorRules).toHaveBeenCalledWith(mockBundle);
    });

    it('copies claude content (md + tokens rule) when copy button clicked', async () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      const copyButton = screen.getByTestId('copy-claude');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(clipboardWriteText).toHaveBeenCalledWith('mock claude md\n---\nmock tokens rule');
      });
      expect(generateClaudeMd).toHaveBeenCalledWith(mockBundle);
      expect(generateClaudeTokensRule).toHaveBeenCalledWith(mockBundle);
    });

    it('copies project knowledge content when copy button clicked', async () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      const copyButton = screen.getByTestId('copy-bolt');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(clipboardWriteText).toHaveBeenCalledWith('mock project knowledge');
      });
      expect(generateProjectKnowledge).toHaveBeenCalledWith(mockBundle);
    });

    it('shows "Copied!" text after copying', async () => {
      render(<AIExportPanel bundle={mockBundle} />);
      
      const copyButton = screen.getByTestId('copy-cursor');
      expect(copyButton).toHaveTextContent('Copy');
      
      await act(async () => {
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copied!');
      });
    });

    it('resets copied state after 2 seconds', async () => {
      vi.useFakeTimers();
      render(<AIExportPanel bundle={mockBundle} />);
      
      const copyButton = screen.getByTestId('copy-cursor');
      
      await act(async () => {
        fireEvent.click(copyButton);
        // Flush the promise from clipboard.writeText
        await Promise.resolve();
      });

      expect(copyButton).toHaveTextContent('Copied!');

      // Fast-forward 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(copyButton).toHaveTextContent('Copy');
      
      vi.useRealTimers();
    });
  });

  describe('Download functionality', () => {
    it('downloads cursor rules with correct filename', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });

      render(<AIExportPanel bundle={mockBundle} />);
      
      const downloadButton = screen.getByTestId('download-cursor');
      fireEvent.click(downloadButton);

      expect(mockAnchor.download).toBe('design-system.mdc');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(createObjectURL).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('downloads claude content with correct filename', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });

      render(<AIExportPanel bundle={mockBundle} />);
      
      const downloadButton = screen.getByTestId('download-claude');
      fireEvent.click(downloadButton);

      expect(mockAnchor.download).toBe('CLAUDE.md');
      expect(mockAnchor.click).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('creates blob with correct content and sets href on anchor', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });

      render(<AIExportPanel bundle={mockBundle} />);
      
      const downloadButton = screen.getByTestId('download-cursor');
      fireEvent.click(downloadButton);

      // Verify createObjectURL was called (with a Blob)
      expect(createObjectURL).toHaveBeenCalled();
      // Verify the anchor href was set
      expect(mockAnchor.href).toBe('blob:mock-url');

      vi.restoreAllMocks();
    });
  });

  describe('Edge cases', () => {
    it('handles empty tokens array', () => {
      const emptyBundle = { ...mockBundle, tokens: [] };
      render(<AIExportPanel bundle={emptyBundle} />);
      
      expect(screen.getByTestId('bundle-stats')).toHaveTextContent('0 tokens');
    });

    it('handles no published components', () => {
      const noPubBundle = {
        ...mockBundle,
        components: [{ name: 'Modal', slug: 'modal', status: 'pending' }],
      };
      render(<AIExportPanel bundle={noPubBundle} />);
      
      expect(screen.getByTestId('bundle-stats')).toHaveTextContent('0 components');
    });

    it('handles empty components array', () => {
      const emptyCompBundle = { ...mockBundle, components: [] };
      render(<AIExportPanel bundle={emptyCompBundle} />);
      
      expect(screen.getByTestId('bundle-stats')).toHaveTextContent('0 components');
    });
  });
});
