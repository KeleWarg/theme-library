import { useMemo } from 'react'

export default function ComponentPreview({ code, componentProps = {}, theme = 'theme-health-sem' }) {
  const srcdoc = useMemo(() => {
    if (!code) {
      return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;font-family:system-ui;">No code to preview</body></html>`
    }

    // Build children prop if it exists
    const propsWithChildren = { ...componentProps }
    const childrenContent = propsWithChildren.children || 'Button'
    delete propsWithChildren.children

    const propsString = Object.entries(propsWithChildren)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return value ? key : ''
        if (typeof value === 'string') return `${key}="${value}"`
        return `${key}={${JSON.stringify(value)}}`
      })
      .filter(Boolean)
      .join(' ')

    return `
<!DOCTYPE html>
<html class="${theme}">
<head>
  <style>
    :root {
      --color-btn-primary-bg: #657E79;
      --color-btn-primary-text: #FFFFFF;
      --color-btn-secondary-bg: #F5F5F5;
      --color-btn-secondary-text: #333333;
      --color-fg-heading: #1a1a1a;
      --color-fg-body: #333333;
      --color-bg-white: #FFFFFF;
      --color-border-default: #E5E5E5;
    }
    .theme-health-sem {
      --color-btn-primary-bg: #657E79;
      --color-btn-primary-text: #FFFFFF;
    }
    .theme-home-sem {
      --color-btn-primary-bg: #2D5A27;
      --color-btn-primary-text: #FFFFFF;
    }
    .theme-llm {
      --color-btn-primary-bg: #007AC8;
      --color-btn-primary-text: #FFFFFF;
    }
    .theme-forbes-media-seo {
      --color-btn-primary-bg: #1B4332;
      --color-btn-primary-text: #FFFFFF;
    }
    .theme-advisor-sem-compare-coverage {
      --color-btn-primary-bg: #4A5568;
      --color-btn-primary-text: #FFFFFF;
    }
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 48px);
      background: #F9FAFB;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .error { color: #DC2626; padding: 16px; text-align: center; }
    .preview-container { padding: 20px; }
  </style>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${code}
      
      // Find the exported component (try common names)
      const ComponentToRender = typeof Button !== 'undefined' ? Button
        : typeof Card !== 'undefined' ? Card
        : typeof Input !== 'undefined' ? Input
        : typeof Badge !== 'undefined' ? Badge
        : typeof Modal !== 'undefined' ? Modal
        : typeof Dropdown !== 'undefined' ? Dropdown
        : null;
      
      if (ComponentToRender) {
        ReactDOM.render(
          <div className="preview-container">
            <ComponentToRender ${propsString}>${childrenContent}</ComponentToRender>
          </div>,
          document.getElementById('root')
        );
      } else {
        document.getElementById('root').innerHTML = '<div class="error">Component not found. Make sure your component is named Button, Card, Input, Badge, Modal, or Dropdown.</div>';
      }
    } catch (error) {
      document.getElementById('root').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`
  }, [code, componentProps, theme])

  return (
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
      sandbox="allow-scripts"
    />
  )
}

