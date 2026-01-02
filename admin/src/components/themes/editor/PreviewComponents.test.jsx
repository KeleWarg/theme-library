import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  PreviewButton,
  PreviewCard,
  PreviewInput,
  PreviewSelect,
  PreviewBadge,
  PreviewAlert,
  TypographyShowcase,
  ComponentShowcase,
} from './PreviewComponents'

describe('PreviewComponents', () => {
  describe('PreviewButton', () => {
    it('renders with primary variant by default', () => {
      render(<PreviewButton>Click me</PreviewButton>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
    })

    it('renders with secondary variant', () => {
      render(<PreviewButton variant="secondary">Secondary</PreviewButton>)
      const button = screen.getByRole('button', { name: 'Secondary' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveStyle({ border: '1px solid var(--color-btn-secondary-border, #657E79)' })
    })

    it('renders with ghost variant', () => {
      render(<PreviewButton variant="ghost">Ghost</PreviewButton>)
      const button = screen.getByRole('button', { name: 'Ghost' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('PreviewCard', () => {
    it('renders card with title', () => {
      render(<PreviewCard title="Test Card">Card content</PreviewCard>)
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders card without title', () => {
      render(<PreviewCard>Just content</PreviewCard>)
      expect(screen.getByText('Just content')).toBeInTheDocument()
    })
  })

  describe('PreviewInput', () => {
    it('renders input with label', () => {
      render(<PreviewInput label="Email" placeholder="Enter email..." />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email...')).toBeInTheDocument()
    })

    it('renders input without label', () => {
      render(<PreviewInput placeholder="No label" />)
      expect(screen.getByPlaceholderText('No label')).toBeInTheDocument()
    })

    it('accepts type prop', () => {
      render(<PreviewInput type="password" placeholder="Password" />)
      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('PreviewSelect', () => {
    it('renders select with label and options', () => {
      render(
        <PreviewSelect
          label="Choose"
          options={['Option A', 'Option B', 'Option C']}
        />
      )
      expect(screen.getByText('Choose')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Option A')).toBeInTheDocument()
      expect(screen.getByText('Option B')).toBeInTheDocument()
      expect(screen.getByText('Option C')).toBeInTheDocument()
    })

    it('renders select with object options', () => {
      render(
        <PreviewSelect
          label="Choose"
          options={[
            { value: '1', label: 'First' },
            { value: '2', label: 'Second' },
          ]}
        />
      )
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  describe('PreviewBadge', () => {
    it('renders default badge', () => {
      render(<PreviewBadge>Default</PreviewBadge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('renders success badge', () => {
      render(<PreviewBadge variant="success">Success</PreviewBadge>)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('renders warning badge', () => {
      render(<PreviewBadge variant="warning">Warning</PreviewBadge>)
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('renders error badge', () => {
      render(<PreviewBadge variant="error">Error</PreviewBadge>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('renders brand badge', () => {
      render(<PreviewBadge variant="brand">Brand</PreviewBadge>)
      expect(screen.getByText('Brand')).toBeInTheDocument()
    })
  })

  describe('PreviewAlert', () => {
    it('renders info alert', () => {
      render(<PreviewAlert variant="info" title="Info">Info message</PreviewAlert>)
      expect(screen.getByText('Info')).toBeInTheDocument()
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })

    it('renders success alert', () => {
      render(<PreviewAlert variant="success" title="Success">Done</PreviewAlert>)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('renders warning alert', () => {
      render(<PreviewAlert variant="warning" title="Warning">Careful</PreviewAlert>)
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('renders error alert', () => {
      render(<PreviewAlert variant="error" title="Error">Failed</PreviewAlert>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('renders alert without children', () => {
      render(<PreviewAlert title="Just title" />)
      expect(screen.getByText('Just title')).toBeInTheDocument()
    })
  })

  describe('TypographyShowcase', () => {
    it('renders all heading levels', () => {
      render(<TypographyShowcase />)
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.getByText('Heading 3')).toBeInTheDocument()
    })

    it('renders body text', () => {
      render(<TypographyShowcase />)
      expect(screen.getByText(/Body text in the default style/)).toBeInTheDocument()
    })

    it('renders caption text', () => {
      render(<TypographyShowcase />)
      expect(screen.getByText(/Caption text for secondary/)).toBeInTheDocument()
    })

    it('renders link example', () => {
      render(<TypographyShowcase />)
      expect(screen.getByText('Link text example')).toBeInTheDocument()
    })
  })

  describe('ComponentShowcase', () => {
    it('renders typography section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Typography')).toBeInTheDocument()
    })

    it('renders buttons section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument()
    })

    it('renders badges section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Badges')).toBeInTheDocument()
    })

    it('renders form elements section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Form Elements')).toBeInTheDocument()
      expect(screen.getByText('Text Input')).toBeInTheDocument()
      expect(screen.getByText('Select Option')).toBeInTheDocument()
    })

    it('renders card section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Card')).toBeInTheDocument()
      expect(screen.getByText('Sample Card')).toBeInTheDocument()
    })

    it('renders alerts section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Alerts')).toBeInTheDocument()
      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument()
    })

    it('renders color palette section', () => {
      render(<ComponentShowcase />)
      expect(screen.getByText('Color Palette')).toBeInTheDocument()
      // Use getAllByText since these appear in both badges and color swatch labels
      expect(screen.getAllByText('Primary').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Brand').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Superlative')).toBeInTheDocument()
      expect(screen.getByText('Accent')).toBeInTheDocument()
    })
  })
})

