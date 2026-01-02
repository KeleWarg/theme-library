import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'

export default function FeedbackModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [feedback, setFeedback] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(feedback)
    setFeedback('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit()
    }
  }

  return (
    <div 
      data-testid="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '520px',
          margin: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <h3 style={{ margin: 0, color: 'var(--color-fg-heading)', fontSize: '18px' }}>
              Regenerate with Feedback
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--color-bg-neutral-light)', 
              border: 'none', 
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="var(--color-fg-caption)" />
          </button>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--color-fg-body)', marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
          Describe what you'd like to change. Be specific about styling, behavior, or accessibility improvements.
        </p>

        {/* Textarea */}
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Add a focus ring for keyboard navigation, make the hover transition smoother, support an 'outline' variant..."
          autoFocus
          style={{
            width: '100%',
            minHeight: '140px',
            padding: '14px',
            border: '2px solid var(--color-border-default)',
            borderRadius: '10px',
            resize: 'vertical',
            fontSize: '14px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'}
        />

        {/* Hint */}
        <p style={{ fontSize: '12px', color: 'var(--color-fg-caption)', marginTop: '8px', marginBottom: '20px' }}>
          Tip: Press ⌘+Enter to submit
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !feedback.trim()}
            style={{
              padding: '10px 18px',
              background: loading || !feedback.trim() 
                ? '#9CA3AF' 
                : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !feedback.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}



