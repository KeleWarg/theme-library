/**
 * Token Data Helper
 * Provides organized access to design system tokens
 * 
 * Token paths from Figma are transformed to CSS variables:
 * - "Color.Button.Primary.primary-bg" → "--color-btn-primary-bg"
 * - "Color.Background.bg-white" → "--color-bg-white"
 * - "Font Size.heading-lg" → "--font-size-heading-lg"
 */

// Theme definitions - matches CSS classes in tokens.css
export const themes = [
  { name: 'Health SEM', slug: 'theme-health---sem' },
  { name: 'Home SEM', slug: 'theme-home---sem' },
  { name: 'LLM', slug: 'theme-llm' },
  { name: 'ForbesMedia SEO', slug: 'theme-forbesmedia---seo' },
  { name: 'Compare Coverage', slug: 'theme-advisor-sem/compare-coverage' },
];

// Color tokens organized by category
// Based on Health_-_SEM_tokens.json structure
export const colorTokens = {
  backgrounds: [
    { name: 'bg-white', variable: '--color-bg-white', description: 'Primary background' },
    { name: 'bg-neutral-subtle', variable: '--color-bg-neutral-subtle', description: 'Subtle neutral background' },
    { name: 'bg-neutral-light', variable: '--color-bg-neutral-light', description: 'Light neutral background' },
    { name: 'bg-neutral', variable: '--color-bg-neutral', description: 'Default neutral background' },
    { name: 'bg-neutral-mid', variable: '--color-bg-neutral-mid', description: 'Mid neutral background' },
    { name: 'bg-neutral-strong', variable: '--color-bg-neutral-strong', description: 'Strong neutral background' },
    { name: 'bg-brand-subtle', variable: '--color-bg-brand-subtle', description: 'Subtle brand background' },
    { name: 'bg-brand-light', variable: '--color-bg-brand-light', description: 'Light brand background' },
    { name: 'bg-brand-mid', variable: '--color-bg-brand-mid', description: 'Mid brand background' },
    { name: 'bg-brand', variable: '--color-bg-brand', description: 'Primary brand background' },
    { name: 'bg-accent', variable: '--color-bg-accent', description: 'Accent background' },
    { name: 'bg-accent-mid', variable: '--color-bg-accent-mid', description: 'Mid accent background' },
    { name: 'bg-secondary', variable: '--color-bg-secondary', description: 'Secondary background' },
    { name: 'bg-table', variable: '--color-bg-table', description: 'Table row background' },
    { name: 'bg-header', variable: '--color-bg-header', description: 'Header background' },
    { name: 'bg-button', variable: '--color-bg-button', description: 'Button background' },
    { name: 'bg-superlative', variable: '--color-bg-superlative', description: 'Superlative/highlight background' },
  ],
  foregrounds: [
    { name: 'fg-heading', variable: '--color-fg-heading', description: 'Heading text color' },
    { name: 'fg-body', variable: '--color-fg-body', description: 'Body text color' },
    { name: 'fg-caption', variable: '--color-fg-caption', description: 'Caption/muted text color' },
    { name: 'fg-link', variable: '--color-fg-link', description: 'Link text color' },
    { name: 'fg-link-secondary', variable: '--color-fg-link-secondary', description: 'Secondary link text color' },
    { name: 'fg-heading-inverse', variable: '--color-fg-heading-inverse', description: 'Inverse heading text' },
    { name: 'fg-body-inverse', variable: '--color-fg-body-inverse', description: 'Inverse body text' },
    { name: 'fg-caption-inverse', variable: '--color-fg-caption-inverse', description: 'Inverse caption text' },
    { name: 'fg-divider', variable: '--color-fg-divider', description: 'Divider/separator color' },
    { name: 'fg-stroke-default', variable: '--color-fg-stroke-default', description: 'Default stroke color' },
    { name: 'fg-stroke-ui', variable: '--color-fg-stroke-ui', description: 'UI stroke color' },
    { name: 'fg-stroke-ui-inverse', variable: '--color-fg-stroke-ui-inverse', description: 'Inverse UI stroke' },
    { name: 'fg-stroke-inverse', variable: '--color-fg-stroke-inverse', description: 'Inverse stroke color' },
    { name: 'fg-table-border', variable: '--color-fg-table-border', description: 'Table border color' },
  ],
  buttons: {
    primary: [
      { name: 'btn-primary-bg', variable: '--color-btn-primary-bg', description: 'Primary button background' },
      { name: 'btn-primary-text', variable: '--color-btn-primary-text', description: 'Primary button text' },
      { name: 'btn-primary-icon', variable: '--color-btn-primary-icon', description: 'Primary button icon' },
      { name: 'btn-primary-hover-bg', variable: '--color-btn-primary-hover-bg', description: 'Primary button hover' },
      { name: 'btn-primary-pressed-bg', variable: '--color-btn-primary-pressed-bg', description: 'Primary button pressed' },
      { name: 'btn-primary-disabled-bg', variable: '--color-btn-primary-disabled-bg', description: 'Primary button disabled' },
      { name: 'btn-focused-border', variable: '--color-btn-focused-border', description: 'Button focus ring' },
    ],
    secondary: [
      { name: 'btn-secondary-bg', variable: '--color-btn-secondary-bg', description: 'Secondary button background' },
      { name: 'btn-secondary-text', variable: '--color-btn-secondary-text', description: 'Secondary button text' },
      { name: 'btn-secondary-icon', variable: '--color-btn-secondary-icon', description: 'Secondary button icon' },
      { name: 'btn-secondary-border', variable: '--color-btn-secondary-border', description: 'Secondary button border' },
      { name: 'btn-secondary-hover-bg', variable: '--color-btn-secondary-hover-bg', description: 'Secondary button hover' },
      { name: 'btn-secondary-pressed-bg', variable: '--color-btn-secondary-pressed-bg', description: 'Secondary button pressed' },
      { name: 'btn-secondary-disabled-bg', variable: '--color-btn-secondary-disabled-bg', description: 'Secondary button disabled' },
    ],
    ghost: [
      { name: 'btn-ghost-bg', variable: '--color-btn-ghost-bg', description: 'Ghost button background' },
      { name: 'btn-ghost-text', variable: '--color-btn-ghost-text', description: 'Ghost button text' },
      { name: 'btn-ghost-icon', variable: '--color-btn-ghost-icon', description: 'Ghost button icon' },
      { name: 'btn-ghost-hover-bg', variable: '--color-btn-ghost-hover-bg', description: 'Ghost button hover' },
      { name: 'btn-ghost-pressed-bg', variable: '--color-btn-ghost-pressed-bg', description: 'Ghost button pressed' },
      { name: 'btn-ghost-disabled-bg', variable: '--color-btn-ghost-disabled-bg', description: 'Ghost button disabled' },
    ],
  },
  feedback: [
    { name: 'feedback-error', variable: '--color-fg-feedback-error', description: 'Error state' },
    { name: 'feedback-warning', variable: '--color-fg-feedback-warning', description: 'Warning state' },
    { name: 'feedback-success', variable: '--color-fg-feedback-success', description: 'Success state' },
  ],
  superlative: [
    { name: 'superlative-primary', variable: '--color-superlative-primary', description: 'Superlative primary' },
    { name: 'superlative-secondary', variable: '--color-superlative-secondary', description: 'Superlative secondary' },
  ],
};

// Font Family tokens by theme - from Desktop_tokens.json "Font Family" section
export const fontFamilyTokens = {
  // SEM themes: Health, Home, Compare Coverage
  // Only 2 fonts defined: serif (Georgia) and sans-serif (Euclid Circular B)
  sem: [
    {
      name: 'font-family-serif',
      variable: '--font-family-serif',
      value: 'Georgia',
      fallback: 'Georgia',
      description: 'Serif font for display (56px) and body text'
    },
    {
      name: 'font-family-sans-serif',
      variable: '--font-family-sans-serif',
      value: 'Euclid Circular B',
      fallback: 'Euclid Circular B',
      description: 'Sans-serif font for headings and labels'
    },
  ],
  // ForbesMedia SEO + LLM themes
  forbesMedia: [
    {
      name: 'font-family-display',
      variable: '--font-family-display',
      value: 'Schnyder S',
      fallback: 'Schnyder S',
      description: 'Display font for 56px display size ONLY'
    },
    {
      name: 'font-family-heading',
      variable: '--font-family-heading',
      value: 'Work Sans',
      fallback: 'Work Sans',
      description: 'Font for headings (heading-lg, heading-md, heading-sm)'
    },
    {
      name: 'font-family-body',
      variable: '--font-family-body',
      value: 'Work Sans',
      fallback: 'Work Sans',
      description: 'Font for body text (body-lg, body-md, body-sm)'
    },
    {
      name: 'font-family-sans-serif',
      variable: '--font-family-sans-serif',
      value: 'Work Sans',
      fallback: 'Work Sans',
      description: 'Font for labels and UI elements'
    },
  ],
};

// Map theme slugs to font family sets
export const themeFontMap = {
  // SEM themes (Health, Home, Compare Coverage)
  'theme-health---sem': 'sem',
  'theme-health-sem': 'sem',
  'theme-home---sem': 'sem',
  'theme-home-sem': 'sem',
  'theme-advisor-sem-compare-coverage': 'sem',
  'theme-advisor-sem/compare-coverage': 'sem',
  // SEO/LLM themes (ForbesMedia SEO, LLM)
  'theme-llm': 'forbesMedia',
  'theme-forbesmedia---seo': 'forbesMedia',
  'theme-forbesmedia-seo': 'forbesMedia',
  'theme-forbes-media---seo': 'forbesMedia',
  'theme-forbes-media-seo': 'forbesMedia',
};

/**
 * Get font family tokens for a specific theme
 * @param {string} themeSlug - The theme slug (e.g., 'theme-health---sem')
 * @returns {Array} - Array of font family token objects
 */
export function getFontFamiliesForTheme(themeSlug) {
  const fontSetKey = themeFontMap[themeSlug] || 'sem';
  return fontFamilyTokens[fontSetKey] || fontFamilyTokens.sem;
}

/**
 * Check if theme slug is a SEM theme
 * @param {string} themeSlug - The theme slug
 * @returns {boolean}
 */
export function isSEMTheme(themeSlug) {
  return themeSlug.includes('health') ||
         themeSlug.includes('home') ||
         themeSlug.includes('compare-coverage');
}

/**
 * Get the primary font families for a theme organized by use case
 * Returns CSS variable references for dynamic theming
 * @param {string} themeSlug - The theme slug
 * @returns {Object} - Object with font family CSS variable references
 */
export function getThemeFonts(themeSlug) {
  if (isSEMTheme(themeSlug)) {
    // SEM themes: only serif and sans-serif
    return {
      // display (56px) → Georgia (serif)
      display: 'var(--font-family-serif)',
      // heading-lg, heading-md, heading-sm → Euclid Circular B (sans-serif)
      heading: 'var(--font-family-sans-serif)',
      // body-lg, body-md, body-sm → Georgia (serif)
      body: 'var(--font-family-serif)',
      // label, title tokens → Euclid Circular B (sans-serif)
      sansSerif: 'var(--font-family-sans-serif)',
    };
  }

  // ForbesMedia SEO + LLM themes
  return {
    // display (56px) ONLY → Schnyder S
    display: 'var(--font-family-display)',
    // heading-lg, heading-md, heading-sm → Work Sans
    heading: 'var(--font-family-heading)',
    // body-lg, body-md, body-sm → Work Sans
    body: 'var(--font-family-body)',
    // label, title tokens → Work Sans
    sansSerif: 'var(--font-family-sans-serif)',
  };
}

/**
 * Get the appropriate font family for a specific font size token
 * Uses different logic for SEM vs SEO/LLM themes:
 *
 * SEM themes (Health, Home, Compare Coverage):
 *   - display, body → serif (Georgia)
 *   - heading, label, title → sans-serif (Euclid Circular B)
 *
 * SEO/LLM themes (ForbesMedia SEO, LLM):
 *   - display → display font (Schnyder S)
 *   - heading, body, label, title → body font (Work Sans)
 *
 * @param {string} tokenName - The token name (e.g., 'heading-lg', 'body-md', 'label-sm')
 * @param {Object} themeFonts - The theme fonts object from getThemeFonts()
 * @param {string} themeSlug - Optional theme slug to determine theme type
 * @returns {string} - The font family CSS variable to use
 */
export function getFontFamilyForToken(tokenName, themeFonts, themeSlug = '') {
  // Check if this is a SEM theme based on themeFonts structure
  // SEM themes use var(--font-family-serif) for display
  const isSEM = themeFonts.display === 'var(--font-family-serif)' ||
                (themeSlug && isSEMTheme(themeSlug));

  if (isSEM) {
    // SEM: serif for display/body, sans-serif for headings/labels
    if (tokenName === 'display' || tokenName.startsWith('body')) {
      return themeFonts.display; // serif
    }
    return themeFonts.sansSerif; // sans-serif for heading, label, title
  }

  // SEO/LLM: Schnyder for display only, Work Sans for everything else
  if (tokenName === 'display') {
    return themeFonts.display; // Schnyder S
  }
  return themeFonts.body; // Work Sans for heading, body, label, title
}

// Typography tokens - based on Desktop.tokens.json
export const typographyTokens = {
  fontSizes: [
    { name: 'display', variable: '--font-size-display', value: '56px' },
    { name: 'heading-lg', variable: '--font-size-heading-lg', value: '48px' },
    { name: 'heading-md', variable: '--font-size-heading-md', value: '32px' },
    { name: 'heading-sm', variable: '--font-size-heading-sm', value: '24px' },
    { name: 'title-lg', variable: '--font-size-title-lg', value: '20px' },
    { name: 'title-md', variable: '--font-size-title-md', value: '18px' },
    { name: 'title-sm', variable: '--font-size-title-sm', value: '16px' },
    { name: 'title-xs', variable: '--font-size-title-xs', value: '14px' },
    { name: 'body-lg', variable: '--font-size-body-lg', value: '18px' },
    { name: 'body-md', variable: '--font-size-body-md', value: '16px' },
    { name: 'body-sm', variable: '--font-size-body-sm', value: '14px' },
    { name: 'body-xs', variable: '--font-size-body-xs', value: '12px' },
    { name: 'label-lg', variable: '--font-size-label-lg', value: '16px' },
    { name: 'label-md', variable: '--font-size-label-md', value: '14px' },
    { name: 'label-sm', variable: '--font-size-label-sm', value: '12px' },
    { name: 'label-xs', variable: '--font-size-label-xs', value: '10px' },
  ],
  fontWeights: [
    { name: 'bold', variable: '--font-weight-bold', value: '700' },
    { name: 'semibold', variable: '--font-weight-semibold', value: '600' },
    { name: 'medium', variable: '--font-weight-medium', value: '500' },
    { name: 'regular', variable: '--font-weight-regular', value: '400' },
    { name: 'light', variable: '--font-weight-light', value: '300' },
  ],
  lineHeights: [
    { name: 'line-height-5xl', variable: '--line-height-5xl', value: '68px' },
    { name: 'line-height-4xl', variable: '--line-height-4xl', value: '58px' },
    { name: 'line-height-3xl', variable: '--line-height-3xl', value: '40px' },
    { name: 'line-height-2xl', variable: '--line-height-2xl', value: '32px' },
    { name: 'line-height-xl', variable: '--line-height-xl', value: '26px' },
    { name: 'line-height-lg', variable: '--line-height-lg', value: '24px' },
    { name: 'line-height-md', variable: '--line-height-md', value: '22px' },
    { name: 'line-height-sm', variable: '--line-height-sm', value: '20px' },
    { name: 'line-height-xs', variable: '--line-height-xs', value: '18px' },
    { name: 'line-height-2xs', variable: '--line-height-2xs', value: '16px' },
  ],
  letterSpacing: [
    { name: 'tighter', variable: '--letter-spacing-tighter', value: '-0.2px' },
    { name: 'tight', variable: '--letter-spacing-tight', value: '-0.1px' },
    { name: 'normal', variable: '--letter-spacing-normal', value: '0px' },
    { name: 'wide', variable: '--letter-spacing-wide', value: '0.5px' },
    { name: 'wider', variable: '--letter-spacing-wider', value: '1px' },
  ],
};

// Spacing tokens - from Value_tokens.json
export const spacingTokens = [
  { name: 'spacing-2xs', variable: '--spacing-2xs', value: '2px' },
  { name: 'spacing-xs', variable: '--spacing-xs', value: '4px' },
  { name: 'spacing-sm', variable: '--spacing-sm', value: '8px' },
  { name: 'spacing-md', variable: '--spacing-md', value: '12px' },
  { name: 'spacing-lg', variable: '--spacing-lg', value: '16px' },
  { name: 'spacing-xl', variable: '--spacing-xl', value: '24px' },
  { name: 'spacing-2xl', variable: '--spacing-2xl', value: '32px' },
  { name: 'spacing-3xl', variable: '--spacing-3xl', value: '40px' },
  { name: 'spacing-4xl', variable: '--spacing-4xl', value: '48px' },
];

// Radius tokens - from Value_tokens.json
export const radiusTokens = [
  { name: 'radius-none', variable: '--radius-none', value: '0px' },
  { name: 'radius-xs', variable: '--radius-xs', value: '4px' },
  { name: 'radius-sm', variable: '--radius-sm', value: '8px' },
  { name: 'radius-md', variable: '--radius-md', value: '12px' },
  { name: 'radius-lg', variable: '--radius-lg', value: '16px' },
  { name: 'radius-xl', variable: '--radius-xl', value: '24px' },
];

// Border width tokens - from Value_tokens.json
export const borderWidthTokens = [
  { name: 'border-width-none', variable: '--border-width-none', value: '0px' },
  { name: 'border-width-xs', variable: '--border-width-xs', value: '1px' },
  { name: 'border-width-sm', variable: '--border-width-sm', value: '2px' },
  { name: 'border-width-md', variable: '--border-width-md', value: '4px' },
  { name: 'border-width-lg', variable: '--border-width-lg', value: '8px' },
];

// Breakpoints and grid - from Desktop_tokens.json, Mobile_tokens.json, Tablet_tokens.json
export const breakpoints = [
  { 
    name: 'Mobile', 
    width: '390px', 
    columns: 4, 
    margin: '16px', 
    gutter: '12px',
    variable: '--breakpoint-mobile'
  },
  { 
    name: 'Tablet', 
    width: '744px', 
    columns: 8, 
    margin: '24px', 
    gutter: '24px',
    variable: '--breakpoint-tablet'
  },
  { 
    name: 'Desktop', 
    width: '1440px', 
    columns: 12, 
    margin: '80px', 
    gutter: '24px',
    variable: '--breakpoint-desktop'
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {boolean} - Success status
 */
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  return true;
}

/**
 * Wrap a CSS variable name in var()
 * @param {string} variable - CSS variable name (e.g., '--color-bg-white')
 * @returns {string} - Wrapped variable (e.g., 'var(--color-bg-white)')
 */
export function getCSSVariable(variable) {
  return `var(${variable})`;
}

/**
 * Get the computed value of a CSS variable
 * @param {string} variable - CSS variable name (e.g., '--color-bg-white')
 * @returns {string} - Computed value from the document
 */
export function getComputedCSSValue(variable) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Transform a Figma token path to a CSS variable name
 * Examples:
 * - "Color.Button.Primary.primary-bg" → "--color-btn-primary-bg"
 * - "Color.Background.bg-white" → "--color-bg-white"
 * - "Font Size.heading-lg" → "--font-size-heading-lg"
 * 
 * @param {string} path - Dot-separated token path from Figma
 * @returns {string} - CSS variable name
 */
export function tokenPathToCSSVariable(path) {
  // Split the path into parts
  const parts = path.split('.');
  
  // Handle Color tokens
  if (parts[0] === 'Color') {
    // Button tokens: Color.Button.Primary.primary-bg → --color-btn-primary-bg
    if (parts[1] === 'Button') {
      const variant = parts[2].toLowerCase(); // Primary, Secondary, Ghost
      const tokenName = parts[3]; // primary-bg, secondary-text, etc.
      return `--color-btn-${tokenName}`;
    }
    // Background tokens: Color.Background.bg-white → --color-bg-white
    if (parts[1] === 'Background') {
      return `--color-${parts[2]}`;
    }
    // Foreground tokens: Color.Foreground.fg-heading → --color-fg-heading
    if (parts[1] === 'Foreground') {
      return `--color-${parts[2]}`;
    }
    // Superlative tokens: Color.Superlative.Primary → --color-superlative-primary
    if (parts[1] === 'Superlative') {
      return `--color-superlative-${parts[2].toLowerCase()}`;
    }
  }
  
  // Handle Typography tokens
  if (parts[0] === 'Font Size') {
    // Font Size.heading-lg → --font-size-heading-lg
    return `--font-size-${parts.slice(1).join('-')}`;
  }
  if (parts[0] === 'Font weight') {
    // Font weight.font-weight-bold → --font-weight-bold
    return `--${parts[1]}`;
  }
  if (parts[0] === 'Line height') {
    // Line height.line-height-lg → --line-height-lg
    return `--${parts[1]}`;
  }
  if (parts[0] === 'Letter Spacing') {
    // Letter Spacing.spacing-tight → --letter-spacing-tight
    return `--letter-${parts[1]}`;
  }
  
  // Handle Spacing tokens
  if (parts[0] === 'Spacing') {
    return `--${parts[1]}`;
  }
  
  // Handle Radius tokens
  if (parts[0] === 'Radius') {
    return `--${parts[1]}`;
  }
  
  // Handle Border-width tokens
  if (parts[0] === 'Border-width') {
    return `--${parts[1]}`;
  }
  
  // Fallback: convert to kebab-case
  return `--${parts.join('-').toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Extract the value from a DTCG token
 * @param {object} token - DTCG token object with $type and $value
 * @returns {string|number} - Extracted value
 */
export function extractTokenValue(token) {
  if (!token || !token.$value) return null;
  
  const type = token.$type;
  const value = token.$value;
  
  // Color tokens: use $value.hex
  if (type === 'color') {
    return value.hex || null;
  }
  
  // String tokens: use $value directly
  if (type === 'string') {
    return value;
  }
  
  // Number tokens: use $value directly
  if (type === 'number') {
    return value;
  }
  
  // Fallback for unknown types
  return value;
}

/**
 * Get all color tokens as a flat array
 * @returns {Array} - Array of all color tokens
 */
export function getAllColorTokens() {
  const all = [];
  
  // Add backgrounds
  all.push(...colorTokens.backgrounds);
  
  // Add foregrounds
  all.push(...colorTokens.foregrounds);
  
  // Add button tokens
  all.push(...colorTokens.buttons.primary);
  all.push(...colorTokens.buttons.secondary);
  all.push(...colorTokens.buttons.ghost);
  
  // Add feedback tokens
  all.push(...colorTokens.feedback);
  
  // Add superlative tokens
  all.push(...colorTokens.superlative);
  
  return all;
}

/**
 * Get all typography tokens as a flat array
 * @returns {Array} - Array of all typography tokens
 */
export function getAllTypographyTokens() {
  const all = [];
  
  all.push(...typographyTokens.fontSizes);
  all.push(...typographyTokens.fontWeights);
  all.push(...typographyTokens.lineHeights);
  all.push(...typographyTokens.letterSpacing);
  
  return all;
}

