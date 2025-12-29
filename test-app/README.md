# Design System Admin Dashboard

A React-based admin interface for browsing, previewing, and exporting your multi-theme design system tokens.

## Features

- **Dashboard** - Overview of token counts and live component preview
- **Color Tokens** - Browse all color tokens by category with search and copy-to-clipboard
- **Typography** - View font sizes, weights, line heights, and font families
- **Spacing & Grid** - Interactive grid system explorer with breakpoint documentation
- **Components** - Live component gallery (buttons, cards, forms, alerts, badges, tables)
- **Export** - Download tokens in CSS, SCSS, JSON, TypeScript, or Tailwind config formats

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Theme Switching

Use the dropdown in the sidebar to switch between themes:
- Advisor SEM/Compare Coverage
- ForbesMedia - SEO
- Health - SEM
- Home - SEM
- LLM

All components and colors update live when you switch themes.

## Project Structure

```
src/
├── App.jsx           # Main app with routing and theme context
├── App.css           # Dashboard styles
├── design-system/
│   ├── tokens.css    # CSS variables for all themes
│   ├── tokens.json   # Raw token data
│   └── tokens.ts     # TypeScript types
└── pages/
    ├── Dashboard.jsx     # Overview page
    ├── ColorTokens.jsx   # Color browser
    ├── Typography.jsx    # Typography explorer
    ├── Spacing.jsx       # Grid/spacing tools
    ├── Components.jsx    # Component gallery
    └── Export.jsx        # Export functionality
```

## Using Design Tokens

### CSS Variables

```css
.my-button {
  background: var(--color-btn-primary-bg);
  color: var(--color-btn-primary-text);
  font-size: var(--font-size-label-md);
}
```

### Theme Classes

Apply a theme class to your root element:

```html
<html class="theme-health-sem">
```

Available theme classes:
- `theme-advisor-sem-compare-coverage`
- `theme-forbes-media-seo`
- `theme-health-sem`
- `theme-home-sem`
- `theme-llm`

## Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Dependencies

- React 19
- React Router DOM
- Lucide React (icons)
- Vite 7
