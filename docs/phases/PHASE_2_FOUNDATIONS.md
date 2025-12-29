# Phase 2: Foundations (Token Viewer)

## Prerequisites
- Phase 1 complete
- All Phase 1 tests passing

## Outcome
A Foundations page displaying:
- Color tokens with swatches
- Typography tokens with live samples
- Spacing/grid visualization
- Click-to-copy CSS variables

---

## Task 2.1: Create Token Data Helper

### Instructions
Create `src/lib/tokenData.js` with organized token data.

### Code
```javascript
// Theme definitions
export const themes = [
  { name: 'Health SEM', slug: 'theme-health-sem' },
  { name: 'Home SEM', slug: 'theme-home-sem' },
  { name: 'LLM', slug: 'theme-llm' },
  { name: 'ForbesMedia SEO', slug: 'theme-forbes-media-seo' },
  { name: 'Compare Coverage', slug: 'theme-advisor-sem-compare-coverage' },
];

// Color tokens organized by category
export const colorTokens = {
  backgrounds: [
    { name: 'bg-white', variable: '--color-bg-white', description: 'Primary background' },
    { name: 'bg-neutral-light', variable: '--color-bg-neutral-light', description: 'Secondary background' },
    { name: 'bg-neutral-medium', variable: '--color-bg-neutral-medium', description: 'Tertiary background' },
    { name: 'bg-brand', variable: '--color-bg-brand', description: 'Brand background' },
    { name: 'bg-header', variable: '--color-bg-header', description: 'Header/sidebar background' },
  ],
  foregrounds: [
    { name: 'fg-heading', variable: '--color-fg-heading', description: 'Heading text' },
    { name: 'fg-body', variable: '--color-fg-body', description: 'Body text' },
    { name: 'fg-caption', variable: '--color-fg-caption', description: 'Caption/muted text' },
    { name: 'fg-link', variable: '--color-fg-link', description: 'Link text' },
  ],
  buttons: {
    primary: [
      { name: 'btn-primary-bg', variable: '--color-btn-primary-bg', description: 'Primary button background' },
      { name: 'btn-primary-text', variable: '--color-btn-primary-text', description: 'Primary button text' },
      { name: 'btn-primary-hover', variable: '--color-btn-primary-hover', description: 'Primary button hover' },
    ],
    secondary: [
      { name: 'btn-secondary-bg', variable: '--color-btn-secondary-bg', description: 'Secondary button background' },
      { name: 'btn-secondary-text', variable: '--color-btn-secondary-text', description: 'Secondary button text' },
      { name: 'btn-secondary-border', variable: '--color-btn-secondary-border', description: 'Secondary button border' },
    ],
    ghost: [
      { name: 'btn-ghost-text', variable: '--color-btn-ghost-text', description: 'Ghost button text' },
      { name: 'btn-ghost-hover', variable: '--color-btn-ghost-hover', description: 'Ghost button hover background' },
    ],
  },
  feedback: [
    { name: 'feedback-error', variable: '--color-fg-feedback-error', description: 'Error state' },
    { name: 'feedback-warning', variable: '--color-fg-feedback-warning', description: 'Warning state' },
    { name: 'feedback-success', variable: '--color-fg-feedback-success', description: 'Success state' },
  ],
};

// Typography tokens
export const typographyTokens = {
  fontSizes: [
    { name: 'display', variable: '--font-size-display', value: '56px' },
    { name: 'heading-lg', variable: '--font-size-heading-lg', value: '48px' },
    { name: 'heading-md', variable: '--font-size-heading-md', value: '32px' },
    { name: 'heading-sm', variable: '--font-size-heading-sm', value: '24px' },
    { name: 'body-lg', variable: '--font-size-body-lg', value: '18px' },
    { name: 'body-md', variable: '--font-size-body-md', value: '16px' },
    { name: 'body-sm', variable: '--font-size-body-sm', value: '14px' },
    { name: 'label-md', variable: '--font-size-label-md', value: '14px' },
    { name: 'label-sm', variable: '--font-size-label-sm', value: '12px' },
  ],
  fontWeights: [
    { name: 'light', variable: '--font-weight-light', value: '300' },
    { name: 'regular', variable: '--font-weight-regular', value: '400' },
    { name: 'medium', variable: '--font-weight-medium', value: '500' },
    { name: 'semibold', variable: '--font-weight-semibold', value: '600' },
    { name: 'bold', variable: '--font-weight-bold', value: '700' },
  ],
  lineHeights: [
    { name: 'line-height-tight', variable: '--line-height-xs', value: '1.2' },
    { name: 'line-height-normal', variable: '--line-height-md', value: '1.5' },
    { name: 'line-height-relaxed', variable: '--line-height-lg', value: '1.75' },
  ],
};

// Breakpoints and grid
export const breakpoints = [
  { name: 'Mobile', width: '390px', columns: 4, margin: '16px', gutter: '16px' },
  { name: 'Tablet', width: '744px', columns: 8, margin: '32px', gutter: '24px' },
  { name: 'Desktop', width: '1440px', columns: 12, margin: '80px', gutter: '24px' },
];

// Helper functions
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  return true;
}

export function getCSSVariable(variable) {
  return `var(${variable})`;
}
```

### Test File
Create `src/lib/tokenData.test.js`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { 
  themes, 
  colorTokens, 
  typographyTokens, 
  breakpoints,
  copyToClipboard,
  getCSSVariable 
} from './tokenData'

describe('tokenData', () => {
  describe('themes', () => {
    it('has 5 themes', () => {
      expect(themes).toHaveLength(5)
    })

    it('each theme has name and slug', () => {
      themes.forEach(theme => {
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('slug')
      })
    })
  })

  describe('colorTokens', () => {
    it('has background colors', () => {
      expect(colorTokens.backgrounds.length).toBeGreaterThan(0)
    })

    it('each color has required properties', () => {
      colorTokens.backgrounds.forEach(color => {
        expect(color).toHaveProperty('name')
        expect(color).toHaveProperty('variable')
        expect(color.variable).toMatch(/^--color-/)
      })
    })
  })

  describe('getCSSVariable', () => {
    it('wraps variable in var()', () => {
      expect(getCSSVariable('--color-bg-white')).toBe('var(--color-bg-white)')
    })
  })

  describe('copyToClipboard', () => {
    it('calls clipboard API', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText }
      })
      
      await copyToClipboard('test')
      expect(mockWriteText).toHaveBeenCalledWith('test')
    })
  })
})
```

### Verification
- [ ] Token data exports correctly
- [ ] Helper functions work
- [ ] Tests pass

---

## Task 2.2: Create ColorSwatch Component

### Instructions
Create `src/components/ui/ColorSwatch.jsx`

### Requirements
- Props: `name`, `variable`, `description` (optional)
- Display:
  - Color preview box (48px height)
  - Token name (bold)
  - CSS variable (monospace)
  - Description (if provided)
- Click copies `var(--variable)` to clipboard
- Show "Copied!" feedback briefly

### Code Structure
```javascript
import { useState } from 'react'
import { copyToClipboard, getCSSVariable } from '../../lib/tokenData'

export default function ColorSwatch({ name, variable, description }) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    copyToClipboard(getCSSVariable(variable))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Implement styles and JSX...
}
```

### Test File
Create `src/components/ui/ColorSwatch.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColorSwatch from './ColorSwatch'

describe('ColorSwatch', () => {
  const defaultProps = {
    name: 'bg-white',
    variable: '--color-bg-white',
    description: 'Primary background'
  }

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
  })

  it('renders token name', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('bg-white')).toBeInTheDocument()
  })

  it('renders CSS variable', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('--color-bg-white')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<ColorSwatch {...defaultProps} />)
    expect(screen.getByText('Primary background')).toBeInTheDocument()
  })

  it('copies to clipboard on click', async () => {
    render(<ColorSwatch {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('var(--color-bg-white)')
  })

  it('shows copied feedback', async () => {
    render(<ColorSwatch {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Swatch displays color correctly
- [ ] Click copies to clipboard
- [ ] Feedback shows and hides
- [ ] Tests pass

---

## Task 2.3: Create Tab Component

### Instructions
Create `src/components/ui/Tabs.jsx`

### Requirements
- Props: `tabs` (array of {id, label}), `activeTab`, `onChange`
- Horizontal tab buttons
- Active tab styled with `var(--color-btn-primary-bg)`
- Inactive tabs: transparent with border-bottom

### Test File
Create `src/components/ui/Tabs.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Tabs from './Tabs'

describe('Tabs', () => {
  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
  ]

  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="colors" onChange={() => {}} />)
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Spacing')).toBeInTheDocument()
  })

  it('calls onChange when tab clicked', () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} activeTab="colors" onChange={onChange} />)
    fireEvent.click(screen.getByText('Typography'))
    expect(onChange).toHaveBeenCalledWith('typography')
  })

  it('highlights active tab', () => {
    render(<Tabs tabs={tabs} activeTab="colors" onChange={() => {}} />)
    const activeTab = screen.getByText('Colors').closest('button')
    expect(activeTab).toHaveStyle({ backgroundColor: expect.any(String) })
  })
})
```

### Verification
- [ ] Tabs render correctly
- [ ] Click switches active tab
- [ ] Active tab visually distinct
- [ ] Tests pass

---

## Task 2.4: Create Foundations Page - Colors Tab

### Instructions
Update `src/pages/Foundations.jsx` with tabbed interface and Colors content.

### Requirements
- Three tabs: Colors, Typography, Spacing
- Colors tab shows:
  - "Backgrounds" section with grid of ColorSwatches
  - "Text Colors" section
  - "Button Colors" section (Primary, Secondary, Ghost subsections)
  - "Feedback" section
- 4-column grid, 16px gap
- Section headings styled with `var(--font-size-heading-sm)`

### Test File
Create `src/pages/Foundations.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Foundations from './Foundations'

describe('Foundations', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    })
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

  it('renders button color sections', () => {
    render(<Foundations />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Tabs switch correctly
- [ ] All color sections visible
- [ ] Swatches display actual colors
- [ ] Tests pass

---

## Task 2.5: Create Typography Sample Component

### Instructions
Create `src/components/ui/TypographySample.jsx`

### Requirements
- Props: `name`, `variable`, `value`, `sampleText` (default: "The quick brown fox")
- Display sample text at the specified size/weight
- Show token name and CSS variable
- Click to copy

### Test File
Create `src/components/ui/TypographySample.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TypographySample from './TypographySample'

describe('TypographySample', () => {
  const defaultProps = {
    name: 'heading-lg',
    variable: '--font-size-heading-lg',
    value: '48px'
  }

  it('renders sample text', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('The quick brown fox')).toBeInTheDocument()
  })

  it('renders custom sample text', () => {
    render(<TypographySample {...defaultProps} sampleText="Custom text" />)
    expect(screen.getByText('Custom text')).toBeInTheDocument()
  })

  it('applies font size from variable', () => {
    render(<TypographySample {...defaultProps} />)
    const sample = screen.getByText('The quick brown fox')
    expect(sample).toHaveStyle({ fontSize: 'var(--font-size-heading-lg)' })
  })

  it('shows token info', () => {
    render(<TypographySample {...defaultProps} />)
    expect(screen.getByText('heading-lg')).toBeInTheDocument()
    expect(screen.getByText('48px')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Sample text renders at correct size
- [ ] Token info visible
- [ ] Click copies variable
- [ ] Tests pass

---

## Task 2.6: Create Foundations Page - Typography Tab

### Instructions
Add Typography tab content to `src/pages/Foundations.jsx`

### Requirements
- "Font Sizes" section with TypographySample for each size
- "Font Weights" section showing sample text at each weight
- "Line Heights" section with multi-line samples
- Each sample shows: live preview, name, CSS variable, value

### Test Addition
Add to `src/pages/Foundations.test.jsx`:
```javascript
describe('Typography tab', () => {
  it('shows typography content when tab clicked', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Typography'))
    expect(screen.getByText('Font Sizes')).toBeInTheDocument()
  })

  it('renders font size samples', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Typography'))
    expect(screen.getByText('display')).toBeInTheDocument()
    expect(screen.getByText('heading-lg')).toBeInTheDocument()
  })

  it('renders font weight samples', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Typography'))
    expect(screen.getByText('Font Weights')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Typography tab shows content
- [ ] Font sizes render at actual size
- [ ] All weight samples visible
- [ ] Tests pass

---

## Task 2.7: Create Foundations Page - Spacing Tab

### Instructions
Add Spacing tab content to `src/pages/Foundations.jsx`

### Requirements
- "Breakpoints" section with 3 cards (Mobile, Tablet, Desktop)
  - Each shows: name, width, columns, margin, gutter
- "Grid Visualization" section
  - Visual representation of 12-column grid
  - Colored columns with gutters between

### Test Addition
Add to `src/pages/Foundations.test.jsx`:
```javascript
describe('Spacing tab', () => {
  it('shows spacing content when tab clicked', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Spacing'))
    expect(screen.getByText('Breakpoints')).toBeInTheDocument()
  })

  it('renders breakpoint cards', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Spacing'))
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('Tablet')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  it('shows grid visualization', () => {
    render(<Foundations />)
    fireEvent.click(screen.getByText('Spacing'))
    expect(screen.getByText('Grid Visualization')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Spacing tab shows content
- [ ] Breakpoint cards display info
- [ ] Grid visualization renders
- [ ] Tests pass

---

## Phase 2 Complete Checklist

- [ ] Task 2.1: Token data helper with tests
- [ ] Task 2.2: ColorSwatch component with tests
- [ ] Task 2.3: Tabs component with tests
- [ ] Task 2.4: Foundations Colors tab with tests
- [ ] Task 2.5: TypographySample component with tests
- [ ] Task 2.6: Foundations Typography tab with tests
- [ ] Task 2.7: Foundations Spacing tab with tests
- [ ] All tests passing: `npm test`
- [ ] Visual review: all tokens display correctly

## Next Phase
Proceed to `PHASE_3_THEMES.md`
