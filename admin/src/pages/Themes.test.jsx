import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Themes from './Themes'

describe('Themes', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = 'theme-health---sem'
  })

  it('renders page title', () => {
    render(<Themes />)
    expect(screen.getByText('Themes')).toBeInTheDocument()
  })

  it('renders all theme cards', () => {
    render(<Themes />)
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
    expect(screen.getByText('Home SEM')).toBeInTheDocument()
    expect(screen.getByText('LLM')).toBeInTheDocument()
    expect(screen.getByText('ForbesMedia SEO')).toBeInTheDocument()
    expect(screen.getByText('Compare Coverage')).toBeInTheDocument()
  })

  it('shows active badge on current theme', () => {
    render(<Themes />)
    // Health SEM should be active by default
    expect(screen.getByText('Active')).toBeInTheDocument()
    const healthCard = screen.getByText('Health SEM').closest('[data-testid="theme-card"]')
    expect(healthCard).toContainElement(screen.getByText('Active'))
  })

  it('opens preview modal when Preview clicked', () => {
    render(<Themes />)
    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[0])
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
  })

  it('closes preview modal when overlay clicked', () => {
    render(<Themes />)
    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[0])
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
    
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument()
  })

  it('changes active theme when Apply clicked', () => {
    render(<Themes />)
    // Find LLM card's Apply button
    const llmCard = screen.getByText('LLM').closest('[data-testid="theme-card"]')
    const applyButton = llmCard.querySelector('button:last-child')
    fireEvent.click(applyButton)
    
    expect(document.documentElement.className).toBe('theme-llm')
  })

  it('persists theme to localStorage', () => {
    render(<Themes />)
    const llmCard = screen.getByText('LLM').closest('[data-testid="theme-card"]')
    const applyButton = llmCard.querySelector('button:last-child')
    fireEvent.click(applyButton)
    
    expect(localStorage.getItem('design-system-theme')).toBe('theme-llm')
  })

  it('renders 5 theme cards', () => {
    render(<Themes />)
    const themeCards = screen.getAllByTestId('theme-card')
    expect(themeCards).toHaveLength(5)
  })
})
