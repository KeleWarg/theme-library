# Phase 3: Themes

## Prerequisites
- Phase 1 & 2 complete
- All tests passing

## Outcome
A Themes page with:
- Theme cards showing color previews
- Preview modal with sample UI
- Theme switching (persisted to localStorage)

---

## Task 3.1: Create useTheme Hook

### Instructions
Create `src/hooks/useTheme.js`

### Requirements
- Returns current theme and setTheme function
- Persists to localStorage
- Updates document.documentElement.className
- Initializes from localStorage on mount

### Code
```javascript
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'design-system-theme'
const DEFAULT_THEME = 'theme-health-sem'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
  }

  return { theme, setTheme }
}
```

### Test File
Create `src/hooks/useTheme.test.js`:
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('returns default theme when no localStorage', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('theme-health-sem')
  })

  it('reads theme from localStorage', () => {
    localStorage.setItem('design-system-theme', 'theme-llm')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('theme-llm')
  })

  it('updates document class when theme changes', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('theme-llm')
    })
    expect(document.documentElement.className).toBe('theme-llm')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('theme-home-sem')
    })
    expect(localStorage.getItem('design-system-theme')).toBe('theme-home-sem')
  })
})
```

### Verification
- [ ] Hook returns theme and setter
- [ ] LocalStorage persists correctly
- [ ] Document class updates
- [ ] Tests pass

---

## Task 3.2: Create ThemeCard Component

### Instructions
Create `src/components/ui/ThemeCard.jsx`

### Requirements
- Props: `theme` ({name, slug}), `isActive`, `onPreview`, `onApply`
- Display:
  - 5 color swatches (preview of theme colors)
  - Theme name
  - "Active" badge if isActive
  - Preview button
  - Apply button (disabled if isActive)
- Style with design tokens

### Code Structure
```javascript
import { Check } from 'lucide-react'

export default function ThemeCard({ theme, isActive, onPreview, onApply }) {
  // Define preview colors for each theme
  const themeColors = {
    'theme-health-sem': ['#657E79', '#FFFFFF', '#F5F5F5', '#2D3748', '#1A202C'],
    'theme-home-sem': ['#1E3A8A', '#FFFFFF', '#F0F4FF', '#1E293B', '#0F172A'],
    'theme-llm': ['#007AC8', '#FFFFFF', '#ECF1FF', '#1E2125', '#0B5F95'],
    'theme-forbes-media-seo': ['#000000', '#FFFFFF', '#F4F5F8', '#1E2125', '#333333'],
    'theme-advisor-sem-compare-coverage': ['#00695C', '#FFFFFF', '#E0F2F1', '#1E2125', '#004D40'],
  }

  const colors = themeColors[theme.slug] || themeColors['theme-health-sem']

  // Implement JSX...
}
```

### Test File
Create `src/components/ui/ThemeCard.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeCard from './ThemeCard'

describe('ThemeCard', () => {
  const theme = { name: 'Health SEM', slug: 'theme-health-sem' }
  const defaultProps = {
    theme,
    isActive: false,
    onPreview: vi.fn(),
    onApply: vi.fn()
  }

  it('renders theme name', () => {
    render(<ThemeCard {...defaultProps} />)
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
  })

  it('renders color swatches', () => {
    render(<ThemeCard {...defaultProps} />)
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('shows active badge when isActive', () => {
    render(<ThemeCard {...defaultProps} isActive={true} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('calls onPreview when Preview clicked', () => {
    render(<ThemeCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Preview'))
    expect(defaultProps.onPreview).toHaveBeenCalled()
  })

  it('calls onApply when Apply clicked', () => {
    render(<ThemeCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Apply'))
    expect(defaultProps.onApply).toHaveBeenCalled()
  })

  it('disables Apply button when isActive', () => {
    render(<ThemeCard {...defaultProps} isActive={true} />)
    expect(screen.getByText('Apply')).toBeDisabled()
  })
})
```

### Verification
- [ ] Card displays theme name
- [ ] Color swatches visible
- [ ] Active state shows badge
- [ ] Buttons work correctly
- [ ] Tests pass

---

## Task 3.3: Create ThemePreviewModal Component

### Instructions
Create `src/components/ui/ThemePreviewModal.jsx`

### Requirements
- Props: `isOpen`, `theme`, `onClose`, `onApply`
- Modal overlay (fixed, full screen, semi-transparent)
- Modal content with theme class applied (not whole page)
- Preview sections:
  - Buttons (Primary, Secondary, Ghost)
  - Typography (Heading, Body, Caption)
  - Sample Card
  - Form Input
- Footer: Apply button, Close button

### Code Structure
```javascript
import { X } from 'lucide-react'

export default function ThemePreviewModal({ isOpen, theme, onClose, onApply }) {
  if (!isOpen || !theme) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${theme.slug}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Apply theme class only to this container */}
        {/* Preview sections... */}
      </div>
    </div>
  )
}
```

### Test File
Create `src/components/ui/ThemePreviewModal.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemePreviewModal from './ThemePreviewModal'

describe('ThemePreviewModal', () => {
  const theme = { name: 'Health SEM', slug: 'theme-health-sem' }
  const defaultProps = {
    isOpen: true,
    theme,
    onClose: vi.fn(),
    onApply: vi.fn()
  }

  it('renders nothing when isOpen is false', () => {
    render(<ThemePreviewModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Health SEM')).not.toBeInTheDocument()
  })

  it('renders theme name when open', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
  })

  it('renders button previews', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })

  it('renders typography previews', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Heading Example')).toBeInTheDocument()
  })

  it('calls onClose when overlay clicked', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onApply when Apply button clicked', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Apply Theme'))
    expect(defaultProps.onApply).toHaveBeenCalled()
  })

  it('applies theme class to modal content', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    const content = screen.getByTestId('modal-content')
    expect(content).toHaveClass('theme-health-sem')
  })
})
```

### Verification
- [ ] Modal opens/closes correctly
- [ ] Theme class applied to content only
- [ ] All preview sections render
- [ ] Buttons work correctly
- [ ] Tests pass

---

## Task 3.4: Create Themes Page

### Instructions
Update `src/pages/Themes.jsx`

### Requirements
- Grid of ThemeCard components (3 columns)
- Track active theme with useTheme hook
- State for preview modal (which theme to preview)
- Apply theme updates document class and localStorage

### Code Structure
```javascript
import { useState } from 'react'
import { themes } from '../lib/tokenData'
import { useTheme } from '../hooks/useTheme'
import ThemeCard from '../components/ui/ThemeCard'
import ThemePreviewModal from '../components/ui/ThemePreviewModal'

export default function Themes() {
  const { theme: activeTheme, setTheme } = useTheme()
  const [previewTheme, setPreviewTheme] = useState(null)

  const handleApply = (theme) => {
    setTheme(theme.slug)
    setPreviewTheme(null)
  }

  // Implement JSX...
}
```

### Test File
Create `src/pages/Themes.test.jsx`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Themes from './Themes'

describe('Themes', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = 'theme-health-sem'
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
    const healthCard = screen.getByText('Health SEM').closest('[data-testid="theme-card"]')
    expect(healthCard).toContainElement(screen.getByText('Active'))
  })

  it('opens preview modal when Preview clicked', () => {
    render(<Themes />)
    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[0])
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
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
})
```

### Verification
- [ ] All theme cards display
- [ ] Active theme highlighted
- [ ] Preview modal works
- [ ] Theme switching works
- [ ] Theme persists to localStorage
- [ ] Tests pass

---

## Task 3.5: Update Header to Use useTheme Hook

### Instructions
Update `src/components/layout/Header.jsx` to use the useTheme hook.

### Changes
- Import and use useTheme hook
- Remove local theme state
- Theme dropdown uses hook's theme and setTheme

### Updated Test
Update `src/components/layout/Header.test.jsx`:
```javascript
// Add this test
it('syncs with useTheme hook', () => {
  localStorage.setItem('design-system-theme', 'theme-llm')
  render(<Header pageTitle="Test" />)
  const dropdown = screen.getByRole('combobox')
  expect(dropdown.value).toBe('theme-llm')
})
```

### Verification
- [ ] Header uses shared theme state
- [ ] Changing theme in Header updates Themes page
- [ ] Changing theme in Themes page updates Header
- [ ] Tests pass

---

## Phase 3 Complete Checklist

- [ ] Task 3.1: useTheme hook with tests
- [ ] Task 3.2: ThemeCard component with tests
- [ ] Task 3.3: ThemePreviewModal component with tests
- [ ] Task 3.4: Themes page with tests
- [ ] Task 3.5: Header using useTheme
- [ ] All tests passing: `npm test`
- [ ] Theme switching works across app
- [ ] Theme persists on page reload

## Next Phase
Proceed to `PHASE_4_DATABASE.md`
