/**
 * Tailwind CSS Configuration
 * Auto-generated from Figma Variables
 * 
 * USAGE FOR AI TOOLS:
 * 1. Import the CSS file first: @import './tokens.css';
 * 2. Add theme class to root: <html class="theme-health-sem">
 * 3. Use semantic classes: bg-bg-brand, text-fg-heading, etc.
 * 
 * AVAILABLE THEMES:
 * - theme-advisor-sem/compare-coverage
 * - theme-forbes-media---seo
 * - theme-health---sem
 * - theme-home---sem
 * - theme-llm
 */

module.exports = {
  "theme": {
    "screens": {
      "tablet": "744px",
      "desktop": "1440px"
    },
    "extend": {
      "colors": {
        "btn": {
          "primary-bg": "var(--color-btn-primary-bg)",
          "primary-text": "var(--color-btn-primary-text)",
          "primary-hover": "var(--color-btn-primary-hover-bg)",
          "primary-pressed": "var(--color-btn-primary-pressed-bg)",
          "secondary-bg": "var(--color-btn-secondary-bg)",
          "secondary-text": "var(--color-btn-secondary-text)",
          "secondary-border": "var(--color-btn-secondary-border)",
          "ghost-text": "var(--color-btn-ghost-text)",
          "ghost-hover": "var(--color-btn-ghost-hover-bg)"
        },
        "bg": {
          "white": "var(--color-bg-white)",
          "neutral-subtle": "var(--color-bg-neutral-subtle)",
          "neutral-light": "var(--color-bg-neutral-light)",
          "neutral": "var(--color-bg-neutral)",
          "neutral-mid": "var(--color-bg-neutral-mid)",
          "neutral-strong": "var(--color-bg-neutral-strong)",
          "accent": "var(--color-bg-accent)",
          "accent-mid": "var(--color-bg-accent-mid)",
          "brand-subtle": "var(--color-bg-brand-subtle)",
          "brand-light": "var(--color-bg-brand-light)",
          "brand-mid": "var(--color-bg-brand-mid)",
          "brand": "var(--color-bg-brand)",
          "header": "var(--color-bg-header)",
          "table": "var(--color-bg-table)",
          "secondary": "var(--color-bg-secondary)",
          "superlative": "var(--color-bg-superlative)"
        },
        "fg": {
          "heading": "var(--color-fg-heading)",
          "body": "var(--color-fg-body)",
          "caption": "var(--color-fg-caption)",
          "link": "var(--color-fg-link)",
          "link-secondary": "var(--color-fg-link-secondary)",
          "heading-inverse": "var(--color-fg-heading-inverse)",
          "body-inverse": "var(--color-fg-body-inverse)",
          "caption-inverse": "var(--color-fg-caption-inverse)"
        },
        "stroke": {
          "ui": "var(--color-fg-stroke-ui)",
          "ui-inverse": "var(--color-fg-stroke-ui-inverse)",
          "default": "var(--color-fg-stroke-default)",
          "divider": "var(--color-fg-divider)",
          "inverse": "var(--color-fg-stroke-inverse)"
        },
        "feedback": {
          "error": "var(--color-fg-feedback-error)",
          "warning": "var(--color-fg-feedback-warning)",
          "success": "var(--color-fg-feedback-success)"
        },
        "superlative": {
          "primary": "var(--color-superlative-primary)",
          "secondary": "var(--color-superlative-secondary)"
        }
      },
      "fontSize": {
        "display": [
          "56px",
          {
            "lineHeight": "1.4"
          }
        ],
        "heading-lg": [
          "48px",
          {
            "lineHeight": "1.4"
          }
        ],
        "heading-md": [
          "32px",
          {
            "lineHeight": "1.4"
          }
        ],
        "heading-sm": [
          "24px",
          {
            "lineHeight": "1.4"
          }
        ],
        "title-lg": [
          "20px",
          {
            "lineHeight": "1.4"
          }
        ],
        "title-md": [
          "18px",
          {
            "lineHeight": "1.4"
          }
        ],
        "title-sm": [
          "16px",
          {
            "lineHeight": "1.4"
          }
        ],
        "title-xs": [
          "14px",
          {
            "lineHeight": "1.4"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "1.4"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "1.4"
          }
        ],
        "body-xs": [
          "12px",
          {
            "lineHeight": "1.4"
          }
        ],
        "body-sm": [
          "14px",
          {
            "lineHeight": "1.4"
          }
        ],
        "label-lg": [
          "16px",
          {
            "lineHeight": "1.4"
          }
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "1.4"
          }
        ],
        "label-sm": [
          "12px",
          {
            "lineHeight": "1.4"
          }
        ],
        "label-xs": [
          "10px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-heading-lg": [
          "48px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-heading-md": [
          "32px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-heading-sm": [
          "24px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-heading-xs": [
          "20px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-lg-serif": [
          "18px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-lg": [
          "18px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-md": [
          "16px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-sm": [
          "14px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-xs": [
          "12px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-body-2xs": [
          "10px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-label-eyebrow": [
          "18px",
          {
            "lineHeight": "1.4"
          }
        ],
        "forbes-media-label-breadcrumb": [
          "12px",
          {
            "lineHeight": "1.4"
          }
        ]
      },
      "fontFamily": {
        "font-family-serif": [
          "Georgia",
          "system-ui",
          "sans-serif"
        ],
        "font-family-sans-serif": [
          "Euclid Circular B",
          "system-ui",
          "sans-serif"
        ],
        "forbes-media---seo-font-family-heading-serif": [
          "Schnyder S",
          "system-ui",
          "sans-serif"
        ],
        "forbes-media---seo-font-family-heading": [
          "Work Sans",
          "system-ui",
          "sans-serif"
        ],
        "forbes-media---seo-font-family-body": [
          "Georgia",
          "system-ui",
          "sans-serif"
        ],
        "forbes-media---seo-font-family-body-serif": [
          "Work Sans",
          "system-ui",
          "sans-serif"
        ],
        "forbes-media---seo-font-family-breadcrumbs": [
          "Graphik",
          "system-ui",
          "sans-serif"
        ]
      },
      "fontWeight": {
        "light": 300,
        "regular": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "5xl": "68px",
        "4xl": "58px",
        "3xl": "40px",
        "2xl": "32px",
        "xl": "26px",
        "lg": "24px",
        "md": "22px",
        "sm": "20px",
        "xs": "18px",
        "2xs": "16px"
      },
      "letterSpacing": {
        "tighter": "-0.20000000298023224px",
        "wider": "1px",
        "tight": "-0.10000000149011612px",
        "normal": "0px",
        "wide": "0.5px"
      },
      "spacing": {
        "gutter": "var(--grid-gutter)",
        "margin": "var(--grid-margin)"
      }
    }
  }
};
