import { Sparkles, RefreshCw } from 'lucide-react'
import { isAIConfigured } from '../../lib/generateCode'

export default function GenerateButton({ onClick, loading = false, hasExistingCode = false }) {
  const configured = isAIConfigured()
  
  const Icon = hasExistingCode ? RefreshCw : Sparkles
  const label = hasExistingCode ? 'Regenerate with AI' : 'Generate with AI'

  return (
    <button
      onClick={onClick}
      disabled={loading || !configured}
      data-testid="generate-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: configured 
          ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' 
          : '#9CA3AF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: loading || !configured ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        opacity: loading ? 0.8 : 1,
        transition: 'all 0.2s ease',
        boxShadow: configured ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none',
      }}
      title={!configured ? 'Add VITE_ANTHROPIC_API_KEY to .env.local' : ''}
    >
      <Icon 
        size={16} 
        style={{ 
          animation: loading ? 'spin 1s linear infinite' : 'none' 
        }} 
      />
      {loading ? 'Generating...' : label}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}



