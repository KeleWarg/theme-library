import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenerateButton from '../GenerateButton';

// Mock the AI config module
vi.mock('../../../lib/ai/config', () => ({
  isAIConfigured: vi.fn(() => true),
}));

import { isAIConfigured } from '../../../lib/ai/config';

describe('GenerateButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAIConfigured.mockReturnValue(true);
  });

  it('shows "Generate with AI" when no existing code', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={false} />);
    expect(screen.getByText('Generate with AI')).toBeInTheDocument();
  });

  it('shows "Regenerate with AI" when code exists', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={true} />);
    expect(screen.getByText('Regenerate with AI')).toBeInTheDocument();
  });

  it('shows "Generating..." when loading', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<GenerateButton onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('generate-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />);
    expect(screen.getByTestId('generate-button')).toBeDisabled();
  });

  it('is disabled when API not configured', () => {
    isAIConfigured.mockReturnValue(false);
    render(<GenerateButton onClick={() => {}} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'API key not configured');
  });

  it('is disabled when disabled prop is true', () => {
    render(<GenerateButton onClick={() => {}} disabled={true} />);
    expect(screen.getByTestId('generate-button')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<GenerateButton onClick={handleClick} disabled={true} />);
    fireEvent.click(screen.getByTestId('generate-button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with gradient background when configured', () => {
    render(<GenerateButton onClick={() => {}} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toHaveStyle({
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    });
  });

  it('renders with neutral background when not configured', () => {
    isAIConfigured.mockReturnValue(false);
    render(<GenerateButton onClick={() => {}} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toHaveStyle({
      background: 'var(--color-bg-neutral-medium)',
    });
  });
});

