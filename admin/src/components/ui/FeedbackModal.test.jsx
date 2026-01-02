import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FeedbackModal from './FeedbackModal'

describe('FeedbackModal', () => {
  it('renders nothing when closed', () => {
    render(<FeedbackModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />)
    expect(screen.queryByText('Regenerate with Feedback')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('Regenerate with Feedback')).toBeInTheDocument()
  })

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={() => {}} />)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with feedback', () => {
    const onSubmit = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />)
    
    const textarea = screen.getByPlaceholderText(/Add a focus ring/i)
    fireEvent.change(textarea, { target: { value: 'My feedback' } })
    fireEvent.click(screen.getByText('Regenerate'))
    
    expect(onSubmit).toHaveBeenCalledWith('My feedback')
  })

  it('clears feedback after submit', () => {
    const onSubmit = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />)
    
    const textarea = screen.getByPlaceholderText(/Add a focus ring/i)
    fireEvent.change(textarea, { target: { value: 'My feedback' } })
    fireEvent.click(screen.getByText('Regenerate'))
    
    expect(textarea.value).toBe('')
  })

  it('shows loading state', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={() => {}} loading={true} />)
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('disables submit button when empty', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
    const submitButton = screen.getByText('Regenerate').closest('button')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when feedback entered', () => {
    render(<FeedbackModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
    
    const textarea = screen.getByPlaceholderText(/Add a focus ring/i)
    fireEvent.change(textarea, { target: { value: 'Some feedback' } })
    
    const submitButton = screen.getByText('Regenerate').closest('button')
    expect(submitButton).not.toBeDisabled()
  })
})



