/**
 * CSS Token Exporter
 * Exports design tokens as CSS variables file.
 */

export interface TokenValue {
  category: string;
  name: string;
  value: string;
  cssVar: string;
}

/**
 * Group tokens by category for organized CSS output
 */
function groupByCategory(tokens: TokenValue[]): Record<string, TokenValue[]> {
  return tokens.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, TokenValue[]>);
}

/**
 * Generate CSS variables from tokens
 * @param tokens - Array of token values to convert
 * @param themeClass - Optional theme class selector (uses :root if not provided)
 * @returns CSS string with variables
 */
export function generateTokensCSS(tokens: TokenValue[], themeClass?: string): string {
  const selector = themeClass ? `.${themeClass}` : ':root';
  const grouped = groupByCategory(tokens);

  let css = `/* Design Tokens - Generated ${new Date().toISOString()} */\n\n`;
  css += `${selector} {\n`;

  for (const [category, categoryTokens] of Object.entries(grouped)) {
    css += `  /* ${category} */\n`;
    for (const token of categoryTokens) {
      css += `  ${token.cssVar}: ${token.value};\n`;
    }
    css += '\n';
  }

  css += '}\n';
  return css;
}

/**
 * Download tokens as a CSS file
 * @param tokens - Array of token values to export
 * @param filename - Output filename (default: 'tokens.css')
 */
export function downloadTokensCSS(tokens: TokenValue[], filename = 'tokens.css'): void {
  const css = generateTokensCSS(tokens);
  const blob = new Blob([css], { type: 'text/css' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

