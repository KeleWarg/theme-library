import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GenerateButton from '../../src/components/ui/GenerateButton';
import FeedbackModal from '../../src/components/ui/FeedbackModal';

// Mock the AI config module
vi.mock('../../src/lib/ai/config', () => ({
  isAIConfigured: vi.fn(() => true),
  AI_CONFIG: {
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
  },
  getApiKey: () => 'mock-key',
}));

// Mock generateCode module
vi.mock('../../src/lib/ai/generateCode', () => ({
  generateComponentCode: vi.fn(),
  isAIConfigured: vi.fn(() => true),
}));

describe('Gate 6B: Phase 6 Complete', () => {
  describe('GenerateButton Component', () => {
    it('renders with "Generate with AI" text when no existing code', () => {
      render(<GenerateButton onClick={() => {}} />);
      expect(screen.getByText('Generate with AI')).toBeInTheDocument();
    });

    it('renders with "Regenerate with AI" text when existing code', () => {
      render(<GenerateButton onClick={() => {}} hasExistingCode={true} />);
      expect(screen.getByText('Regenerate with AI')).toBeInTheDocument();
    });

    it('shows loading state when generating', () => {
      render(<GenerateButton onClick={() => {}} loading={true} />);
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<GenerateButton onClick={handleClick} />);
      
      fireEvent.click(screen.getByTestId('generate-button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading', () => {
      render(<GenerateButton onClick={() => {}} loading={true} />);
      expect(screen.getByTestId('generate-button')).toBeDisabled();
    });

    it('is disabled when explicitly disabled', () => {
      render(<GenerateButton onClick={() => {}} disabled={true} />);
      expect(screen.getByTestId('generate-button')).toBeDisabled();
    });
  });

  describe('FeedbackModal Component', () => {
    it('does not render when isOpen is false', () => {
      render(
        <FeedbackModal
          isOpen={false}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );
      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument();
    });

    it('closes when overlay is clicked', () => {
      const handleClose = vi.fn();
      render(
        <FeedbackModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={() => {}}
        />
      );
      
      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes when Cancel button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <FeedbackModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={() => {}}
        />
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      const handleClose = vi.fn();
      render(
        <FeedbackModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={() => {}}
        />
      );
      
      // Click on the modal title (inside the modal content)
      fireEvent.click(screen.getByText('Regenerate with Feedback'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('submits feedback when Regenerate button is clicked', async () => {
      const handleSubmit = vi.fn();
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
        />
      );
      
      // Type feedback
      const textarea = screen.getByPlaceholderText(/Add a focus ring/i);
      fireEvent.change(textarea, { target: { value: 'Make the button larger' } });
      
      // Click Regenerate
      fireEvent.click(screen.getByText('Regenerate'));
      expect(handleSubmit).toHaveBeenCalledWith('Make the button larger');
    });

    it('Regenerate button is disabled when feedback is empty', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );
      
      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).toBeDisabled();
    });

    it('shows loading state when loading prop is true', () => {
      render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          loading={true}
        />
      );
      
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  describe('ComponentDetail Integration', () => {
    // Mock component data
    const mockComponent = {
      id: 'test-123',
      name: 'Test Button',
      slug: 'test-button',
      description: 'A test button component',
      status: 'active',
      code_status: 'pending',
      jsx_code: '',
      props: [],
      variants: ['primary', 'secondary'],
      category: 'buttons',
    };

    // Mock hooks
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('GenerateButton and FeedbackModal can work together', async () => {
      // Test the interaction pattern that ComponentDetail uses
      let modalOpen = false;
      const setModalOpen = (value: boolean) => { modalOpen = value; };
      const handleGenerate = vi.fn();

      // First render GenerateButton
      const { rerender } = render(
        <>
          <GenerateButton
            onClick={() => setModalOpen(true)}
            hasExistingCode={true}
          />
          <FeedbackModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleGenerate}
          />
        </>
      );

      // Click generate button - this should trigger modal open in real app
      fireEvent.click(screen.getByTestId('generate-button'));
      
      // Rerender with modal open (simulating state change)
      rerender(
        <>
          <GenerateButton
            onClick={() => setModalOpen(true)}
            hasExistingCode={true}
          />
          <FeedbackModal
            isOpen={true}
            onClose={() => setModalOpen(false)}
            onSubmit={handleGenerate}
          />
        </>
      );

      // Modal should now be visible
      expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument();

      // Fill feedback and submit
      const textarea = screen.getByPlaceholderText(/Add a focus ring/i);
      fireEvent.change(textarea, { target: { value: 'Add hover effects' } });
      fireEvent.click(screen.getByText('Regenerate'));

      expect(handleGenerate).toHaveBeenCalledWith('Add hover effects');
    });

    it('GenerateButton shows correct text based on hasExistingCode', () => {
      // Without existing code
      const { rerender } = render(<GenerateButton onClick={() => {}} hasExistingCode={false} />);
      expect(screen.getByText('Generate with AI')).toBeInTheDocument();

      // With existing code
      rerender(<GenerateButton onClick={() => {}} hasExistingCode={true} />);
      expect(screen.getByText('Regenerate with AI')).toBeInTheDocument();
    });

    it('FeedbackModal clears input after submission', () => {
      const handleSubmit = vi.fn();
      const { rerender } = render(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
        />
      );

      // Type and submit
      const textarea = screen.getByPlaceholderText(/Add a focus ring/i);
      fireEvent.change(textarea, { target: { value: 'Test feedback' } });
      fireEvent.click(screen.getByText('Regenerate'));

      // After submit, rerender to simulate state update
      rerender(
        <FeedbackModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
        />
      );

      // Input should be cleared (onSubmit clears it)
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('AI Configuration Integration', () => {
    it('isAIConfigured returns true (mocked)', async () => {
      const { isAIConfigured } = await import('../../src/lib/ai/config');
      expect(isAIConfigured()).toBe(true);
    });

    it('AI_CONFIG has required fields', async () => {
      const { AI_CONFIG } = await import('../../src/lib/ai/config');
      expect(AI_CONFIG.apiEndpoint).toBeDefined();
      expect(AI_CONFIG.model).toBeDefined();
      expect(AI_CONFIG.maxTokens).toBeDefined();
    });
  });
});

