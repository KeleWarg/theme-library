import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { isAIConfigured } from '../../lib/ai/config';

export default function GenerateButton({
  onClick,
  loading = false,
  hasExistingCode = false,
  disabled = false,
}) {
  const configured = isAIConfigured();
  const isDisabled = loading || !configured || disabled;

  const Icon = loading ? Loader2 : hasExistingCode ? RefreshCw : Sparkles;
  const label = loading
    ? 'Generating...'
    : hasExistingCode
    ? 'Regenerate with AI'
    : 'Generate with AI';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      data-testid="generate-button"
      title={!configured ? 'API key not configured' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: configured
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'var(--color-bg-neutral-medium)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontSize: 'var(--font-size-body-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Icon
        size={16}
        style={{
          animation: loading ? 'spin 1s linear infinite' : 'none',
        }}
      />
      {label}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
