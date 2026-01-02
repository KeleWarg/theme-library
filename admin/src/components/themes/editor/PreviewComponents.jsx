import { useState } from 'react'
import { Search, ChevronDown, Check, X, AlertCircle, Star } from 'lucide-react'

/**
 * PreviewComponents - Sample components for theme preview
 * These components use CSS variables scoped to their container
 * to demonstrate how the current theme tokens look in practice.
 */

/**
 * Preview Button component with variants
 */
export function PreviewButton({ variant = 'primary', children, ...props }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: 'var(--font-size-body-sm, 14px)',
    fontWeight: 'var(--font-weight-medium, 500)',
    fontFamily: 'var(--font-family-sans-serif, inherit)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
  }

  const variants = {
    primary: {
      backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
      color: 'var(--color-btn-primary-text, #FFFFFF)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--color-btn-secondary-bg, #FFFFFF)',
      color: 'var(--color-btn-secondary-text, #657E79)',
      border: '1px solid var(--color-btn-secondary-border, #657E79)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-btn-ghost-text, #657E79)',
      border: 'none',
    },
  }

  return (
    <button
      {...props}
      style={{ ...baseStyles, ...variants[variant], ...props.style }}
    >
      {children}
    </button>
  )
}

/**
 * Preview Card component
 */
export function PreviewCard({ title, children, ...props }) {
  return (
    <div
      {...props}
      style={{
        backgroundColor: 'var(--color-bg-white, #FFFFFF)',
        border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
        borderRadius: '8px',
        padding: '16px',
        ...props.style,
      }}
    >
      {title && (
        <h4
          style={{
            margin: '0 0 12px 0',
            fontSize: 'var(--font-size-title-sm, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          {title}
        </h4>
      )}
      <div
        style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-body, #383C43)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Preview Input component
 */
export function PreviewInput({ label, placeholder, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-body, #383C43)',
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        {...props}
        style={{
          padding: '10px 12px',
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-body, #383C43)',
          backgroundColor: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
          borderRadius: '6px',
          outline: 'none',
          ...props.style,
        }}
      />
    </div>
  )
}

/**
 * Preview Select component
 */
export function PreviewSelect({ label, options = [], ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-body, #383C43)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          {...props}
          style={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-body, #383C43)',
            backgroundColor: 'var(--color-bg-white, #FFFFFF)',
            border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '6px',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            ...props.style,
          }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--color-fg-caption, #616A76)',
          }}
        />
      </div>
    </div>
  )
}

/**
 * Preview Badge component
 */
export function PreviewBadge({ variant = 'default', children, ...props }) {
  const variants = {
    default: {
      backgroundColor: 'var(--color-bg-neutral-light, #ECEFF3)',
      color: 'var(--color-fg-body, #383C43)',
    },
    success: {
      backgroundColor: 'var(--color-bg-secondary, #D1E5E1)',
      color: 'var(--color-fg-feedback-success, #0C7663)',
    },
    warning: {
      backgroundColor: 'var(--color-bg-accent-mid, #FFF0D4)',
      color: 'var(--color-fg-feedback-warning, #FFB136)',
    },
    error: {
      backgroundColor: '#FDEAEA',
      color: 'var(--color-fg-feedback-error, #EB4015)',
    },
    brand: {
      backgroundColor: 'var(--color-bg-brand-subtle, #F2F5F4)',
      color: 'var(--color-btn-primary-bg, #657E79)',
    },
  }

  return (
    <span
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        fontSize: 'var(--font-size-label-sm, 12px)',
        fontWeight: 'var(--font-weight-medium, 500)',
        fontFamily: 'var(--font-family-sans-serif, inherit)',
        borderRadius: '4px',
        ...variants[variant],
        ...props.style,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Preview Alert component
 */
export function PreviewAlert({ variant = 'info', title, children, ...props }) {
  const variants = {
    info: {
      backgroundColor: 'var(--color-bg-brand-light, #D1E5E1)',
      borderColor: 'var(--color-btn-primary-bg, #657E79)',
      color: 'var(--color-fg-heading, #1E2125)',
    },
    success: {
      backgroundColor: 'var(--color-bg-secondary, #D1E5E1)',
      borderColor: 'var(--color-fg-feedback-success, #0C7663)',
      color: 'var(--color-fg-heading, #1E2125)',
    },
    warning: {
      backgroundColor: 'var(--color-bg-accent-mid, #FFF0D4)',
      borderColor: 'var(--color-fg-feedback-warning, #FFB136)',
      color: 'var(--color-fg-heading, #1E2125)',
    },
    error: {
      backgroundColor: '#FDEAEA',
      borderColor: 'var(--color-fg-feedback-error, #EB4015)',
      color: 'var(--color-fg-heading, #1E2125)',
    },
  }

  return (
    <div
      {...props}
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        borderLeft: `4px solid`,
        fontSize: 'var(--font-size-body-sm, 14px)',
        fontFamily: 'var(--font-family-sans-serif, inherit)',
        ...variants[variant],
        ...props.style,
      }}
    >
      {title && (
        <div
          style={{
            fontWeight: 'var(--font-weight-semibold, 600)',
            marginBottom: children ? '4px' : 0,
          }}
        >
          {title}
        </div>
      )}
      {children && <div>{children}</div>}
    </div>
  )
}

/**
 * Typography showcase component
 */
export function TypographyShowcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-size-heading-md, 32px)',
          fontWeight: 'var(--font-weight-bold, 700)',
          fontFamily: 'var(--font-family-serif, Georgia)',
          color: 'var(--color-fg-heading, #1E2125)',
          lineHeight: 'var(--line-height-3xl, 40px)',
        }}
      >
        Heading 1
      </h1>
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-size-heading-sm, 24px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-heading, #1E2125)',
          lineHeight: 'var(--line-height-2xl, 32px)',
        }}
      >
        Heading 2
      </h2>
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-size-title-lg, 20px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-heading, #1E2125)',
          lineHeight: 'var(--line-height-xl, 26px)',
        }}
      >
        Heading 3
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-regular, 400)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-body, #383C43)',
          lineHeight: 'var(--line-height-lg, 24px)',
        }}
      >
        Body text in the default style. This demonstrates the primary reading
        text that users will see throughout the application.
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-caption, #616A76)',
          lineHeight: 'var(--line-height-sm, 20px)',
        }}
      >
        Caption text for secondary information and supporting content.
      </p>
      <a
        href="#"
        style={{
          fontSize: 'var(--font-size-body-md, 16px)',
          fontFamily: 'var(--font-family-sans-serif, inherit)',
          color: 'var(--color-fg-link, #657E79)',
          textDecoration: 'underline',
        }}
      >
        Link text example
      </a>
    </div>
  )
}

/**
 * Combined component showcase for preview
 */
export function ComponentShowcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Typography Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Typography
        </h3>
        <TypographyShowcase />
      </section>

      {/* Buttons Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Buttons
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <PreviewButton variant="primary">Primary</PreviewButton>
          <PreviewButton variant="secondary">Secondary</PreviewButton>
          <PreviewButton variant="ghost">Ghost</PreviewButton>
        </div>
      </section>

      {/* Badges Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Badges
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <PreviewBadge variant="default">Default</PreviewBadge>
          <PreviewBadge variant="brand">Brand</PreviewBadge>
          <PreviewBadge variant="success">
            <Check size={12} /> Success
          </PreviewBadge>
          <PreviewBadge variant="warning">
            <AlertCircle size={12} /> Warning
          </PreviewBadge>
          <PreviewBadge variant="error">
            <X size={12} /> Error
          </PreviewBadge>
        </div>
      </section>

      {/* Form Elements Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Form Elements
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PreviewInput label="Text Input" placeholder="Enter text..." />
          <PreviewSelect
            label="Select Option"
            options={['Option 1', 'Option 2', 'Option 3']}
          />
        </div>
      </section>

      {/* Card Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Card
        </h3>
        <PreviewCard title="Sample Card">
          <p style={{ margin: '0 0 12px 0' }}>
            This is a sample card component showcasing the theme's background and
            border colors.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <PreviewButton variant="primary">Action</PreviewButton>
            <PreviewButton variant="ghost">Cancel</PreviewButton>
          </div>
        </PreviewCard>
      </section>

      {/* Alerts Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Alerts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PreviewAlert variant="info" title="Information">
            This is an informational message.
          </PreviewAlert>
          <PreviewAlert variant="success" title="Success">
            Your changes have been saved.
          </PreviewAlert>
          <PreviewAlert variant="warning" title="Warning">
            Please review before continuing.
          </PreviewAlert>
          <PreviewAlert variant="error" title="Error">
            Something went wrong.
          </PreviewAlert>
        </div>
      </section>

      {/* Color Swatches Section */}
      <section>
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family-sans-serif, inherit)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wider, 1px)',
          }}
        >
          Color Palette
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { name: 'Primary', color: 'var(--color-btn-primary-bg, #657E79)' },
            { name: 'Brand', color: 'var(--color-bg-brand, #657E79)' },
            { name: 'Secondary', color: 'var(--color-bg-secondary, #D1E5E1)' },
            { name: 'Accent', color: 'var(--color-bg-accent, #F6F5F3)' },
            { name: 'Superlative', color: 'var(--color-superlative-primary, #ED6E13)' },
          ].map((swatch) => (
            <div
              key={swatch.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: swatch.color,
                  border: '1px solid var(--color-fg-divider, #D7DCE5)',
                }}
              />
              <span
                style={{
                  fontSize: 'var(--font-size-label-xs, 10px)',
                  fontFamily: 'var(--font-family-sans-serif, inherit)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}
              >
                {swatch.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ComponentShowcase

