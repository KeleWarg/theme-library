/**
 * Token Transformer
 * Converts Figma Variables JSON exports into LLM-friendly formats:
 * - CSS Custom Properties
 * - Tailwind CSS config
 * - TypeScript constants with JSDoc
 * - LLMS.txt (AI-readable documentation)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const INPUT_DIR = path.join(__dirname, '../figma_tokens');
const OUTPUT_DIR = path.join(__dirname, '../dist');
const DOCS_DIR = path.join(__dirname, '../docs');

// ============================================================================
// HELPERS
// ============================================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/\//g, '-') // Replace "/" with "-" to avoid CSS selector issues
    .toLowerCase();
}

/**
 * Check if theme is a SEM theme (Health, Home, Compare Coverage)
 * SEM themes use: serif (Georgia) + sans-serif (Euclid Circular B)
 * SEO/LLM themes use: display (Schnyder S) + heading/body/sans-serif (Work Sans)
 */
function isSEMTheme(themeName) {
  const name = themeName.toLowerCase();
  return name.includes('health') ||
         name.includes('home') ||
         name.includes('compare') ||
         (name.includes('sem') && !name.includes('seo'));
}

function camelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

function extractHex(value) {
  if (typeof value === 'object' && value.hex) {
    return value.hex;
  }
  return value;
}

// ============================================================================
// PARSERS
// ============================================================================

function parseThemeTokens(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const themeName = data.$extensions?.['com.figma.modeName'] || 'default';
  
  const tokens = {
    name: themeName,
    slug: kebabCase(themeName),
    colors: {
      button: {},
      background: {},
      foreground: {},
      superlative: {}
    }
  };

  // Parse Color tokens
  if (data.Color) {
    // Button colors
    if (data.Color.Button) {
      for (const [variant, props] of Object.entries(data.Color.Button)) {
        tokens.colors.button[kebabCase(variant)] = {};
        for (const [key, val] of Object.entries(props)) {
          if (val.$value) {
            tokens.colors.button[kebabCase(variant)][kebabCase(key)] = extractHex(val.$value);
          }
        }
      }
    }
    
    // Background colors
    if (data.Color.Background) {
      for (const [key, val] of Object.entries(data.Color.Background)) {
        if (val.$value) {
          tokens.colors.background[kebabCase(key)] = extractHex(val.$value);
        }
      }
    }
    
    // Foreground colors
    if (data.Color.Foreground) {
      for (const [key, val] of Object.entries(data.Color.Foreground)) {
        if (val.$value) {
          tokens.colors.foreground[kebabCase(key)] = extractHex(val.$value);
        }
      }
    }
    
    // Superlative colors
    if (data.Color.Superlative) {
      for (const [key, val] of Object.entries(data.Color.Superlative)) {
        if (val.$value) {
          tokens.colors.superlative[kebabCase(key)] = extractHex(val.$value);
        }
      }
    }
  }

  return tokens;
}

function parseTypographyTokens(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const modeName = data.$extensions?.['com.figma.modeName'] || 'default';
  
  const tokens = {
    mode: modeName,
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {}
  };

  // Font families (grouped by theme)
  if (data['Font Family']) {
    for (const [group, fonts] of Object.entries(data['Font Family'])) {
      for (const [key, val] of Object.entries(fonts)) {
        if (val.$value) {
          const tokenKey = group === 'SEM' ? kebabCase(key) : `${kebabCase(group)}-${kebabCase(key)}`;
          tokens.fontFamily[tokenKey] = val.$value;
        }
      }
    }
  }

  // Font sizes (grouped by theme)
  if (data['Font Size']) {
    for (const [group, sizes] of Object.entries(data['Font Size'])) {
      for (const [key, val] of Object.entries(sizes)) {
        if (val.$value !== undefined) {
          const tokenKey = group === 'SEM' ? kebabCase(key) : `${kebabCase(group)}-${kebabCase(key)}`;
          tokens.fontSize[tokenKey] = val.$value;
        }
      }
    }
  }

  // Font weights
  if (data['Font weight']) {
    for (const [key, val] of Object.entries(data['Font weight'])) {
      if (val.$value !== undefined) {
        tokens.fontWeight[kebabCase(key)] = val.$value;
      }
    }
  }

  // Line heights
  if (data['Line height']) {
    for (const [key, val] of Object.entries(data['Line height'])) {
      if (val.$value !== undefined) {
        tokens.lineHeight[kebabCase(key)] = val.$value;
      }
    }
  }

  // Letter spacing
  if (data['Letter Spacing']) {
    for (const [key, val] of Object.entries(data['Letter Spacing'])) {
      if (val.$value !== undefined) {
        tokens.letterSpacing[kebabCase(key)] = val.$value;
      }
    }
  }

  return tokens;
}

function parseBreakpointTokens(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const modeName = data.$extensions?.['com.figma.modeName'] || 'default';
  
  return {
    mode: kebabCase(modeName),
    breakpoint: data.Breakpoint?.$value,
    columns: data.Columns?.$value,
    margin: data.Margin?.$value,
    gutter: data.Gutter?.$value
  };
}

// ============================================================================
// GENERATORS
// ============================================================================

function generateCSS(themes, typography, breakpoints) {
  let css = `/**
 * Design System Tokens
 * Auto-generated from Figma Variables
 * 
 * USAGE FOR AI TOOLS:
 * - Use CSS variables for theming: var(--color-bg-primary)
 * - Theme class on root: <html class="theme-health-sem">
 * - Responsive breakpoints: mobile (<744px), tablet (744-1439px), desktop (≥1440px)
 */

/* ============================================================================
   BREAKPOINTS & GRID
   ============================================================================ */
:root {
`;

  // Add breakpoint variables
  for (const bp of breakpoints) {
    css += `  /* ${bp.mode} */\n`;
    css += `  --breakpoint-${bp.mode}: ${bp.breakpoint}px;\n`;
    css += `  --grid-columns-${bp.mode}: ${bp.columns};\n`;
    css += `  --grid-margin-${bp.mode}: ${bp.margin}px;\n`;
    css += `  --grid-gutter-${bp.mode}: ${bp.gutter}px;\n\n`;
  }

  // Add typography variables (from Desktop as base)
  const desktopTypo = typography.find(t => t.mode === 'Desktop') || typography[0];

  // Note: Font families are defined per-theme below, not in :root
  // This allows SEM themes to use serif/sans-serif and SEO/LLM themes to use display/heading/body

  css += `\n  /* Typography - Font Sizes */\n`;
  for (const [key, val] of Object.entries(desktopTypo.fontSize)) {
    css += `  --font-size-${key}: ${val}px;\n`;
  }

  css += `\n  /* Typography - Font Weights */\n`;
  for (const [key, val] of Object.entries(desktopTypo.fontWeight)) {
    css += `  --font-weight-${key.replace('font-weight-', '')}: ${val};\n`;
  }

  css += `\n  /* Typography - Line Heights */\n`;
  for (const [key, val] of Object.entries(desktopTypo.lineHeight)) {
    css += `  --line-height-${key.replace('line-height-', '')}: ${val}px;\n`;
  }

  css += `\n  /* Typography - Letter Spacing */\n`;
  for (const [key, val] of Object.entries(desktopTypo.letterSpacing)) {
    css += `  --letter-spacing-${key.replace('spacing-', '')}: ${val}px;\n`;
  }

  css += `}\n\n`;

  // Generate theme classes
  for (const theme of themes) {
    const isSEM = isSEMTheme(theme.name);

    css += `/* ============================================================================
   THEME: ${theme.name}
   ============================================================================ */
.theme-${theme.slug},
[data-theme="${theme.slug}"] {
`;

    // Font Families - different for SEM vs SEO/LLM themes
    if (isSEM) {
      css += `  /* Font Families - SEM */\n`;
      css += `  --font-family-serif: "Georgia";\n`;
      css += `  --font-family-sans-serif: "Euclid Circular B";\n\n`;
    } else {
      css += `  /* Font Families - SEO/LLM */\n`;
      css += `  --font-family-display: "Schnyder S";\n`;
      css += `  --font-family-heading: "Work Sans";\n`;
      css += `  --font-family-body: "Work Sans";\n`;
      css += `  --font-family-sans-serif: "Work Sans";\n\n`;
    }

    // Button colors
    css += `  /* Button - Primary */\n`;
    if (theme.colors.button.primary) {
      for (const [key, val] of Object.entries(theme.colors.button.primary)) {
        css += `  --color-btn-${key}: ${val};\n`;
      }
    }

    css += `\n  /* Button - Secondary */\n`;
    if (theme.colors.button.secondary) {
      for (const [key, val] of Object.entries(theme.colors.button.secondary)) {
        css += `  --color-btn-${key}: ${val};\n`;
      }
    }

    css += `\n  /* Button - Ghost */\n`;
    if (theme.colors.button.ghost) {
      for (const [key, val] of Object.entries(theme.colors.button.ghost)) {
        css += `  --color-btn-${key}: ${val};\n`;
      }
    }

    // Background colors
    css += `\n  /* Backgrounds */\n`;
    for (const [key, val] of Object.entries(theme.colors.background)) {
      css += `  --color-${key}: ${val};\n`;
    }

    // Foreground colors
    css += `\n  /* Foreground / Text */\n`;
    for (const [key, val] of Object.entries(theme.colors.foreground)) {
      css += `  --color-${key}: ${val};\n`;
    }

    // Superlative colors
    if (Object.keys(theme.colors.superlative).length > 0) {
      css += `\n  /* Superlative / Accent */\n`;
      for (const [key, val] of Object.entries(theme.colors.superlative)) {
        css += `  --color-superlative-${key}: ${val};\n`;
      }
    }

    css += `}\n\n`;
  }

  // Add responsive typography
  css += `/* ============================================================================
   RESPONSIVE TYPOGRAPHY
   ============================================================================ */

/* Tablet adjustments */
@media (max-width: 1439px) and (min-width: 744px) {
  :root {
    --grid-columns: var(--grid-columns-tablet);
    --grid-margin: var(--grid-margin-tablet);
    --grid-gutter: var(--grid-gutter-tablet);
  }
}

/* Mobile adjustments */
@media (max-width: 743px) {
  :root {
    --grid-columns: var(--grid-columns-mobile);
    --grid-margin: var(--grid-margin-mobile);
    --grid-gutter: var(--grid-gutter-mobile);
  }
}
`;

  return css;
}

function generateTailwindConfig(themes, typography, breakpoints) {
  const desktopTypo = typography.find(t => t.mode === 'Desktop') || typography[0];
  
  // Build color palette from first theme as default, others as variants
  const colors = {};
  
  // Add semantic color mappings that reference CSS variables
  colors.btn = {
    'primary-bg': 'var(--color-btn-primary-bg)',
    'primary-text': 'var(--color-btn-primary-text)',
    'primary-hover': 'var(--color-btn-primary-hover-bg)',
    'primary-pressed': 'var(--color-btn-primary-pressed-bg)',
    'secondary-bg': 'var(--color-btn-secondary-bg)',
    'secondary-text': 'var(--color-btn-secondary-text)',
    'secondary-border': 'var(--color-btn-secondary-border)',
    'ghost-text': 'var(--color-btn-ghost-text)',
    'ghost-hover': 'var(--color-btn-ghost-hover-bg)',
  };

  colors.bg = {
    'white': 'var(--color-bg-white)',
    'neutral-subtle': 'var(--color-bg-neutral-subtle)',
    'neutral-light': 'var(--color-bg-neutral-light)',
    'neutral': 'var(--color-bg-neutral)',
    'neutral-mid': 'var(--color-bg-neutral-mid)',
    'neutral-strong': 'var(--color-bg-neutral-strong)',
    'accent': 'var(--color-bg-accent)',
    'accent-mid': 'var(--color-bg-accent-mid)',
    'brand-subtle': 'var(--color-bg-brand-subtle)',
    'brand-light': 'var(--color-bg-brand-light)',
    'brand-mid': 'var(--color-bg-brand-mid)',
    'brand': 'var(--color-bg-brand)',
    'header': 'var(--color-bg-header)',
    'table': 'var(--color-bg-table)',
    'secondary': 'var(--color-bg-secondary)',
    'superlative': 'var(--color-bg-superlative)',
  };

  colors.fg = {
    'heading': 'var(--color-fg-heading)',
    'body': 'var(--color-fg-body)',
    'caption': 'var(--color-fg-caption)',
    'link': 'var(--color-fg-link)',
    'link-secondary': 'var(--color-fg-link-secondary)',
    'heading-inverse': 'var(--color-fg-heading-inverse)',
    'body-inverse': 'var(--color-fg-body-inverse)',
    'caption-inverse': 'var(--color-fg-caption-inverse)',
  };

  colors.stroke = {
    'ui': 'var(--color-fg-stroke-ui)',
    'ui-inverse': 'var(--color-fg-stroke-ui-inverse)',
    'default': 'var(--color-fg-stroke-default)',
    'divider': 'var(--color-fg-divider)',
    'inverse': 'var(--color-fg-stroke-inverse)',
  };

  colors.feedback = {
    'error': 'var(--color-fg-feedback-error)',
    'warning': 'var(--color-fg-feedback-warning)',
    'success': 'var(--color-fg-feedback-success)',
  };

  colors.superlative = {
    'primary': 'var(--color-superlative-primary)',
    'secondary': 'var(--color-superlative-secondary)',
  };

  // Build font sizes
  const fontSize = {};
  for (const [key, val] of Object.entries(desktopTypo.fontSize)) {
    fontSize[key] = [`${val}px`, { lineHeight: '1.4' }];
  }

  // Build font families - reference CSS variables for theming
  const fontFamily = {
    'serif': ['var(--font-family-serif)', 'Georgia', 'serif'],
    'sans-serif': ['var(--font-family-sans-serif)', 'system-ui', 'sans-serif'],
    'display': ['var(--font-family-display)', 'Georgia', 'serif'],
    'heading': ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
    'body': ['var(--font-family-body)', 'Georgia', 'serif'],
  };

  // Build screens (breakpoints)
  const screens = {};
  for (const bp of breakpoints) {
    if (bp.mode === 'tablet') {
      screens.tablet = `${bp.breakpoint}px`;
    } else if (bp.mode === 'desktop') {
      screens.desktop = `${bp.breakpoint}px`;
    }
  }

  const config = {
    theme: {
      screens,
      extend: {
        colors,
        fontSize,
        fontFamily,
        fontWeight: {
          light: desktopTypo.fontWeight['font-weight-light'],
          regular: desktopTypo.fontWeight['font-weight-regular'],
          medium: desktopTypo.fontWeight['font-weight-medium'],
          semibold: desktopTypo.fontWeight['font-weight-semibold'],
          bold: desktopTypo.fontWeight['font-weight-bold'],
        },
        lineHeight: Object.fromEntries(
          Object.entries(desktopTypo.lineHeight).map(([k, v]) => [k.replace('line-height-', ''), `${v}px`])
        ),
        letterSpacing: Object.fromEntries(
          Object.entries(desktopTypo.letterSpacing).map(([k, v]) => [k.replace('spacing-', ''), `${v}px`])
        ),
        spacing: {
          'gutter': 'var(--grid-gutter)',
          'margin': 'var(--grid-margin)',
        }
      }
    }
  };

  return `/**
 * Tailwind CSS Configuration
 * Auto-generated from Figma Variables
 * 
 * USAGE FOR AI TOOLS:
 * 1. Import the CSS file first: @import './tokens.css';
 * 2. Add theme class to root: <html class="theme-health-sem">
 * 3. Use semantic classes: bg-bg-brand, text-fg-heading, etc.
 * 
 * AVAILABLE THEMES:
${themes.map(t => ` * - theme-${t.slug}`).join('\n')}
 */

module.exports = ${JSON.stringify(config, null, 2)};
`;
}

function generateTypeScript(themes, typography, breakpoints) {
  const desktopTypo = typography.find(t => t.mode === 'Desktop') || typography[0];

  let ts = `/**
 * Design System TypeScript Definitions
 * Auto-generated from Figma Variables
 * 
 * This file provides type-safe access to design tokens for AI code generation.
 * Import and use these constants to ensure consistent styling.
 */

// ============================================================================
// THEME TYPES
// ============================================================================

/** Available theme identifiers */
export type ThemeSlug = ${themes.map(t => `'${t.slug}'`).join(' | ')};

/** Theme configuration object */
export interface Theme {
  name: string;
  slug: ThemeSlug;
  colors: ThemeColors;
}

export interface ThemeColors {
  button: {
    primary: ButtonColorSet;
    secondary: ButtonColorSet;
    ghost: ButtonColorSet;
  };
  background: Record<string, string>;
  foreground: Record<string, string>;
  superlative: Record<string, string>;
}

export interface ButtonColorSet {
  bg?: string;
  text?: string;
  icon?: string;
  border?: string;
  hoverBg?: string;
  pressedBg?: string;
  disabledBg?: string;
  focusedBorder?: string;
}

// ============================================================================
// THEMES DATA
// ============================================================================

export const themes: Record<ThemeSlug, Theme> = {
${themes.map(t => `  '${t.slug}': ${JSON.stringify(t, null, 4).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}`).join(',\n')}
};

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/** Font family tokens */
export const fontFamily = ${JSON.stringify(desktopTypo.fontFamily, null, 2)} as const;

/** Font size tokens (in pixels) */
export const fontSize = ${JSON.stringify(desktopTypo.fontSize, null, 2)} as const;

/** Font weight tokens */
export const fontWeight = ${JSON.stringify(desktopTypo.fontWeight, null, 2)} as const;

/** Line height tokens (in pixels) */
export const lineHeight = ${JSON.stringify(desktopTypo.lineHeight, null, 2)} as const;

/** Letter spacing tokens (in pixels) */
export const letterSpacing = ${JSON.stringify(desktopTypo.letterSpacing, null, 2)} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
${breakpoints.map(bp => `  ${bp.mode}: {
    width: ${bp.breakpoint},
    columns: ${bp.columns},
    margin: ${bp.margin},
    gutter: ${bp.gutter}
  }`).join(',\n')}
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get CSS variable reference for a token
 * @example getCSSVar('bg-brand') => 'var(--color-bg-brand)'
 */
export function getCSSVar(token: string): string {
  return \`var(--color-\${token})\`;
}

/**
 * Apply theme class to document root
 * @example setTheme('health-sem')
 */
export function setTheme(theme: ThemeSlug): void {
  if (typeof document !== 'undefined') {
    document.documentElement.className = \`theme-\${theme}\`;
    document.documentElement.dataset.theme = theme;
  }
}

/**
 * Get current theme from document
 */
export function getCurrentTheme(): ThemeSlug | null {
  if (typeof document !== 'undefined') {
    return (document.documentElement.dataset.theme as ThemeSlug) || null;
  }
  return null;
}
`;

  return ts;
}

function generateLLMSText(themes, typography, breakpoints) {
  const desktopTypo = typography.find(t => t.mode === 'Desktop') || typography[0];

  return `# Design System Documentation for AI Assistants

> This file helps AI coding assistants (Cursor, Copilot, Bolt, Lovable) understand 
> and correctly use this design system. Read this before generating any UI code.

## Quick Start

1. Import the CSS: \`@import '@your-org/design-system/dist/tokens.css';\`
2. Add theme to HTML: \`<html class="theme-health-sem">\`
3. Use semantic CSS variables: \`color: var(--color-fg-heading);\`

## Available Themes

${themes.map(t => `- \`theme-${t.slug}\` - ${t.name}`).join('\n')}

## Color System

### When to use each color:

**Backgrounds (--color-bg-*)**
- \`bg-white\` - Default page background
- \`bg-neutral-subtle\` - Subtle section differentiation
- \`bg-neutral-light\` - Card backgrounds, input fields
- \`bg-brand\` - Brand-colored sections, CTAs
- \`bg-header\` - Navigation header background
- \`bg-table\` - Table backgrounds

**Text/Foreground (--color-fg-*)**
- \`fg-heading\` - All headings (h1-h6)
- \`fg-body\` - Paragraph text, default content
- \`fg-caption\` - Secondary text, timestamps, metadata
- \`fg-link\` - Clickable links
- \`fg-heading-inverse\` - Headings on dark backgrounds
- \`fg-body-inverse\` - Body text on dark backgrounds

**Buttons (--color-btn-*)**
- Primary buttons: \`btn-primary-bg\`, \`btn-primary-text\`, \`btn-primary-hover-bg\`
- Secondary buttons: \`btn-secondary-bg\`, \`btn-secondary-border\`, \`btn-secondary-text\`
- Ghost buttons: \`btn-ghost-text\`, \`btn-ghost-hover-bg\`

**Feedback States**
- \`fg-feedback-error\` (#EB4015) - Error messages, destructive actions
- \`fg-feedback-warning\` (#FFB136) - Warnings, cautions
- \`fg-feedback-success\` (#0C7663) - Success states, confirmations

## Typography

### Font Families
${Object.entries(desktopTypo.fontFamily).map(([k, v]) => `- \`--font-family-${k}\`: ${v}`).join('\n')}

### Font Sizes (use for consistent hierarchy)
- Display: ${desktopTypo.fontSize['display'] || 56}px - Hero headlines only
- Heading LG: ${desktopTypo.fontSize['heading-lg'] || 48}px - Page titles
- Heading MD: ${desktopTypo.fontSize['heading-md'] || 32}px - Section headers
- Heading SM: ${desktopTypo.fontSize['heading-sm'] || 24}px - Card titles
- Title LG: ${desktopTypo.fontSize['title-lg'] || 20}px - Emphasized content
- Title MD: ${desktopTypo.fontSize['title-md'] || 18}px - Subtitles
- Body LG: ${desktopTypo.fontSize['body-lg'] || 18}px - Lead paragraphs
- Body MD: ${desktopTypo.fontSize['body-md'] || 16}px - Default body text
- Body SM: ${desktopTypo.fontSize['body-sm'] || 14}px - Secondary content
- Label: ${desktopTypo.fontSize['label-md'] || 14}px - Form labels, buttons

### Font Weights
- Light: 300
- Regular: 400 - Body text
- Medium: 500 - Emphasis
- Semibold: 600 - Buttons, labels
- Bold: 700 - Headings

## Responsive Breakpoints

| Device  | Min Width | Columns | Margin | Gutter |
|---------|-----------|---------|--------|--------|
${breakpoints.map(bp => `| ${bp.mode.charAt(0).toUpperCase() + bp.mode.slice(1)} | ${bp.breakpoint}px | ${bp.columns} | ${bp.margin}px | ${bp.gutter}px |`).join('\n')}

## Code Examples

### React Component with Theme
\`\`\`jsx
import '@your-org/design-system/dist/tokens.css';

function Card({ title, children }) {
  return (
    <div style={{ 
      background: 'var(--color-bg-neutral-light)',
      padding: 'var(--grid-gutter)'
    }}>
      <h3 style={{ 
        color: 'var(--color-fg-heading)',
        fontSize: 'var(--font-size-heading-sm)'
      }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-fg-body)' }}>
        {children}
      </p>
    </div>
  );
}
\`\`\`

### Tailwind Classes
\`\`\`html
<button class="bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover rounded-md px-4 py-2">
  Primary Action
</button>

<div class="bg-bg-neutral-light text-fg-body p-gutter">
  Card content
</div>
\`\`\`

## DO's and DON'Ts

✅ DO:
- Use semantic color tokens (fg-heading, bg-brand) not raw hex values
- Apply theme class to root element
- Use responsive grid tokens for layout
- Reference CSS variables for theme-ability

❌ DON'T:
- Hardcode colors like #657E79 directly
- Mix tokens from different themes
- Ignore the typography scale
- Use arbitrary spacing values

## File Structure

\`\`\`
dist/
├── tokens.css          # All CSS custom properties
├── tailwind.config.js  # Tailwind theme extension
├── tokens.ts           # TypeScript constants & types
└── tokens.json         # Raw token data
\`\`\`
`;
}

function generateJSON(themes, typography, breakpoints) {
  return JSON.stringify({
    $schema: "https://design-tokens.org/schema.json",
    themes,
    typography: typography.find(t => t.mode === 'Desktop') || typography[0],
    breakpoints: Object.fromEntries(breakpoints.map(bp => [bp.mode, bp]))
  }, null, 2);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🎨 Transforming Figma tokens...\n');

  ensureDir(OUTPUT_DIR);
  ensureDir(DOCS_DIR);

  // Parse all theme files
  const themes = [];
  const themesDir = path.join(INPUT_DIR, 'themes');
  
  function walkThemes(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        walkThemes(itemPath);
      } else if (item.endsWith('.json')) {
        themes.push(parseThemeTokens(itemPath));
      }
    }
  }
  walkThemes(themesDir);
  console.log(`✓ Parsed ${themes.length} themes`);

  // Parse typography tokens (all modes)
  const typography = [];
  const typoDir = path.join(INPUT_DIR, 'typography');
  for (const file of fs.readdirSync(typoDir)) {
    if (file.endsWith('.json')) {
      typography.push(parseTypographyTokens(path.join(typoDir, file)));
    }
  }
  console.log(`✓ Parsed typography (${typography.length} modes)`);

  // Parse breakpoint tokens
  const breakpoints = [];
  const bpDir = path.join(INPUT_DIR, 'breakpoints');
  for (const file of fs.readdirSync(bpDir)) {
    if (file.endsWith('.json')) {
      breakpoints.push(parseBreakpointTokens(path.join(bpDir, file)));
    }
  }
  // Sort breakpoints by size
  breakpoints.sort((a, b) => a.breakpoint - b.breakpoint);
  console.log(`✓ Parsed breakpoints (${breakpoints.length} modes)`);

  // Generate outputs
  console.log('\n📦 Generating outputs...');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tokens.css'), generateCSS(themes, typography, breakpoints));
  console.log('  ✓ tokens.css');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tailwind.config.js'), generateTailwindConfig(themes, typography, breakpoints));
  console.log('  ✓ tailwind.config.js');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tokens.ts'), generateTypeScript(themes, typography, breakpoints));
  console.log('  ✓ tokens.ts');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tokens.json'), generateJSON(themes, typography, breakpoints));
  console.log('  ✓ tokens.json');

  fs.writeFileSync(path.join(DOCS_DIR, 'LLMS.txt'), generateLLMSText(themes, typography, breakpoints));
  console.log('  ✓ docs/LLMS.txt');

  // Copy LLMS.txt to root for visibility
  fs.copyFileSync(path.join(DOCS_DIR, 'LLMS.txt'), path.join(OUTPUT_DIR, '..', 'LLMS.txt'));
  console.log('  ✓ LLMS.txt (root)');

  console.log('\n✅ Done! Token transformation complete.');
}

main().catch(console.error);
