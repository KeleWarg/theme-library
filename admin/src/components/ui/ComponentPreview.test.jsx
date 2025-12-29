import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComponentPreview from './ComponentPreview'

describe('ComponentPreview', () => {
  it('renders iframe', () => {
    render(<ComponentPreview code="" componentProps={{}} />)
    expect(screen.getByTitle('Component Preview')).toBeInTheDocument()
  })

  it('shows no code message when code is empty', () => {
    render(<ComponentPreview code="" componentProps={{}} />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('srcdoc', expect.stringContaining('No code to preview'))
  })

  it('includes theme class in html', () => {
    render(<ComponentPreview code="function Button() { return <button>Test</button> }" componentProps={{}} theme="theme-llm" />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('srcdoc', expect.stringContaining('theme-llm'))
  })

  it('includes component code in srcdoc', () => {
    const code = "function Button() { return <button>Click me</button> }"
    render(<ComponentPreview code={code} componentProps={{}} />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('srcdoc', expect.stringContaining('function Button'))
  })

  it('has sandbox attribute for security', () => {
    render(<ComponentPreview code="" componentProps={{}} />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts')
  })
})

