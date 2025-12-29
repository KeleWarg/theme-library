import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Foundations from './Foundations'

describe('Foundations', () => {
  beforeEach(() => {
    // Mock clipboard API for ColorSwatch components
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
    // Set default theme class
    document.documentElement.className = 'theme-health---sem'
  })

  it('renders the page heading', () => {
    render(<Foundations />)
    expect(screen.getByRole('heading', { name: 'Foundations' })).toBeInTheDocument()
  })

  it('renders tabs', () => {
    render(<Foundations />)
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Spacing')).toBeInTheDocument()
  })

  it('shows colors tab by default', () => {
    render(<Foundations />)
    expect(screen.getByText('Backgrounds')).toBeInTheDocument()
  })

  it('renders background color swatches', () => {
    render(<Foundations />)
    expect(screen.getByText('bg-white')).toBeInTheDocument()
  })

  it('renders text color section', () => {
    render(<Foundations />)
    expect(screen.getByText('Text Colors')).toBeInTheDocument()
    expect(screen.getByText('fg-heading')).toBeInTheDocument()
  })

  it('renders button color sections', () => {
    render(<Foundations />)
    expect(screen.getByText('Button Colors')).toBeInTheDocument()
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })

  it('renders feedback section', () => {
    render(<Foundations />)
    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })

  it('switches to typography tab when clicked', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
    expect(screen.getByText('Font Sizes')).toBeInTheDocument()
  })

  it('switches to spacing tab when clicked', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
    expect(screen.getByText('Breakpoints')).toBeInTheDocument()
  })

  it('hides colors content when switching tabs', () => {
    render(<Foundations />)
    // Colors tab content visible by default
    expect(screen.getByText('Backgrounds')).toBeInTheDocument()
    
    // Switch to Typography tab
    fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
    
    // Colors tab content should be hidden
    expect(screen.queryByText('Backgrounds')).not.toBeInTheDocument()
  })

  it('renders primary button color tokens', () => {
    render(<Foundations />)
    expect(screen.getByText('btn-primary-bg')).toBeInTheDocument()
    expect(screen.getByText('btn-primary-text')).toBeInTheDocument()
  })

  it('renders secondary button color tokens', () => {
    render(<Foundations />)
    expect(screen.getByText('btn-secondary-bg')).toBeInTheDocument()
  })

  it('renders ghost button color tokens', () => {
    render(<Foundations />)
    expect(screen.getByText('btn-ghost-bg')).toBeInTheDocument()
  })

  // Typography Tab Tests
  describe('Typography tab', () => {
    it('shows typography content when tab clicked', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Font Sizes')).toBeInTheDocument()
    })

    it('renders font size samples', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('display')).toBeInTheDocument()
      expect(screen.getByText('heading-lg')).toBeInTheDocument()
    })

    it('renders font weight section', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Font Weights')).toBeInTheDocument()
    })

    it('renders font weight samples', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('bold')).toBeInTheDocument()
      expect(screen.getByText('regular')).toBeInTheDocument()
    })

    it('renders line heights section', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Line Heights')).toBeInTheDocument()
    })

    it('renders letter spacing section', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Letter Spacing')).toBeInTheDocument()
    })

    it('renders font families section', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Font Families')).toBeInTheDocument()
    })

    it('shows current theme indicator', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText('Current Theme:')).toBeInTheDocument()
      expect(screen.getByText('Health SEM')).toBeInTheDocument()
    })

    it('renders SEM font families for Health theme', () => {
      document.documentElement.className = 'theme-health---sem'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      // Georgia appears multiple times (display + body)
      expect(screen.getAllByText('Georgia').length).toBeGreaterThanOrEqual(1)
      // Euclid Circular B appears multiple times (heading + sans-serif)
      expect(screen.getAllByText('Euclid Circular B').length).toBeGreaterThanOrEqual(1)
    })

    it('renders ForbesMedia font families for Forbes theme', () => {
      document.documentElement.className = 'theme-forbesmedia---seo'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      // Work Sans appears multiple times (body, sans-serif), so use getAllByText
      expect(screen.getAllByText('Work Sans').length).toBeGreaterThan(0)
      // Schnyder S appears multiple times (heading name + value badge)
      expect(screen.getAllByText('Schnyder S').length).toBeGreaterThan(0)
      // Graphik appears multiple times (breadcrumbs name + value badge)
      expect(screen.getAllByText('Graphik').length).toBeGreaterThan(0)
    })

    it('shows theme-specific description for SEM', () => {
      document.documentElement.className = 'theme-health---sem'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText(/SEM themes use Georgia for serif/)).toBeInTheDocument()
    })

    it('shows theme-specific description for ForbesMedia', () => {
      document.documentElement.className = 'theme-forbesmedia---seo'
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Typography' }))
      expect(screen.getByText(/This theme uses the ForbesMedia typography system with Work Sans, Schnyder S, and Graphik/)).toBeInTheDocument()
    })
  })

  // Spacing Tab Tests
  describe('Spacing tab', () => {
    it('shows spacing content when tab clicked', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      expect(screen.getByText('Breakpoints')).toBeInTheDocument()
    })

    it('renders breakpoint cards', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      expect(screen.getByText('Mobile')).toBeInTheDocument()
      expect(screen.getByText('Tablet')).toBeInTheDocument()
      expect(screen.getByText('Desktop')).toBeInTheDocument()
    })

    it('shows grid visualization', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      expect(screen.getByText('Grid Visualization')).toBeInTheDocument()
    })

    it('renders spacing scale section', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      expect(screen.getByText('Spacing Scale')).toBeInTheDocument()
    })

    it('renders spacing tokens', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      expect(screen.getByText('spacing-xs')).toBeInTheDocument()
      expect(screen.getByText('spacing-md')).toBeInTheDocument()
      expect(screen.getByText('spacing-xl')).toBeInTheDocument()
    })

    it('shows breakpoint details', () => {
      render(<Foundations />)
      fireEvent.click(screen.getByRole('button', { name: 'Spacing' }))
      // Check for column labels
      expect(screen.getAllByText('Columns').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Margin').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Gutter').length).toBeGreaterThan(0)
    })
  })
})
