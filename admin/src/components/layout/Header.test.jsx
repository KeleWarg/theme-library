import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  beforeEach(() => {
    // Reset document class and localStorage before each test
    localStorage.clear()
    document.documentElement.className = 'theme-health---sem'
  })

  it('renders the page title', () => {
    render(<Header pageTitle="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders theme dropdown with all themes', () => {
    render(<Header pageTitle="Test" />)
    const dropdown = screen.getByRole('combobox')
    expect(dropdown).toBeInTheDocument()
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
    expect(screen.getByText('Home SEM')).toBeInTheDocument()
    expect(screen.getByText('LLM')).toBeInTheDocument()
    expect(screen.getByText('ForbesMedia SEO')).toBeInTheDocument()
    expect(screen.getByText('Compare Coverage')).toBeInTheDocument()
  })

  it('renders export button', () => {
    render(<Header pageTitle="Test" />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('changes theme when dropdown changes', () => {
    render(<Header pageTitle="Test" />)
    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: 'theme-llm' } })
    expect(document.documentElement.className).toBe('theme-llm')
  })

  it('syncs with useTheme hook - reads from localStorage', () => {
    localStorage.setItem('design-system-theme', 'theme-llm')
    render(<Header pageTitle="Test" />)
    const dropdown = screen.getByRole('combobox')
    expect(dropdown.value).toBe('theme-llm')
  })

  it('persists theme changes to localStorage', () => {
    render(<Header pageTitle="Test" />)
    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: 'theme-home---sem' } })
    expect(localStorage.getItem('design-system-theme')).toBe('theme-home---sem')
  })
})

