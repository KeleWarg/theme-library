import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GenerateButton from './GenerateButton'

vi.mock('../../lib/generateCode', () => ({
  isAIConfigured: () => true
}))

describe('GenerateButton', () => {
  it('shows Generate text when no existing code', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={false} />)
    expect(screen.getByText('Generate with AI')).toBeInTheDocument()
  })

  it('shows Regenerate text when code exists', () => {
    render(<GenerateButton onClick={() => {}} hasExistingCode={true} />)
    expect(screen.getByText('Regenerate with AI')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />)
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<GenerateButton onClick={onClick} />)
    fireEvent.click(screen.getByTestId('generate-button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when loading', () => {
    render(<GenerateButton onClick={() => {}} loading={true} />)
    expect(screen.getByTestId('generate-button')).toBeDisabled()
  })

  it('is not disabled when configured', () => {
    render(<GenerateButton onClick={() => {}} />)
    const button = screen.getByTestId('generate-button')
    expect(button).not.toBeDisabled()
  })
})

