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
          background: 'var(--color-bg-white)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-3xl)',
          width: '100%',
          maxWidth: '520px',
          margin: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
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
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="var(--color-fg-caption)" />
          </button>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--color-fg-body)', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-body-sm)', lineHeight: 1.6 }}>
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
            padding: 'var(--spacing-md)',
            border: '2px solid var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            resize: 'vertical',
            fontSize: 'var(--font-size-body-sm)',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'}
        />

        {/* Hint */}
        <p style={{ fontSize: 'var(--font-size-label-sm)', color: 'var(--color-fg-caption)', marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
          Tip: Press ⌘+Enter to submit
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !feedback.trim()}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: loading || !feedback.trim() 
                ? '#9CA3AF' 
                : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: loading || !feedback.trim() ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
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



