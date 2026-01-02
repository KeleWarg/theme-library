/**
 * ExportModal Tests
 * Chunk 7.05 - Export Modal Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportModal from '../ExportModal';

// Mock the export modules
vi.mock('../../../lib/export/packageGenerator', () => ({
  downloadPackage: vi.fn(),
}));

vi.mock('../../../lib/export/llmsGenerator', () => ({
  downloadLLMSTxt: vi.fn(),
}));

vi.mock('../../../lib/export/types', () => ({
  DEFAULT_PACKAGE_CONFIG: {
    packageName: '@yourorg/design-system',
    version: '1.0.0',
  },
}));

import { downloadPackage } from '../../../lib/export/packageGenerator';
import { downloadLLMSTxt } from '../../../lib/export/llmsGenerator';

// Sample test data
const mockComponents = [
  {
    id: '1',
    name: 'Button',
    status: 'published',
    jsx_code: 'export const Button = () => <button>Click</button>;',
  },
  {
    id: '2',
    name: 'Card',
    status: 'published',
    jsx_code: 'export const Card = () => <div>Card</div>;',
  },
  {
    id: '3',
    name: 'Modal',
    status: 'approved',
    jsx_code: 'export const Modal = () => <div>Modal</div>;',
  },
  {
    id: '4',
    name: 'Input',
    status: 'pending',
    jsx_code: null,
  },
];

describe('ExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    components: mockComponents,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    downloadPackage.mockResolvedValue({ componentCount: 2, totalSize: 1024 });
  });

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<ExportModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('package-export-modal')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
      render(<ExportModal {...defaultProps} />);
      expect(screen.getByTestId('package-export-modal')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Export Package' })).toBeInTheDocument();
    });

    it('shows published count correctly', () => {
      render(<ExportModal {...defaultProps} />);
      // 2 components have status 'published' and jsx_code
      expect(screen.getByTestId('published-count')).toHaveTextContent('2 components ready for export');
    });

    it('handles singular component count', () => {
      const singleComponent = [
        { id: '1', name: 'Button', status: 'published', jsx_code: 'code' },
      ];
      render(<ExportModal {...defaultProps} components={singleComponent} />);
      expect(screen.getByTestId('published-count')).toHaveTextContent('1 component ready for export');
    });

    it('shows 0 components when none are published', () => {
      const noPublished = [
        { id: '1', name: 'Button', status: 'pending', jsx_code: null },
      ];
      render(<ExportModal {...defaultProps} components={noPublished} />);
      expect(screen.getByTestId('published-count')).toHaveTextContent('0 components ready for export');
    });

    it('handles empty components array', () => {
      render(<ExportModal {...defaultProps} components={[]} />);
      expect(screen.getByTestId('published-count')).toHaveTextContent('0 components ready for export');
    });

    it('handles undefined components', () => {
      render(<ExportModal {...defaultProps} components={undefined} />);
      expect(screen.getByTestId('published-count')).toHaveTextContent('0 components ready for export');
    });
  });

  describe('Form Inputs', () => {
    it('shows default package name', () => {
      render(<ExportModal {...defaultProps} />);
      const input = screen.getByTestId('package-name-input');
      expect(input.value).toBe('@yourorg/design-system');
    });

    it('shows default version', () => {
      render(<ExportModal {...defaultProps} />);
      const input = screen.getByTestId('version-input');
      expect(input.value).toBe('1.0.0');
    });

    it('allows editing package name', () => {
      render(<ExportModal {...defaultProps} />);
      const input = screen.getByTestId('package-name-input');
      fireEvent.change(input, { target: { value: '@acme/components' } });
      expect(input.value).toBe('@acme/components');
    });

    it('allows editing version', () => {
      render(<ExportModal {...defaultProps} />);
      const input = screen.getByTestId('version-input');
      fireEvent.change(input, { target: { value: '2.0.0' } });
      expect(input.value).toBe('2.0.0');
    });
  });

  describe('Export Button', () => {
    it('export button triggers download', async () => {
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('export-package-button'));
      
      await waitFor(() => {
        expect(downloadPackage).toHaveBeenCalledWith(
          mockComponents,
          { packageName: '@yourorg/design-system', version: '1.0.0' }
        );
      });
    });

    it('shows success message after export', async () => {
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('export-package-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('export-result')).toHaveTextContent('Exported 2 components');
      });
    });

    it('shows error message on export failure', async () => {
      downloadPackage.mockRejectedValue(new Error('Export failed'));
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('export-package-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('export-result')).toHaveTextContent('Export failed');
      });
    });

    it('disables button during export', async () => {
      // Make downloadPackage slow
      downloadPackage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<ExportModal {...defaultProps} />);
      
      const button = screen.getByTestId('export-package-button');
      fireEvent.click(button);
      
      expect(button).toHaveTextContent('Exporting...');
      expect(button).toBeDisabled();
    });

    it('disables button when no published components', () => {
      render(<ExportModal {...defaultProps} components={[]} />);
      expect(screen.getByTestId('export-package-button')).toBeDisabled();
    });

    it('uses custom package name and version', async () => {
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('package-name-input'), { target: { value: '@custom/pkg' } });
      fireEvent.change(screen.getByTestId('version-input'), { target: { value: '3.0.0' } });
      fireEvent.click(screen.getByTestId('export-package-button'));
      
      await waitFor(() => {
        expect(downloadPackage).toHaveBeenCalledWith(
          mockComponents,
          { packageName: '@custom/pkg', version: '3.0.0' }
        );
      });
    });
  });

  describe('LLMS.txt Download', () => {
    it('triggers LLMS.txt download', () => {
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('download-llms-button'));
      
      expect(downloadLLMSTxt).toHaveBeenCalledWith(
        mockComponents,
        { packageName: '@yourorg/design-system', version: '1.0.0' }
      );
    });

    it('uses custom package name for LLMS.txt', () => {
      render(<ExportModal {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('package-name-input'), { target: { value: '@test/lib' } });
      fireEvent.click(screen.getByTestId('download-llms-button'));
      
      expect(downloadLLMSTxt).toHaveBeenCalledWith(
        mockComponents,
        { packageName: '@test/lib', version: '1.0.0' }
      );
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when close button is clicked', () => {
      render(<ExportModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('close-button'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      render(<ExportModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('package-export-modal'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      render(<ExportModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('package-export-content'));
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});

