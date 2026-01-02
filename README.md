# Kele's Design System

> Multi-theme design tokens optimized for AI-assisted development with Bolt, Lovable, Cursor, and other LLM coding tools.

## 🚀 Quick Start

### Installation

```bash
npm install @kele/design-system
```

### Basic Usage

```jsx
// 1. Import the CSS tokens
import '@kele/design-system/css';

// 2. Add theme class to your root element
<html className="theme-health-sem">

// 3. Use CSS variables in your styles
<button style={{ 
  backgroundColor: 'var(--color-btn-primary-bg)',
  color: 'var(--color-btn-primary-text)'
}}>
  Click me
</button>
```

### With Tailwind CSS

```js
// tailwind.config.js
const designSystem = require('@kele/design-system/tailwind');

module.exports = {
  presets: [designSystem],
  // your other config...
}
```

```jsx
// Then use semantic classes
<button className="bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover">
  Click me
</button>
```

## 🎨 Available Themes

| Theme | Class | Use Case |
|-------|-------|----------|
| Health SEM | `theme-health-sem` | Health vertical marketing pages |
| Home SEM | `theme-home-sem` | Home services marketing pages |
| ForbesMedia SEO | `theme-forbes-media-seo` | Forbes editorial content |
| Compare Coverage | `theme-advisor-sem-compare-coverage` | Insurance comparison tools |
| LLM | `theme-llm` | AI/LLM product pages |

### Switching Themes

```jsx
// React example
function ThemeSwitcher() {
  const setTheme = (theme) => {
    document.documentElement.className = `theme-${theme}`;
  };
  
  return (
    <select onChange={(e) => setTheme(e.target.value)}>
      <option value="health-sem">Health</option>
      <option value="home-sem">Home</option>
      <option value="llm">LLM</option>
    </select>
  );
}
```

## 📦 Package Contents

```
@kele/design-system/
├── dist/
│   ├── tokens.css          # CSS custom properties (all themes)
│   ├── tokens.ts           # TypeScript definitions & utilities
│   ├── tokens.json         # Raw token data
│   └── tailwind.config.js  # Tailwind preset
├── LLMS.txt                # AI assistant documentation
└── README.md
```

## 🤖 For AI Coding Tools

This package includes `LLMS.txt` - a specially formatted documentation file that helps AI assistants understand and correctly apply the design system.

**For Cursor/Copilot**: The LLMS.txt file is automatically read when the package is installed.

**For Bolt/Lovable**: Reference the design system in your prompt:
> "Use the @kele/design-system package. Apply the health-sem theme. Use semantic color tokens like var(--color-btn-primary-bg) instead of hardcoded colors."

## 🎯 Token Reference

### Colors

#### Backgrounds (`--color-bg-*`)
| Token | Usage |
|-------|-------|
| `bg-white` | Default page background |
| `bg-neutral-subtle` | Subtle section differentiation |
| `bg-neutral-light` | Card backgrounds, input fields |
| `bg-brand` | Brand-colored sections |
| `bg-header` | Navigation header |
| `bg-superlative` | Award/highlight sections |

#### Text (`--color-fg-*`)
| Token | Usage |
|-------|-------|
| `fg-heading` | All headings (h1-h6) |
| `fg-body` | Paragraph text |
| `fg-caption` | Secondary text, metadata |
| `fg-link` | Clickable links |
| `fg-heading-inverse` | Headings on dark backgrounds |

#### Buttons (`--color-btn-*`)
| Token | Usage |
|-------|-------|
| `btn-primary-bg` | Primary button background |
| `btn-primary-text` | Primary button text |
| `btn-primary-hover-bg` | Primary button hover state |
| `btn-secondary-bg` | Secondary button background |
| `btn-secondary-border` | Secondary button border |
| `btn-ghost-text` | Ghost button text |

#### Feedback (`--color-fg-feedback-*`)
| Token | Usage |
|-------|-------|
| `fg-feedback-error` | Error messages |
| `fg-feedback-warning` | Warning messages |
| `fg-feedback-success` | Success messages |

### Typography

#### Font Sizes
| Token | Size | Usage |
|-------|------|-------|
| `--font-size-display` | 56px | Hero headlines |
| `--font-size-heading-lg` | 48px | Page titles |
| `--font-size-heading-md` | 32px | Section headers |
| `--font-size-heading-sm` | 24px | Card titles |
| `--font-size-body-lg` | 18px | Lead paragraphs |
| `--font-size-body-md` | 16px | Default body |
| `--font-size-body-sm` | 14px | Secondary content |
| `--font-size-label-md` | 14px | Buttons, labels |

#### Font Weights
| Token | Weight |
|-------|--------|
| `--font-weight-light` | 300 |
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

### Responsive Grid

| Breakpoint | Width | Columns | Margin | Gutter |
|------------|-------|---------|--------|--------|
| Mobile | 390px | 4 | 16px | 12px |
| Tablet | 744px | 8 | 24px | 24px |
| Desktop | 1440px | 12 | 80px | 24px |

```css
/* Use grid tokens */
.container {
  padding-inline: var(--grid-margin);
  gap: var(--grid-gutter);
}
```

## 🔧 Development

### Updating Tokens from Figma

1. Export variables from Figma as JSON
2. Place files in `figma_tokens/` directory:
   - `themes/*.json` - Theme color tokens
   - `typography/*.json` - Typography tokens  
   - `breakpoints/*.json` - Responsive breakpoints
3. Run `npm run build`

### File Structure for Figma Exports

```
figma_tokens/
├── themes/
│   ├── Health - SEM.tokens.json
│   ├── Home - SEM.tokens.json
│   └── ...
├── typography/
│   ├── Desktop.tokens.json
│   ├── Tablet.tokens.json
│   └── Mobile.tokens.json
└── breakpoints/
    ├── Desktop.tokens.json
    ├── Tablet.tokens.json
    └── Mobile.tokens.json
```

## 📝 Examples

### Card Component

```jsx
function Card({ title, description, cta }) {
  return (
    <div className="bg-bg-neutral-light rounded-lg p-6">
      <h3 className="text-fg-heading text-heading-sm font-bold mb-2">
        {title}
      </h3>
      <p className="text-fg-body text-body-md mb-4">
        {description}
      </p>
      <button className="bg-btn-primary-bg text-btn-primary-text px-4 py-2 rounded hover:bg-btn-primary-hover">
        {cta}
      </button>
    </div>
  );
}
```

### Form Input

```jsx
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-fg-heading text-label-md font-medium">
        {label}
      </label>
      <input 
        className={`
          bg-bg-white border rounded px-3 py-2 text-fg-body
          ${error ? 'border-feedback-error' : 'border-stroke-ui'}
        `}
        {...props}
      />
      {error && (
        <span className="text-feedback-error text-body-sm">{error}</span>
      )}
    </div>
  );
}
```

## 📄 License

MIT - Kele
