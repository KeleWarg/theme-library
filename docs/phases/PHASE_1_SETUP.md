# Phase 1: Project Setup

## Prerequisites
- Node.js 18+
- npm or yarn
- Design system tokens.css file

## Outcome
A working React app with:
- Routing configured
- Layout shell (sidebar, header, main area)
- Placeholder pages for all routes
- Test setup with Vitest

---

## Task 1.1: Initialize Project

### Instructions
Create a new Vite React project and install dependencies.

### Commands
```bash
npm create vite@latest design-system-admin -- --template react
cd design-system-admin
npm install

# Core dependencies
npm install react-router-dom lucide-react @supabase/supabase-js @monaco-editor/react jszip file-saver

# Testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configure Vitest
Add to `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

Create `src/setupTests.js`:
```javascript
import '@testing-library/jest-dom'
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Verification
- [ ] `npm run dev` starts the server
- [ ] `npm test` runs without errors

---

## Task 1.2: Add Design System Tokens

### Instructions
Copy the design system files into the project.

### Files to Add
1. Copy `tokens.css` to `src/design-system/tokens.css`
2. Import in `src/main.jsx`:
```javascript
import './design-system/tokens.css'
```

3. Add theme class to `index.html`:
```html
<html lang="en" class="theme-health-sem">
```

### Verification
- [ ] CSS variables are available (check in DevTools)
- [ ] `var(--color-btn-primary-bg)` resolves to a color

---

## Task 1.3: Create Folder Structure

### Instructions
Create the following folders:
```
src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ layout/
â”‚   â””â”€â”€ ui/
â”œâ”€â”€ pages/
â”œâ”€â”€ lib/
â”œâ”€â”€ hooks/
â””â”€â”€ __tests__/
```

### Commands
```bash
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/pages
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/__tests__
```

### Verification
- [ ] All folders exist

---

## Task 1.4: Create Sidebar Component

### Instructions
Create `src/components/layout/Sidebar.jsx`

### Requirements
- Fixed width: 240px
- Full height: 100vh
- Background: `var(--color-bg-header)`
- Logo text "Design System" at top
- Navigation items with lucide-react icons:
  - Dashboard (LayoutDashboard) â†’ /
  - Components (Boxes) â†’ /components
  - Foundations (Palette) â†’ /foundations
  - Themes (SwatchBook) â†’ /themes
  - Settings (Settings) â†’ /settings
- Use NavLink from react-router-dom for active state
- Active state: `var(--color-btn-primary-bg)` background

### Test File
Create `src/components/layout/Sidebar.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const renderSidebar = () => {
    return render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    )
  }

  it('renders the logo', () => {
    renderSidebar()
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders all navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('Themes')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('navigation links have correct hrefs', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Components').closest('a')).toHaveAttribute('href', '/components')
  })
})
```

### Verification
- [ ] Component renders without errors
- [ ] All nav items visible
- [ ] Links navigate correctly
- [ ] Tests pass: `npm test`

---

## Task 1.5: Create Header Component

### Instructions
Create `src/components/layout/Header.jsx`

### Requirements
- Height: 64px
- Background: `var(--color-bg-white)`
- Border bottom: 1px solid `var(--color-bg-neutral-medium)`
- Props: `pageTitle` (string)
- Left side: Page title (h1)
- Right side:
  - Theme dropdown (select with 5 themes)
  - "Export" button (primary style)
- Theme dropdown changes `document.documentElement.className`

### Test File
Create `src/components/layout/Header.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders the page title', () => {
    render(<Header pageTitle="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders theme dropdown with all themes', () => {
    render(<Header pageTitle="Test" />)
    const dropdown = screen.getByRole('combobox')
    expect(dropdown).toBeInTheDocument()
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
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
})
```

### Verification
- [ ] Component renders with title
- [ ] Theme dropdown works
- [ ] Export button styled correctly
- [ ] Tests pass

---

## Task 1.6: Create Layout Component

### Instructions
Create `src/components/layout/Layout.jsx`

### Requirements
- Combines Sidebar and Header
- Flexbox layout:
  - Sidebar fixed left (240px)
  - Right side: flex column
    - Header (64px)
    - Main content (flex-grow, overflow auto)
- Main area: padding 24px, background `var(--color-bg-neutral-light)`
- Props: `children`, `pageTitle`

### Test File
Create `src/components/layout/Layout.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

describe('Layout', () => {
  const renderLayout = (props = {}) => {
    return render(
      <BrowserRouter>
        <Layout pageTitle="Test Page" {...props}>
          <div data-testid="content">Page Content</div>
        </Layout>
      </BrowserRouter>
    )
  }

  it('renders sidebar', () => {
    renderLayout()
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders header with page title', () => {
    renderLayout()
    expect(screen.getByRole('heading', { name: 'Test Page' })).toBeInTheDocument()
  })

  it('renders children in main content area', () => {
    renderLayout()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})
```

### Verification
- [ ] Layout combines sidebar + header
- [ ] Children render in main area
- [ ] Tests pass

---

## Task 1.7: Create Page Components

### Instructions
Create placeholder pages in `src/pages/`:
- `Dashboard.jsx`
- `Components.jsx`
- `ComponentDetail.jsx`
- `Foundations.jsx`
- `Themes.jsx`
- `Settings.jsx`

### Template for Each
```javascript
export default function PageName() {
  return (
    <div>
      <h2 style={{ 
        color: 'var(--color-fg-heading)',
        fontSize: 'var(--font-size-heading-md)',
        marginBottom: '16px'
      }}>
        Page Name
      </h2>
      <p style={{ color: 'var(--color-fg-body)' }}>
        Content coming soon...
      </p>
    </div>
  )
}
```

### Test File (Example for Dashboard)
Create `src/pages/Dashboard.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders the page heading', () => {
    render(<Dashboard />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})
```

### Verification
- [ ] All 6 pages created
- [ ] Each page has a test
- [ ] Tests pass

---

## Task 1.8: Setup Routing

### Instructions
Update `src/App.jsx` with React Router.

### Code
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Components from './pages/Components'
import ComponentDetail from './pages/ComponentDetail'
import Foundations from './pages/Foundations'
import Themes from './pages/Themes'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout pageTitle="Dashboard"><Dashboard /></Layout>
        } />
        <Route path="/components" element={
          <Layout pageTitle="Components"><Components /></Layout>
        } />
        <Route path="/components/:slug" element={
          <Layout pageTitle="Component"><ComponentDetail /></Layout>
        } />
        <Route path="/foundations" element={
          <Layout pageTitle="Foundations"><Foundations /></Layout>
        } />
        <Route path="/themes" element={
          <Layout pageTitle="Themes"><Themes /></Layout>
        } />
        <Route path="/settings" element={
          <Layout pageTitle="Settings"><Settings /></Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Test File
Create `src/App.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders dashboard on root route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})
```

### Verification
- [ ] All routes work
- [ ] Navigation updates URL
- [ ] Page content changes with route
- [ ] Tests pass

---

## Phase 1 Complete Checklist

- [ ] Task 1.1: Project initialized
- [ ] Task 1.2: Design tokens added
- [ ] Task 1.3: Folder structure created
- [ ] Task 1.4: Sidebar component with tests
- [ ] Task 1.5: Header component with tests
- [ ] Task 1.6: Layout component with tests
- [ ] Task 1.7: Page components with tests
- [ ] Task 1.8: Routing configured with tests
- [ ] All tests passing: `npm test`
- [ ] App runs: `npm run dev`

## Next Phase
Proceed to `PHASE_2_FOUNDATIONS.md`
