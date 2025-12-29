# Design System Admin - Orchestrator

## Overview

This project builds an admin dashboard for managing a design system with:
- Token/theme visualization
- Component library management
- AI-powered code generation from Figma
- Export to npm package

## Project Structure

```
design-system-admin/
├── docs/                    # Implementation guides (this folder)
│   ├── ORCHESTRATOR.md     # This file - master plan
│   ├── PHASE_1_SETUP.md
│   ├── PHASE_2_FOUNDATIONS.md
│   ├── PHASE_3_THEMES.md
│   ├── PHASE_4_DATABASE.md
│   ├── PHASE_5_COMPONENTS_LIST.md
│   ├── PHASE_6_COMPONENT_DETAIL.md
│   ├── PHASE_7_AI_GENERATION.md
│   ├── PHASE_8_EXPORT.md
│   ├── PHASE_9_DASHBOARD.md
│   └── PHASE_10_FIGMA_PLUGIN.md
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, Layout
│   │   ├── ui/             # Reusable UI components
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Route pages
│   ├── lib/                # Utilities, API, database
│   ├── hooks/              # Custom React hooks
│   └── __tests__/          # Test files
├── public/
├── .env.local              # Environment variables (not committed)
└── package.json
```

## Execution Rules

### For AI Assistant (Cursor)

1. **Read the relevant phase doc** before implementing
2. **Implement one task at a time** - don't skip ahead
3. **Write tests alongside code** - every component needs tests
4. **Use design tokens** - never hardcode colors, use var(--color-*)
5. **Check off completed tasks** in the phase doc
6. **Run tests after each task** - don't proceed if tests fail

### Code Standards

```javascript
// ✅ DO: Use CSS variables
backgroundColor: 'var(--color-btn-primary-bg)'

// ❌ DON'T: Hardcode colors
backgroundColor: '#657E79'

// ✅ DO: Use semantic token names
color: 'var(--color-fg-heading)'

// ❌ DON'T: Use generic names
color: 'var(--color-gray-900)'
```

### Testing Requirements

- **Unit tests**: Every component, hook, and utility function
- **Integration tests**: Page-level interactions
- **Test naming**: `ComponentName.test.jsx` alongside `ComponentName.jsx`
- **Coverage target**: 80%+

### File Naming

- Components: `PascalCase.jsx` (e.g., `Sidebar.jsx`)
- Utilities: `camelCase.js` (e.g., `tokenData.js`)
- Tests: `*.test.jsx` or `*.test.js`
- Hooks: `use*.js` (e.g., `useTheme.js`)

## Phase Overview

| Phase | Doc | Description | Depends On |
|-------|-----|-------------|------------|
| 1 | PHASE_1_SETUP.md | Project setup, layout shell | - |
| 2 | PHASE_2_FOUNDATIONS.md | Token viewer | Phase 1 |
| 3 | PHASE_3_THEMES.md | Theme preview/switching | Phase 1, 2 |
| 4 | PHASE_4_DATABASE.md | Supabase setup | Phase 1 |
| 5 | PHASE_5_COMPONENTS_LIST.md | Components grid | Phase 1, 4 |
| 6 | PHASE_6_COMPONENT_DETAIL.md | Component editor | Phase 5 |
| 7 | PHASE_7_AI_GENERATION.md | Claude integration | Phase 6 |
| 8 | PHASE_8_EXPORT.md | Package generator | Phase 5, 6 |
| 9 | PHASE_9_DASHBOARD.md | Dashboard overview | Phase 4, 5 |
| 10 | PHASE_10_FIGMA_PLUGIN.md | Figma plugin | Phase 4 |

## How to Execute

### Starting a Phase

1. Read the phase doc completely
2. Check prerequisites are met
3. Implement tasks in order
4. Write tests for each task
5. Mark tasks complete
6. Run all tests before next phase

### Command to Start

```bash
# In Cursor, say:
"Read docs/PHASE_1_SETUP.md and implement Task 1.1"
```

### After Each Task

```bash
# Run tests
npm test

# If tests pass, continue
"Task 1.1 complete. Implement Task 1.2"

# If tests fail, fix first
"Tests failing for Task 1.1. Fix the issues."
```

## Environment Variables

Create `.env.local` with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
```

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0",
    "@supabase/supabase-js": "^2.38.0",
    "@monaco-editor/react": "^4.6.0",
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0"
  }
}
```

## Progress Tracker

- [ ] Phase 1: Setup
- [ ] Phase 2: Foundations
- [ ] Phase 3: Themes
- [ ] Phase 4: Database
- [ ] Phase 5: Components List
- [ ] Phase 6: Component Detail
- [ ] Phase 7: AI Generation
- [ ] Phase 8: Export
- [ ] Phase 9: Dashboard
- [ ] Phase 10: Figma Plugin

## Quick Reference

### Run Commands

```bash
npm run dev          # Start dev server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run build       # Production build
npm run lint        # Run linter
```

### Key Files

- `src/lib/tokenData.js` - Design token definitions
- `src/lib/supabase.js` - Database client
- `src/lib/database.js` - Database helpers
- `src/lib/generateCode.js` - AI code generation
- `src/lib/packageGenerator.js` - Export system
