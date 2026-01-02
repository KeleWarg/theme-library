/**
 * ExportOptions Component
 * Format-specific options for export
 * Chunk 4.03 - Export Modal
 */

/**
 * Default options for each format
 */
export const DEFAULT_OPTIONS = {
  css: {
    minify: false,
    includeComments: true,
    scopeClass: '',
  },
  json: {
    prettyPrint: true,
    includeFigmaMetadata: true,
  },
  tailwind: {
    version: '3.x',
  },
  scss: {
    useMap: false,
    includeComments: true,
  },
}

export default function ExportOptions({ format, options, onOptionsChange }) {
  const handleChange = (key, value) => {
    onOptionsChange({ ...options, [key]: value })
  }

  return (
    <div
      data-testid="export-options"
      style={{
        padding: '16px 20px',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px 24px',
          alignItems: 'center',
        }}
      >
        {format === 'css' && (
          <>
            <Checkbox
              id="minify"
              label="Minify output"
              checked={options.minify || false}
              onChange={(checked) => handleChange('minify', checked)}
            />
            <Checkbox
              id="includeComments"
              label="Include comments"
              checked={options.includeComments !== false}
              onChange={(checked) => handleChange('includeComments', checked)}
            />
            <TextInput
              id="scopeClass"
              label="Scope to class"
              value={options.scopeClass || ''}
              onChange={(value) => handleChange('scopeClass', value)}
              placeholder="e.g., my-theme"
            />
          </>
        )}

        {format === 'json' && (
          <>
            <Checkbox
              id="prettyPrint"
              label="Pretty print"
              checked={options.prettyPrint !== false}
              onChange={(checked) => handleChange('prettyPrint', checked)}
            />
            <Checkbox
              id="includeFigmaMetadata"
              label="Include Figma metadata"
              checked={options.includeFigmaMetadata !== false}
              onChange={(checked) => handleChange('includeFigmaMetadata', checked)}
            />
          </>
        )}

        {format === 'tailwind' && (
          <SelectInput
            id="version"
            label="Tailwind version"
            value={options.version || '3.x'}
            onChange={(value) => handleChange('version', value)}
            options={[
              { value: '3.x', label: 'v3.x (JS config)' },
              { value: '4.x', label: 'v4.x (CSS @theme)' },
            ]}
          />
        )}

        {format === 'scss' && (
          <>
            <Checkbox
              id="useMap"
              label="Export as SCSS map"
              checked={options.useMap || false}
              onChange={(checked) => handleChange('useMap', checked)}
            />
            <Checkbox
              id="includeComments"
              label="Include comments"
              checked={options.includeComments !== false}
              onChange={(checked) => handleChange('includeComments', checked)}
            />
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

function Checkbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: 'var(--font-size-body-sm, 14px)',
        color: 'var(--color-fg-body, #383C43)',
      }}
    >
      <input
        type="checkbox"
        id={id}
        data-testid={`option-${id}`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--color-btn-primary-bg, #657E79)',
          cursor: 'pointer',
        }}
      />
      {label}
    </label>
  )
}

function TextInput({ id, label, value, onChange, placeholder }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: 'var(--font-size-body-sm, 14px)',
        color: 'var(--color-fg-body, #383C43)',
      }}
    >
      {label}:
      <input
        type="text"
        id={id}
        data-testid={`option-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '6px 10px',
          fontSize: 'var(--font-size-body-sm, 14px)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '6px',
          background: 'var(--color-bg-white, #FFFFFF)',
          color: 'var(--color-fg-body, #383C43)',
          width: '140px',
        }}
      />
    </label>
  )
}

function SelectInput({ id, label, value, onChange, options }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: 'var(--font-size-body-sm, 14px)',
        color: 'var(--color-fg-body, #383C43)',
      }}
    >
      {label}:
      <select
        id={id}
        data-testid={`option-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          fontSize: 'var(--font-size-body-sm, 14px)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '6px',
          background: 'var(--color-bg-white, #FFFFFF)',
          color: 'var(--color-fg-body, #383C43)',
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

