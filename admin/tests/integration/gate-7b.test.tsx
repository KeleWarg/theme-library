import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../src/pages/Settings';
import Dashboard from '../../src/pages/Dashboard';

vi.mock('../../src/hooks/useComponents', () => ({ 
  useComponents: () => ({ components: [], loading: false }) 
}));
vi.mock('../../src/lib/ai/generateCode', () => ({ 
  isAIConfigured: () => true 
}));

describe('Gate 7B - Phase 7 Complete', () => {
  it('Settings page renders', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('Dashboard page renders', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});

