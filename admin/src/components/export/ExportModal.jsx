/**
 * ExportModal Component
 * Modal UI for configuring and triggering package export
 * Chunk 7.05 - Export Modal Component
 */

import { useState } from 'react';
import { X, Download, FileText, Package } from 'lucide-react';
import { downloadPackage } from '../../lib/export/packageGenerator';
import { downloadLLMSTxt } from '../../lib/export/llmsGenerator';
import { DEFAULT_PACKAGE_CONFIG } from '../../lib/export/types';

export default function ExportModal({ isOpen, onClose, components }) {
  const [packageName, setPackageName] = useState(DEFAULT_PACKAGE_CONFIG.packageName);
  const [version, setVersion] = useState(DEFAULT_PACKAGE_CONFIG.version);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const publishedCount = (components || []).filter(c => c.status === 'published' && c.jsx_code).length;

  const handleExport = async () => {
    setExporting(true);
    setResult(null);
    try {
      const res = await downloadPackage(components, { packageName, version });
      setResult({ success: true, message: `Exported ${res.componentCount} components` });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadLLMS = () => {
    downloadLLMSTxt(components, { packageName, version });
  };

  return (
    <div
      data-testid="package-export-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-export-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        data-testid="package-export-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            id="package-export-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-title-lg, 20px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}
          >
            Export Package
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-testid="close-button"
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-fg-caption, #616A76)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Package Name Input */}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="package-name"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-label-md, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-body, #383C43)',
              marginBottom: '6px',
            }}
          >
            Package Name
          </label>
          <input
            id="package-name"
            data-testid="package-name-input"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="@yourorg/design-system"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-body-md, 16px)',
              color: 'var(--color-fg-body, #383C43)',
              background: 'var(--color-bg-white, #FFFFFF)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Version Input */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="package-version"
            style={{
              display: 'block',
              fontSize: 'var(--font-size-label-md, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-body, #383C43)',
              marginBottom: '6px',
            }}
          >
            Version
          </label>
          <input
            id="package-version"
            data-testid="version-input"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-body-md, 16px)',
              color: 'var(--color-fg-body, #383C43)',
              background: 'var(--color-bg-white, #FFFFFF)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Published Count */}
        <p
          data-testid="published-count"
          style={{
            color: 'var(--color-fg-caption, #616A76)',
            fontSize: 'var(--font-size-body-sm, 14px)',
            marginBottom: '16px',
          }}
        >
          {publishedCount} component{publishedCount !== 1 ? 's' : ''} ready for export
        </p>

        {/* Result Message */}
        {result && (
          <div
            data-testid="export-result"
            style={{
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              background: result.success
                ? 'var(--color-bg-feedback-success, #e6f4ea)'
                : 'var(--color-bg-feedback-error, #fce8e6)',
              color: result.success
                ? 'var(--color-fg-feedback-success, #0C7663)'
                : 'var(--color-fg-feedback-error, #C02D2D)',
              fontSize: 'var(--font-size-body-sm, 14px)',
            }}
          >
            {result.message}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExport}
            disabled={exporting || !publishedCount}
            data-testid="export-package-button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: exporting || !publishedCount
                ? 'var(--color-btn-disabled-bg, #ECEFF3)'
                : 'var(--color-btn-primary-bg, #657E79)',
              color: exporting || !publishedCount
                ? 'var(--color-btn-disabled-text, #9AA0AB)'
                : 'var(--color-btn-primary-text, #FFFFFF)',
              border: 'none',
              borderRadius: '6px',
              cursor: exporting || !publishedCount ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              transition: 'all 0.2s ease',
            }}
          >
            <Package size={16} />
            {exporting ? 'Exporting...' : 'Export Package'}
          </button>

          <button
            onClick={handleDownloadLLMS}
            data-testid="download-llms-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '6px',
              background: 'var(--color-bg-white, #FFFFFF)',
              color: 'var(--color-fg-body, #383C43)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={16} />
            LLMS.txt
          </button>
        </div>
      </div>
    </div>
  );
}

