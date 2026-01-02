import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * Generate the components index file content
 * @param {Array} components - Array of component objects
 * @returns {string} - Index file content with exports
 */
export function generateComponentsIndex(components) {
  return components
    .map(c => `export { ${c.name} } from './${c.name}';`)
    .join('\n')
}

/**
 * Generate LLMS.txt content - AI-friendly documentation
 * @param {Array} components - Array of component objects
 * @param {string} packageName - NPM package name
 * @returns {string} - LLMS.txt content
 */
export function generateLLMSTxt(components, packageName = '@yourorg/design-system') {
  const published = components.filter(c => c.status === 'published' && c.jsx_code)
  
  return `# ${packageName} - AI Assistant Guide

## Quick Start

\`\`\`bash
npm install ${packageName}
\`\`\`

\`\`\`jsx
import '${packageName}/dist/tokens.css';
import { ${published.map(c => c.name).join(', ')} } from '${packageName}';
\`\`\`

## Available Components

${published.map(c => `
### ${c.name}

${c.description || 'No description'}

**Import:** \`import { ${c.name} } from '${packageName}';\`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${(c.props || []).map(p => `| ${p.name} | \`${p.type}\` | \`${p.default || '-'}\` | ${p.description || '-'} |`).join('\n')}

**Variants:** ${c.variants?.map(v => typeof v === 'string' ? v : v.name).join(', ') || 'None'}

**Example:**
\`\`\`jsx
<${c.name} variant="primary">${c.name === 'Button' ? 'Click me' : 'Content'}</${c.name}>
\`\`\`
`).join('\n')}

## Design Tokens

### Colors
- Backgrounds: \`var(--color-bg-white)\`, \`var(--color-bg-neutral-light)\`
- Text: \`var(--color-fg-heading)\`, \`var(--color-fg-body)\`
- Buttons: \`var(--color-btn-primary-bg)\`, \`var(--color-btn-primary-text)\`

### Typography
- Sizes: \`var(--font-size-heading-lg)\`, \`var(--font-size-body-md)\`
- Weights: \`var(--font-weight-bold)\`, \`var(--font-weight-regular)\`

## Themes

Available:
- \`theme-health-sem\`
- \`theme-home-sem\`
- \`theme-llm\`
- \`theme-forbes-media-seo\`
- \`theme-advisor-sem-compare-coverage\`

Apply: \`<html class="theme-health-sem">\`

## Rules for AI

✅ DO:
- Use components from this package
- Use CSS variables for styling
- Apply theme class to root element

❌ DON'T:
- Recreate existing components
- Hardcode colors
- Mix tokens from different themes

## Component Checklist

${published.map(c => `- [x] ${c.name}`).join('\n')}
`
}

/**
 * Generate package.json content
 * @param {string} packageName - NPM package name
 * @param {string} version - Package version
 * @returns {string} - Stringified package.json
 */
export function generatePackageJson(packageName, version) {
  return JSON.stringify({
    name: packageName,
    version,
    main: 'dist/components/index.js',
    module: 'dist/components/index.js',
    types: 'dist/components/index.d.ts',
    exports: {
      '.': {
        import: './dist/components/index.js',
        require: './dist/components/index.js'
      },
      './tokens.css': './dist/tokens/tokens.css',
      './tokens.json': './dist/tokens/tokens.json'
    },
    files: [
      'dist'
    ],
    peerDependencies: {
      react: '>=17.0.0',
      'react-dom': '>=17.0.0'
    },
    keywords: ['design-system', 'react', 'components', 'tokens'],
    license: 'MIT'
  }, null, 2)
}

/**
 * Generate tokens.css content with all theme variables
 * @returns {string} - CSS content with token variables
 */
export function generateTokensCSS() {
  return `/* Design System Tokens */
/* Auto-generated - Do not edit manually */

:root {
  /* Colors - Backgrounds */
  --color-bg-white: #FFFFFF;
  --color-bg-neutral-light: #F5F5F5;
  --color-bg-neutral-medium: #E0E0E0;
  
  /* Colors - Foreground */
  --color-fg-heading: #1A1A1A;
  --color-fg-body: #4A4A4A;
  --color-fg-caption: #757575;
  
  /* Colors - Feedback */
  --color-fg-feedback-error: #DC2626;
  --color-fg-feedback-warning: #F59E0B;
  --color-fg-feedback-success: #059669;
  
  /* Typography */
  --font-size-heading-lg: 32px;
  --font-size-heading-md: 24px;
  --font-size-heading-sm: 20px;
  --font-size-body-lg: 18px;
  --font-size-body-md: 16px;
  --font-size-body-sm: 14px;
  --font-size-caption: 12px;
  
  --font-weight-bold: 700;
  --font-weight-semibold: 600;
  --font-weight-regular: 400;
  
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-serif: 'Georgia', serif;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;
  --border-default: 1px solid #E0E0E0;
}

/* Theme: Health SEM */
.theme-health-sem {
  --color-btn-primary-bg: #657E79;
  --color-btn-primary-hover: #546B66;
  --color-btn-primary-text: #FFFFFF;
  --color-btn-secondary-bg: transparent;
  --color-btn-secondary-text: #657E79;
  --color-btn-ghost-hover: rgba(101, 126, 121, 0.1);
  --color-btn-ghost-text: #657E79;
  --color-accent: #657E79;
}

/* Theme: Home SEM */
.theme-home-sem {
  --color-btn-primary-bg: #2563EB;
  --color-btn-primary-hover: #1D4ED8;
  --color-btn-primary-text: #FFFFFF;
  --color-btn-secondary-bg: transparent;
  --color-btn-secondary-text: #2563EB;
  --color-btn-ghost-hover: rgba(37, 99, 235, 0.1);
  --color-btn-ghost-text: #2563EB;
  --color-accent: #2563EB;
}

/* Theme: LLM */
.theme-llm {
  --color-btn-primary-bg: #007AC8;
  --color-btn-primary-hover: #0066A8;
  --color-btn-primary-text: #FFFFFF;
  --color-btn-secondary-bg: transparent;
  --color-btn-secondary-text: #007AC8;
  --color-btn-ghost-hover: rgba(0, 122, 200, 0.1);
  --color-btn-ghost-text: #007AC8;
  --color-accent: #007AC8;
}

/* Theme: Forbes Media SEO */
.theme-forbes-media-seo {
  --color-btn-primary-bg: #1A1A1A;
  --color-btn-primary-hover: #333333;
  --color-btn-primary-text: #FFFFFF;
  --color-btn-secondary-bg: transparent;
  --color-btn-secondary-text: #1A1A1A;
  --color-btn-ghost-hover: rgba(26, 26, 26, 0.1);
  --color-btn-ghost-text: #1A1A1A;
  --color-accent: #1A1A1A;
}

/* Theme: Compare Coverage */
.theme-advisor-sem-compare-coverage {
  --color-btn-primary-bg: #059669;
  --color-btn-primary-hover: #047857;
  --color-btn-primary-text: #FFFFFF;
  --color-btn-secondary-bg: transparent;
  --color-btn-secondary-text: #059669;
  --color-btn-ghost-hover: rgba(5, 150, 105, 0.1);
  --color-btn-ghost-text: #059669;
  --color-accent: #059669;
}
`
}

/**
 * Generate tokens.json content
 * @returns {string} - Stringified tokens JSON
 */
export function generateTokensJSON() {
  return JSON.stringify({
    colors: {
      bg: {
        white: '#FFFFFF',
        'neutral-light': '#F5F5F5',
        'neutral-medium': '#E0E0E0'
      },
      fg: {
        heading: '#1A1A1A',
        body: '#4A4A4A',
        caption: '#757575'
      },
      feedback: {
        error: '#DC2626',
        warning: '#F59E0B',
        success: '#059669'
      }
    },
    typography: {
      fontSize: {
        'heading-lg': '32px',
        'heading-md': '24px',
        'heading-sm': '20px',
        'body-lg': '18px',
        'body-md': '16px',
        'body-sm': '14px',
        caption: '12px'
      },
      fontWeight: {
        bold: 700,
        semibold: 600,
        regular: 400
      }
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    }
  }, null, 2)
}

/**
 * Generate TypeScript types for tokens
 * @returns {string} - TypeScript type definitions
 */
export function generateTokensTS() {
  return `// Design System Token Types
// Auto-generated - Do not edit manually

export interface ColorTokens {
  bg: {
    white: string;
    'neutral-light': string;
    'neutral-medium': string;
  };
  fg: {
    heading: string;
    body: string;
    caption: string;
  };
  feedback: {
    error: string;
    warning: string;
    success: string;
  };
}

export interface TypographyTokens {
  fontSize: {
    'heading-lg': string;
    'heading-md': string;
    'heading-sm': string;
    'body-lg': string;
    'body-md': string;
    'body-sm': string;
    caption: string;
  };
  fontWeight: {
    bold: number;
    semibold: number;
    regular: number;
  };
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
}

export type Theme = 
  | 'theme-health-sem'
  | 'theme-home-sem'
  | 'theme-llm'
  | 'theme-forbes-media-seo'
  | 'theme-advisor-sem-compare-coverage';
`
}

/**
 * Download the complete design system package as a zip file
 * @param {Array} components - Array of component objects
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result with component count
 */
export async function downloadPackage(components, options = {}) {
  const { packageName = '@yourorg/design-system', version = '1.0.0' } = options
  const published = components.filter(c => c.status === 'published' && c.jsx_code)

  const zip = new JSZip()
  
  // Root files
  zip.file('package.json', generatePackageJson(packageName, version))
  zip.file('LLMS.txt', generateLLMSTxt(components, packageName))
  zip.file('README.md', generateReadme(packageName, published))
  
  // Tokens
  zip.file('dist/tokens/tokens.css', generateTokensCSS())
  zip.file('dist/tokens/tokens.json', generateTokensJSON())
  zip.file('dist/tokens/tokens.ts', generateTokensTS())
  
  // Components
  for (const c of published) {
    zip.file(`dist/components/${c.name}/${c.name}.jsx`, c.jsx_code)
    zip.file(`dist/components/${c.name}/index.js`, `export { ${c.name} } from './${c.name}';`)
  }
  
  // Components index
  zip.file('dist/components/index.js', generateComponentsIndex(published))

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${packageName.replace('@', '').replace('/', '-')}-${version}.zip`)
  
  return { componentCount: published.length }
}

/**
 * Generate README.md content
 * @param {string} packageName - NPM package name
 * @param {Array} components - Array of published components
 * @returns {string} - README content
 */
function generateReadme(packageName, components) {
  return `# ${packageName}

A design system with ${components.length} React components and design tokens.

## Installation

\`\`\`bash
npm install ${packageName}
\`\`\`

## Usage

\`\`\`jsx
// Import tokens CSS
import '${packageName}/dist/tokens/tokens.css';

// Import components
import { ${components.map(c => c.name).join(', ')} } from '${packageName}';

// Apply theme to root
<html className="theme-health-sem">
  <App />
</html>
\`\`\`

## Components

${components.map(c => `- **${c.name}**: ${c.description || 'No description'}`).join('\n')}

## Themes

- \`theme-health-sem\`
- \`theme-home-sem\`
- \`theme-llm\`
- \`theme-forbes-media-seo\`
- \`theme-advisor-sem-compare-coverage\`

## License

MIT
`
}



