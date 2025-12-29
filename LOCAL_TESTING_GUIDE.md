# Testing the Design System Locally in Cursor

## Quick Setup (5 minutes)

### Step 1: Unzip the package

```bash
# Create a folder for your design system
mkdir -p ~/projects/design-system
cd ~/projects/design-system
unzip design-system-package.zip
```

### Step 2: Create a test project

```bash
# Create a new React/Vite project
cd ~/projects
npm create vite@latest test-app -- --template react
cd test-app
npm install
```

### Step 3: Link the design system locally

```bash
# From your test-app folder
npm link ../design-system

# Or just copy the dist files directly (simpler)
cp -r ../design-system/dist ./src/design-system
cp ../design-system/LLMS.txt ./
```

### Step 4: Import in your app

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './design-system/tokens.css'  // Add this line
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```html
<!-- index.html - add theme class -->
<!DOCTYPE html>
<html lang="en" class="theme-health-sem">
  ...
</html>
```

### Step 5: Add Cursor Rules (IMPORTANT)

Create a `.cursorrules` file in your project root:

```bash
touch .cursorrules
```

Add this content:

```
# Design System Rules

You have access to a design system with CSS variables. Always use these instead of hardcoded colors.

## Available Themes
- theme-health-sem
- theme-home-sem  
- theme-forbes-media-seo
- theme-llm
- theme-advisor-sem-compare-coverage

## Color Tokens (use var(--token-name))

### Backgrounds
- --color-bg-white: Default page background
- --color-bg-neutral-light: Card backgrounds
- --color-bg-brand: Brand sections, CTAs
- --color-bg-header: Navigation

### Text
- --color-fg-heading: All headings
- --color-fg-body: Paragraph text
- --color-fg-caption: Secondary text
- --color-fg-link: Links

### Buttons
- --color-btn-primary-bg, --color-btn-primary-text, --color-btn-primary-hover-bg
- --color-btn-secondary-bg, --color-btn-secondary-border, --color-btn-secondary-text
- --color-btn-ghost-text, --color-btn-ghost-hover-bg

### Feedback
- --color-fg-feedback-error
- --color-fg-feedback-warning  
- --color-fg-feedback-success

## Typography
- --font-size-display: 56px (heroes)
- --font-size-heading-lg: 48px (page titles)
- --font-size-heading-md: 32px (sections)
- --font-size-heading-sm: 24px (cards)
- --font-size-body-md: 16px (default)
- --font-size-body-sm: 14px (secondary)

## Rules
1. NEVER hardcode colors like #657E79 - always use CSS variables
2. ALWAYS apply theme class to root element
3. Use semantic tokens (fg-heading, bg-brand) not primitives
4. Reference the LLMS.txt file for complete documentation
```

---

## Testing in Cursor

### Open the project
```bash
cursor ~/projects/test-app
```

### Test prompt examples

Try these prompts in Cursor:

**Prompt 1: Basic component**
> "Create a Card component with a title, description, and CTA button. Use the design system tokens."

Expected output should use `var(--color-*)` not hex values.

**Prompt 2: Full page**
> "Create a landing page hero section with the health-sem theme. Include a headline, subtext, and primary CTA button."

**Prompt 3: Form**
> "Build a contact form with name, email, and message fields. Style it using the design system. Show error states."

---

## Alternative: Use with Tailwind

If you prefer Tailwind classes:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```js
// tailwind.config.js
const designSystem = require('./src/design-system/tailwind.config.js');

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  presets: [designSystem],
}
```

Then prompt Cursor:
> "Create a pricing card using Tailwind. Use bg-bg-brand for the header and text-fg-heading for the title."

---

## Troubleshooting

### Colors not working?
1. Check theme class is on `<html>`: `<html class="theme-health-sem">`
2. Check CSS is imported in main.jsx
3. Inspect element - CSS variables should resolve to hex values

### Cursor not using tokens?
1. Make sure `.cursorrules` file exists in project root
2. Copy `LLMS.txt` to project root
3. Explicitly mention "use the design system" in your prompt

### Want to switch themes?
```jsx
// Runtime theme switching
document.documentElement.className = 'theme-llm';
```

---

## File Structure After Setup

```
test-app/
├── .cursorrules          ← Cursor AI instructions
├── LLMS.txt              ← Full design system docs
├── src/
│   ├── design-system/
│   │   ├── tokens.css    ← CSS variables
│   │   ├── tokens.ts     ← TypeScript types
│   │   └── tailwind.config.js
│   ├── main.jsx          ← Import tokens.css here
│   └── App.jsx
├── index.html            ← Add theme class here
└── package.json
```
