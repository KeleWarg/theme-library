import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIExportPanel from '../../src/components/AIExportPanel';

const bundle = {
  tokens: [],
  components: [],
  themes: [],
  metadata: { packageName: '@test/ds', version: '1.0.0', exportedAt: '' }
};

describe('Gate 8B - Phase 8 Complete', () => {
  it('AIExportPanel renders all formats', () => {
    render(<AIExportPanel bundle={bundle as any} />);
    expect(screen.getByText('Cursor Rules')).toBeInTheDocument();
    expect(screen.getByText('Claude Code')).toBeInTheDocument();
    expect(screen.getByText('Bolt/Lovable')).toBeInTheDocument();
  });
});

