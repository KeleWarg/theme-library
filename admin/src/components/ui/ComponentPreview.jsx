import { useMemo, useState, useEffect } from 'react'

/**
 * Prepares the code for browser execution:
 * - Removes import statements (React is loaded via CDN)
 * - Converts export statements to regular function declarations
 * - Extracts the component name
 */
function prepareCodeForBrowser(code) {
  if (!code) return { cleanCode: '', componentName: null }

  let cleanCode = code

  // Remove import statements (React is already available globally)
  cleanCode = cleanCode.replace(/^import\s+.*?['"].*?['"];?\s*$/gm, '')
  cleanCode = cleanCode.replace(/^import\s*{[^}]*}\s*from\s*['"].*?['"];?\s*$/gm, '')

  // Find the component name before transforming
  let componentName = null
  
  // Match: export function ComponentName or export default function ComponentName
  const exportFuncMatch = cleanCode.match(/export\s+(?:default\s+)?function\s+([A-Z][a-zA-Z0-9]*)/);
  if (exportFuncMatch) {
    componentName = exportFuncMatch[1]
  }
  
  // Match: function ComponentName (already without export)
  if (!componentName) {
    const funcMatch = cleanCode.match(/^function\s+([A-Z][a-zA-Z0-9]*)/m)
    if (funcMatch) {
      componentName = funcMatch[1]
    }
  }

  // Match: const ComponentName = (arrow functions)
  if (!componentName) {
    const constMatch = cleanCode.match(/(?:export\s+)?const\s+([A-Z][a-zA-Z0-9]*)\s*=/)
    if (constMatch) {
      componentName = constMatch[1]
    }
  }

  // Remove export keywords
  cleanCode = cleanCode.replace(/export\s+default\s+/g, '')
  cleanCode = cleanCode.replace(/export\s+/g, '')

  // Clean up empty lines
  cleanCode = cleanCode.replace(/^\s*[\r\n]/gm, '\n').trim()

  return { cleanCode, componentName }
}

export default function ComponentPreview({ 
  code, 
  componentProps = {}, 
  theme = 'theme-health-sem',
  componentName: propComponentName // Allow overriding component name
}) {
  const [error, setError] = useState(null)

  // Clear error when code changes
  useEffect(() => {
    setError(null)
  }, [code])

  const { srcdoc, detectedName } = useMemo(() => {
    if (!code || !code.trim()) {
      return { 
        srcdoc: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      color: #6B7280;
      background: #F9FAFB;
    }
  </style>
</head>
<body>No code to preview</body>
</html>`,
        detectedName: null 
      }
    }

    const { cleanCode, componentName: detected } = prepareCodeForBrowser(code)
    const finalComponentName = propComponentName || detected || 'Component'

    // Build props string for JSX
    const propsWithChildren = { ...componentProps }
    const childrenContent = propsWithChildren.children || 'Preview Content'
    delete propsWithChildren.children

    const propsString = Object.entries(propsWithChildren)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return value ? key : ''
        if (typeof value === 'string') return `${key}="${value}"`
        return `${key}={${JSON.stringify(value)}}`
      })
      .filter(Boolean)
      .join(' ')

    const htmlContent = `<!DOCTYPE html>
<html class="${theme}">
<head>
  <style>
    /* Base tokens */
    :root {
      --color-bg-white: #FFFFFF;
      --color-bg-neutral-light: #F5F5F5;
      --color-bg-neutral-medium: #E5E5E5;
      --color-fg-heading: #1A1A1A;
      --color-fg-body: #4A4A4A;
      --color-fg-caption: #6B7280;
      --color-fg-feedback-error: #DC2626;
      --color-fg-feedback-warning: #F59E0B;
      --color-fg-feedback-success: #059669;
      --color-border-default: #E5E5E5;
      --font-size-body-lg: 18px;
      --font-size-body-md: 16px;
      --font-size-body-sm: 14px;
      --font-weight-bold: 700;
      --font-weight-semibold: 600;
      --font-weight-regular: 400;
    }

    /* Theme: Health SEM (support both slug formats) */
    .theme-health-sem,
    .theme-health---sem {
      --color-btn-primary-bg: #657E79;
      --color-btn-primary-hover: #546B66;
      --color-btn-primary-text: #FFFFFF;
      --color-btn-secondary-bg: transparent;
      --color-btn-secondary-text: #657E79;
      --color-btn-secondary-border: #657E79;
      --color-btn-ghost-hover: rgba(101, 126, 121, 0.1);
      --color-btn-ghost-text: #657E79;
      --color-accent: #657E79;
    }

    /* Theme: Home SEM */
    .theme-home-sem,
    .theme-home---sem {
      --color-btn-primary-bg: #2563EB;
      --color-btn-primary-hover: #1D4ED8;
      --color-btn-primary-text: #FFFFFF;
      --color-btn-secondary-bg: transparent;
      --color-btn-secondary-text: #2563EB;
      --color-btn-secondary-border: #2563EB;
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
      --color-btn-secondary-border: #007AC8;
      --color-btn-ghost-hover: rgba(0, 122, 200, 0.1);
      --color-btn-ghost-text: #007AC8;
      --color-accent: #007AC8;
    }

    /* Theme: Forbes Media SEO */
    .theme-forbes-media-seo,
    .theme-forbes-media---seo {
      --color-btn-primary-bg: #1A1A1A;
      --color-btn-primary-hover: #333333;
      --color-btn-primary-text: #FFFFFF;
      --color-btn-secondary-bg: transparent;
      --color-btn-secondary-text: #1A1A1A;
      --color-btn-secondary-border: #1A1A1A;
      --color-btn-ghost-hover: rgba(26, 26, 26, 0.1);
      --color-btn-ghost-text: #1A1A1A;
      --color-accent: #1A1A1A;
    }

    /* Theme: Compare Coverage */
    .theme-advisor-sem-compare-coverage,
    .theme-advisor---sem---compare---coverage {
      --color-btn-primary-bg: #059669;
      --color-btn-primary-hover: #047857;
      --color-btn-primary-text: #FFFFFF;
      --color-btn-secondary-bg: transparent;
      --color-btn-secondary-text: #059669;
      --color-btn-secondary-border: #059669;
      --color-btn-ghost-hover: rgba(5, 150, 105, 0.1);
      --color-btn-ghost-text: #059669;
      --color-accent: #059669;
    }

    body {
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 48px);
      background: #F9FAFB;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .preview-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .error {
      color: #DC2626;
      padding: 16px;
      text-align: center;
      font-size: 14px;
      background: #FEE2E2;
      border-radius: 8px;
      max-width: 300px;
    }

    .component-name {
      font-size: 11px;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    try {
      // Component code
      ${cleanCode}

      // Get the component to render
      const ComponentToRender = typeof ${finalComponentName} !== 'undefined' ? ${finalComponentName} : null;

      if (ComponentToRender) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <div className="preview-wrapper">
            <ComponentToRender ${propsString}>${childrenContent}</ComponentToRender>
            <span className="component-name">${finalComponentName}</span>
          </div>
        );
      } else {
        document.getElementById('root').innerHTML = 
          '<div class="error">Component "${finalComponentName}" not found. Check the component name in your code.</div>';
      }
    } catch (err) {
      console.error('Preview error:', err);
      document.getElementById('root').innerHTML = 
        '<div class="error"><strong>Error:</strong> ' + err.message + '</div>';
    }
  <\/script>
</body>
</html>`

    return { srcdoc: htmlContent, detectedName: detected }
  }, [code, componentProps, theme, propComponentName])

  return (
    <div>
      <iframe
        srcDoc={srcdoc}
        title="Component Preview"
        style={{
          width: '100%',
          height: '300px',
          border: '1px solid var(--color-border-default)',
          borderRadius: '8px',
          background: 'white',
        }}
        sandbox="allow-scripts allow-same-origin"
        onError={() => setError('Failed to load preview')}
      />
      {error && (
        <p style={{ color: 'var(--color-fg-feedback-error)', fontSize: '12px', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
