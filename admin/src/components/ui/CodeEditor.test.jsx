import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeEditor from './CodeEditor'

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, options }) => (
    <textarea 
      data-testid="code-editor"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={options?.readOnly}
    />
  )
}))

describe('CodeEditor', () => {
  it('renders with value', () => {
    render(<CodeEditor value="const x = 1" onChange={() => {}} />)
    expect(screen.getByTestId('code-editor')).toHaveValue('const x = 1')
  })

  it('respects readOnly prop', () => {
    render(<CodeEditor value="code" onChange={() => {}} readOnly={true} />)
    expect(screen.getByTestId('code-editor')).toHaveAttribute('readonly')
  })

  it('renders empty when no value', () => {
    render(<CodeEditor value="" onChange={() => {}} />)
    expect(screen.getByTestId('code-editor')).toHaveValue('')
  })
})

