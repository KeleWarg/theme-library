-- System Default Theme Seed Data
-- Version: 1.0.0
-- 
-- This migration creates the "System Default" theme as the baseline
-- fallback theme for the design system.
--
-- Run this SQL in Supabase SQL Editor after 001-create-tables.sql

-- ============================================================================
-- SYSTEM DEFAULT THEME
-- Clean, modern, professional baseline theme
-- ============================================================================

-- First, remove any existing system-default theme to allow re-running
DELETE FROM themes WHERE slug = 'theme-system-default';

-- Insert the System Default theme
INSERT INTO themes (
  name,
  slug,
  description,
  status,
  is_default,
  source,
  version
) VALUES (
  'System Default',
  'theme-system-default',
  'Clean, modern sans-serif design system with neutral colors, consistent spacing (4px base), subtle shadows, and rounded corners. Works as fallback when no theme is selected.',
  'published',
  true,
  'system',
  '1.0.0'
);

-- Get the theme ID for inserting tokens
DO $$
DECLARE
  theme_uuid UUID;
  sort_idx INTEGER := 0;
BEGIN
  SELECT id INTO theme_uuid FROM themes WHERE slug = 'theme-system-default';
  
  -- ============================================================================
  -- TYPOGRAPHY TOKENS
  -- ============================================================================
  
  -- Font Families
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'typography', 'font-family', 'sans', '{"fontFamily": "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"}', '--font-family-sans', 1),
  (theme_uuid, 'typography', 'font-family', 'mono', '{"fontFamily": "JetBrains Mono, Fira Code, SF Mono, Consolas, monospace"}', '--font-family-mono', 2),
  (theme_uuid, 'typography', 'font-family', 'body', '{"reference": "var(--font-family-sans)"}', '--font-family-body', 3),
  (theme_uuid, 'typography', 'font-family', 'heading', '{"reference": "var(--font-family-sans)"}', '--font-family-heading', 4),
  (theme_uuid, 'typography', 'font-family', 'display', '{"reference": "var(--font-family-sans)"}', '--font-family-display', 5);
  
  -- Font Sizes
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'typography', 'font-size', 'xs', '{"value": 0.75, "unit": "rem"}', '--font-size-xs', 10),
  (theme_uuid, 'typography', 'font-size', 'sm', '{"value": 0.875, "unit": "rem"}', '--font-size-sm', 11),
  (theme_uuid, 'typography', 'font-size', 'base', '{"value": 1, "unit": "rem"}', '--font-size-base', 12),
  (theme_uuid, 'typography', 'font-size', 'lg', '{"value": 1.125, "unit": "rem"}', '--font-size-lg', 13),
  (theme_uuid, 'typography', 'font-size', 'xl', '{"value": 1.25, "unit": "rem"}', '--font-size-xl', 14),
  (theme_uuid, 'typography', 'font-size', '2xl', '{"value": 1.5, "unit": "rem"}', '--font-size-2xl', 15),
  (theme_uuid, 'typography', 'font-size', '3xl', '{"value": 1.875, "unit": "rem"}', '--font-size-3xl', 16),
  (theme_uuid, 'typography', 'font-size', '4xl', '{"value": 2.25, "unit": "rem"}', '--font-size-4xl', 17);
  
  -- Font Weights
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'typography', 'font-weight', 'normal', '{"value": 400}', '--font-weight-normal', 20),
  (theme_uuid, 'typography', 'font-weight', 'medium', '{"value": 500}', '--font-weight-medium', 21),
  (theme_uuid, 'typography', 'font-weight', 'semibold', '{"value": 600}', '--font-weight-semibold', 22),
  (theme_uuid, 'typography', 'font-weight', 'bold', '{"value": 700}', '--font-weight-bold', 23);
  
  -- Line Heights
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'typography', 'line-height', 'tight', '{"value": 1.25}', '--line-height-tight', 30),
  (theme_uuid, 'typography', 'line-height', 'normal', '{"value": 1.5}', '--line-height-normal', 31),
  (theme_uuid, 'typography', 'line-height', 'relaxed', '{"value": 1.75}', '--line-height-relaxed', 32);
  
  -- Letter Spacing
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'typography', 'letter-spacing', 'tight', '{"value": -0.025, "unit": "em"}', '--letter-spacing-tight', 40),
  (theme_uuid, 'typography', 'letter-spacing', 'normal', '{"value": 0}', '--letter-spacing-normal', 41),
  (theme_uuid, 'typography', 'letter-spacing', 'wide', '{"value": 0.025, "unit": "em"}', '--letter-spacing-wide', 42);

  -- ============================================================================
  -- COLOR TOKENS
  -- ============================================================================
  
  -- Base colors
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'base', 'white', '{"hex": "#ffffff"}', '--color-white', 100),
  (theme_uuid, 'color', 'base', 'black', '{"hex": "#000000"}', '--color-black', 101);
  
  -- Gray scale
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'gray', '50', '{"hex": "#fafafa"}', '--color-gray-50', 110),
  (theme_uuid, 'color', 'gray', '100', '{"hex": "#f4f4f5"}', '--color-gray-100', 111),
  (theme_uuid, 'color', 'gray', '200', '{"hex": "#e4e4e7"}', '--color-gray-200', 112),
  (theme_uuid, 'color', 'gray', '300', '{"hex": "#d4d4d8"}', '--color-gray-300', 113),
  (theme_uuid, 'color', 'gray', '400', '{"hex": "#a1a1aa"}', '--color-gray-400', 114),
  (theme_uuid, 'color', 'gray', '500', '{"hex": "#71717a"}', '--color-gray-500', 115),
  (theme_uuid, 'color', 'gray', '600', '{"hex": "#52525b"}', '--color-gray-600', 116),
  (theme_uuid, 'color', 'gray', '700', '{"hex": "#3f3f46"}', '--color-gray-700', 117),
  (theme_uuid, 'color', 'gray', '800', '{"hex": "#27272a"}', '--color-gray-800', 118),
  (theme_uuid, 'color', 'gray', '900', '{"hex": "#18181b"}', '--color-gray-900', 119),
  (theme_uuid, 'color', 'gray', '950', '{"hex": "#09090b"}', '--color-gray-950', 120);
  
  -- Primary (Blue)
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'primary', '50', '{"hex": "#eff6ff"}', '--color-primary-50', 130),
  (theme_uuid, 'color', 'primary', '100', '{"hex": "#dbeafe"}', '--color-primary-100', 131),
  (theme_uuid, 'color', 'primary', '200', '{"hex": "#bfdbfe"}', '--color-primary-200', 132),
  (theme_uuid, 'color', 'primary', '300', '{"hex": "#93c5fd"}', '--color-primary-300', 133),
  (theme_uuid, 'color', 'primary', '400', '{"hex": "#60a5fa"}', '--color-primary-400', 134),
  (theme_uuid, 'color', 'primary', '500', '{"hex": "#3b82f6"}', '--color-primary-500', 135),
  (theme_uuid, 'color', 'primary', '600', '{"hex": "#2563eb"}', '--color-primary-600', 136),
  (theme_uuid, 'color', 'primary', '700', '{"hex": "#1d4ed8"}', '--color-primary-700', 137),
  (theme_uuid, 'color', 'primary', '800', '{"hex": "#1e40af"}', '--color-primary-800', 138),
  (theme_uuid, 'color', 'primary', '900', '{"hex": "#1e3a8a"}', '--color-primary-900', 139);
  
  -- Semantic colors
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'semantic', 'success', '{"hex": "#22c55e"}', '--color-success', 150),
  (theme_uuid, 'color', 'semantic', 'warning', '{"hex": "#f59e0b"}', '--color-warning', 151),
  (theme_uuid, 'color', 'semantic', 'error', '{"hex": "#ef4444"}', '--color-error', 152),
  (theme_uuid, 'color', 'semantic', 'info', '{"hex": "#3b82f6"}', '--color-info', 153);
  
  -- Background semantic mappings
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'background', 'primary', '{"reference": "var(--color-white)"}', '--color-bg-primary', 160),
  (theme_uuid, 'color', 'background', 'secondary', '{"reference": "var(--color-gray-50)"}', '--color-bg-secondary', 161),
  (theme_uuid, 'color', 'background', 'tertiary', '{"reference": "var(--color-gray-100)"}', '--color-bg-tertiary', 162),
  (theme_uuid, 'color', 'background', 'inverse', '{"reference": "var(--color-gray-900)"}', '--color-bg-inverse', 163),
  (theme_uuid, 'color', 'background', 'white', '{"reference": "var(--color-white)"}', '--color-bg-white', 164),
  (theme_uuid, 'color', 'background', 'neutral-subtle', '{"reference": "var(--color-gray-50)"}', '--color-bg-neutral-subtle', 165),
  (theme_uuid, 'color', 'background', 'neutral-light', '{"reference": "var(--color-gray-100)"}', '--color-bg-neutral-light', 166),
  (theme_uuid, 'color', 'background', 'neutral', '{"reference": "var(--color-gray-200)"}', '--color-bg-neutral', 167),
  (theme_uuid, 'color', 'background', 'neutral-mid', '{"reference": "var(--color-gray-700)"}', '--color-bg-neutral-mid', 168),
  (theme_uuid, 'color', 'background', 'neutral-strong', '{"reference": "var(--color-gray-800)"}', '--color-bg-neutral-strong', 169),
  (theme_uuid, 'color', 'background', 'header', '{"reference": "var(--color-gray-900)"}', '--color-bg-header', 170),
  (theme_uuid, 'color', 'background', 'accent', '{"reference": "var(--color-primary-50)"}', '--color-bg-accent', 171),
  (theme_uuid, 'color', 'background', 'accent-mid', '{"reference": "var(--color-primary-100)"}', '--color-bg-accent-mid', 172),
  (theme_uuid, 'color', 'background', 'brand-subtle', '{"reference": "var(--color-primary-50)"}', '--color-bg-brand-subtle', 173),
  (theme_uuid, 'color', 'background', 'brand-light', '{"reference": "var(--color-primary-100)"}', '--color-bg-brand-light', 174),
  (theme_uuid, 'color', 'background', 'brand-mid', '{"reference": "var(--color-primary-600)"}', '--color-bg-brand-mid', 175),
  (theme_uuid, 'color', 'background', 'brand', '{"reference": "var(--color-primary-700)"}', '--color-bg-brand', 176),
  (theme_uuid, 'color', 'background', 'table', '{"reference": "var(--color-gray-50)"}', '--color-bg-table', 177),
  (theme_uuid, 'color', 'background', 'button', '{"reference": "var(--color-primary-600)"}', '--color-bg-button', 178),
  (theme_uuid, 'color', 'background', 'superlative', '{"reference": "var(--color-primary-500)"}', '--color-bg-superlative', 179);
  
  -- Foreground semantic mappings
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'foreground', 'primary', '{"reference": "var(--color-gray-900)"}', '--color-fg-primary', 180),
  (theme_uuid, 'color', 'foreground', 'secondary', '{"reference": "var(--color-gray-600)"}', '--color-fg-secondary', 181),
  (theme_uuid, 'color', 'foreground', 'tertiary', '{"reference": "var(--color-gray-400)"}', '--color-fg-tertiary', 182),
  (theme_uuid, 'color', 'foreground', 'inverse', '{"reference": "var(--color-white)"}', '--color-fg-inverse', 183),
  (theme_uuid, 'color', 'foreground', 'heading', '{"reference": "var(--color-gray-900)"}', '--color-fg-heading', 184),
  (theme_uuid, 'color', 'foreground', 'body', '{"reference": "var(--color-gray-700)"}', '--color-fg-body', 185),
  (theme_uuid, 'color', 'foreground', 'caption', '{"reference": "var(--color-gray-500)"}', '--color-fg-caption', 186),
  (theme_uuid, 'color', 'foreground', 'link', '{"reference": "var(--color-primary-600)"}', '--color-fg-link', 187),
  (theme_uuid, 'color', 'foreground', 'link-secondary', '{"reference": "var(--color-gray-600)"}', '--color-fg-link-secondary', 188),
  (theme_uuid, 'color', 'foreground', 'heading-inverse', '{"reference": "var(--color-white)"}', '--color-fg-heading-inverse', 189),
  (theme_uuid, 'color', 'foreground', 'body-inverse', '{"reference": "var(--color-gray-100)"}', '--color-fg-body-inverse', 190),
  (theme_uuid, 'color', 'foreground', 'caption-inverse', '{"reference": "var(--color-gray-300)"}', '--color-fg-caption-inverse', 191),
  (theme_uuid, 'color', 'foreground', 'stroke-ui', '{"reference": "var(--color-gray-400)"}', '--color-fg-stroke-ui', 192),
  (theme_uuid, 'color', 'foreground', 'stroke-ui-inverse', '{"reference": "var(--color-gray-300)"}', '--color-fg-stroke-ui-inverse', 193),
  (theme_uuid, 'color', 'foreground', 'stroke-default', '{"reference": "var(--color-gray-200)"}', '--color-fg-stroke-default', 194),
  (theme_uuid, 'color', 'foreground', 'stroke-inverse', '{"reference": "var(--color-white)"}', '--color-fg-stroke-inverse', 195),
  (theme_uuid, 'color', 'foreground', 'stroke-dark-inverse', '{"reference": "var(--color-gray-700)"}', '--color-fg-stroke-dark-inverse', 196),
  (theme_uuid, 'color', 'foreground', 'divider', '{"reference": "var(--color-gray-200)"}', '--color-fg-divider', 197),
  (theme_uuid, 'color', 'foreground', 'table-border', '{"reference": "var(--color-gray-200)"}', '--color-fg-table-border', 198),
  (theme_uuid, 'color', 'foreground', 'feedback-error', '{"reference": "var(--color-error)"}', '--color-fg-feedback-error', 199),
  (theme_uuid, 'color', 'foreground', 'feedback-warning', '{"reference": "var(--color-warning)"}', '--color-fg-feedback-warning', 200),
  (theme_uuid, 'color', 'foreground', 'feedback-success', '{"reference": "var(--color-success)"}', '--color-fg-feedback-success', 201);
  
  -- Border colors
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'border', 'primary', '{"reference": "var(--color-gray-200)"}', '--color-border-primary', 210),
  (theme_uuid, 'color', 'border', 'secondary', '{"reference": "var(--color-gray-100)"}', '--color-border-secondary', 211),
  (theme_uuid, 'color', 'border', 'focus', '{"reference": "var(--color-primary-500)"}', '--color-border-focus', 212);
  
  -- Button colors - Primary
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'button-primary', 'bg', '{"reference": "var(--color-primary-600)"}', '--color-btn-primary-bg', 220),
  (theme_uuid, 'color', 'button-primary', 'fg', '{"reference": "var(--color-white)"}', '--color-btn-primary-fg', 221),
  (theme_uuid, 'color', 'button-primary', 'text', '{"reference": "var(--color-white)"}', '--color-btn-primary-text', 222),
  (theme_uuid, 'color', 'button-primary', 'icon', '{"reference": "var(--color-white)"}', '--color-btn-primary-icon', 223),
  (theme_uuid, 'color', 'button-primary', 'hover', '{"reference": "var(--color-primary-700)"}', '--color-btn-primary-hover', 224),
  (theme_uuid, 'color', 'button-primary', 'hover-bg', '{"reference": "var(--color-primary-700)"}', '--color-btn-primary-hover-bg', 225),
  (theme_uuid, 'color', 'button-primary', 'pressed-bg', '{"reference": "var(--color-primary-800)"}', '--color-btn-primary-pressed-bg', 226),
  (theme_uuid, 'color', 'button-primary', 'disabled-bg', '{"reference": "var(--color-primary-400)"}', '--color-btn-primary-disabled-bg', 227),
  (theme_uuid, 'color', 'button-primary', 'focused-border', '{"reference": "var(--color-primary-400)"}', '--color-btn-focused-border', 228);
  
  -- Button colors - Secondary
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'button-secondary', 'bg', '{"reference": "var(--color-white)"}', '--color-btn-secondary-bg', 230),
  (theme_uuid, 'color', 'button-secondary', 'fg', '{"reference": "var(--color-gray-700)"}', '--color-btn-secondary-fg', 231),
  (theme_uuid, 'color', 'button-secondary', 'text', '{"reference": "var(--color-gray-700)"}', '--color-btn-secondary-text', 232),
  (theme_uuid, 'color', 'button-secondary', 'icon', '{"reference": "var(--color-gray-600)"}', '--color-btn-secondary-icon', 233),
  (theme_uuid, 'color', 'button-secondary', 'border', '{"reference": "var(--color-gray-300)"}', '--color-btn-secondary-border', 234),
  (theme_uuid, 'color', 'button-secondary', 'hover', '{"reference": "var(--color-gray-50)"}', '--color-btn-secondary-hover', 235),
  (theme_uuid, 'color', 'button-secondary', 'hover-bg', '{"reference": "var(--color-gray-50)"}', '--color-btn-secondary-hover-bg', 236),
  (theme_uuid, 'color', 'button-secondary', 'pressed-bg', '{"reference": "var(--color-gray-100)"}', '--color-btn-secondary-pressed-bg', 237),
  (theme_uuid, 'color', 'button-secondary', 'disabled-bg', '{"reference": "var(--color-gray-100)"}', '--color-btn-secondary-disabled-bg', 238);
  
  -- Button colors - Ghost
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'button-ghost', 'bg', '{"hex": "transparent"}', '--color-btn-ghost-bg', 240),
  (theme_uuid, 'color', 'button-ghost', 'text', '{"reference": "var(--color-gray-700)"}', '--color-btn-ghost-text', 241),
  (theme_uuid, 'color', 'button-ghost', 'icon', '{"reference": "var(--color-gray-600)"}', '--color-btn-ghost-icon', 242),
  (theme_uuid, 'color', 'button-ghost', 'hover-bg', '{"reference": "var(--color-gray-100)"}', '--color-btn-ghost-hover-bg', 243),
  (theme_uuid, 'color', 'button-ghost', 'pressed-bg', '{"reference": "var(--color-gray-200)"}', '--color-btn-ghost-pressed-bg', 244),
  (theme_uuid, 'color', 'button-ghost', 'disabled-bg', '{"reference": "var(--color-gray-50)"}', '--color-btn-ghost-disabled-bg', 245);
  
  -- Superlative/Accent
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'color', 'superlative', 'primary', '{"reference": "var(--color-primary-600)"}', '--color-superlative-primary', 250),
  (theme_uuid, 'color', 'superlative', 'secondary', '{"reference": "var(--color-primary-100)"}', '--color-superlative-secondary', 251);

  -- ============================================================================
  -- SPACING TOKENS
  -- ============================================================================
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'spacing', 'scale', '0', '{"value": 0}', '--spacing-0', 300),
  (theme_uuid, 'spacing', 'scale', 'px', '{"value": 1, "unit": "px"}', '--spacing-px', 301),
  (theme_uuid, 'spacing', 'scale', '0-5', '{"value": 0.125, "unit": "rem"}', '--spacing-0-5', 302),
  (theme_uuid, 'spacing', 'scale', '1', '{"value": 0.25, "unit": "rem"}', '--spacing-1', 303),
  (theme_uuid, 'spacing', 'scale', '2', '{"value": 0.5, "unit": "rem"}', '--spacing-2', 304),
  (theme_uuid, 'spacing', 'scale', '3', '{"value": 0.75, "unit": "rem"}', '--spacing-3', 305),
  (theme_uuid, 'spacing', 'scale', '4', '{"value": 1, "unit": "rem"}', '--spacing-4', 306),
  (theme_uuid, 'spacing', 'scale', '5', '{"value": 1.25, "unit": "rem"}', '--spacing-5', 307),
  (theme_uuid, 'spacing', 'scale', '6', '{"value": 1.5, "unit": "rem"}', '--spacing-6', 308),
  (theme_uuid, 'spacing', 'scale', '8', '{"value": 2, "unit": "rem"}', '--spacing-8', 309),
  (theme_uuid, 'spacing', 'scale', '10', '{"value": 2.5, "unit": "rem"}', '--spacing-10', 310),
  (theme_uuid, 'spacing', 'scale', '12', '{"value": 3, "unit": "rem"}', '--spacing-12', 311),
  (theme_uuid, 'spacing', 'scale', '16', '{"value": 4, "unit": "rem"}', '--spacing-16', 312);
  
  -- Semantic spacing aliases
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'spacing', 'semantic', '2xs', '{"value": 2, "unit": "px"}', '--spacing-2xs', 320),
  (theme_uuid, 'spacing', 'semantic', 'xs', '{"value": 4, "unit": "px"}', '--spacing-xs', 321),
  (theme_uuid, 'spacing', 'semantic', 'sm', '{"value": 8, "unit": "px"}', '--spacing-sm', 322),
  (theme_uuid, 'spacing', 'semantic', 'md', '{"value": 12, "unit": "px"}', '--spacing-md', 323),
  (theme_uuid, 'spacing', 'semantic', 'lg', '{"value": 16, "unit": "px"}', '--spacing-lg', 324),
  (theme_uuid, 'spacing', 'semantic', 'xl', '{"value": 24, "unit": "px"}', '--spacing-xl', 325),
  (theme_uuid, 'spacing', 'semantic', '2xl', '{"value": 32, "unit": "px"}', '--spacing-2xl', 326),
  (theme_uuid, 'spacing', 'semantic', '3xl', '{"value": 40, "unit": "px"}', '--spacing-3xl', 327),
  (theme_uuid, 'spacing', 'semantic', '4xl', '{"value": 48, "unit": "px"}', '--spacing-4xl', 328);

  -- ============================================================================
  -- RADIUS TOKENS
  -- ============================================================================
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'radius', 'scale', 'none', '{"value": 0}', '--radius-none', 400),
  (theme_uuid, 'radius', 'scale', 'sm', '{"value": 0.25, "unit": "rem"}', '--radius-sm', 401),
  (theme_uuid, 'radius', 'scale', 'md', '{"value": 0.375, "unit": "rem"}', '--radius-md', 402),
  (theme_uuid, 'radius', 'scale', 'lg', '{"value": 0.5, "unit": "rem"}', '--radius-lg', 403),
  (theme_uuid, 'radius', 'scale', 'xl', '{"value": 0.75, "unit": "rem"}', '--radius-xl', 404),
  (theme_uuid, 'radius', 'scale', '2xl', '{"value": 1, "unit": "rem"}', '--radius-2xl', 405),
  (theme_uuid, 'radius', 'scale', 'full', '{"value": 9999, "unit": "px"}', '--radius-full', 406);

  -- ============================================================================
  -- SHADOW TOKENS
  -- ============================================================================
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'shadow', 'elevation', 'xs', '{"value": "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}', '--shadow-xs', 500),
  (theme_uuid, 'shadow', 'elevation', 'sm', '{"value": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"}', '--shadow-sm', 501),
  (theme_uuid, 'shadow', 'elevation', 'md', '{"value": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"}', '--shadow-md', 502),
  (theme_uuid, 'shadow', 'elevation', 'lg', '{"value": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)"}', '--shadow-lg', 503),
  (theme_uuid, 'shadow', 'elevation', 'xl', '{"value": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"}', '--shadow-xl', 504),
  (theme_uuid, 'shadow', 'elevation', 'inner', '{"value": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)"}', '--shadow-inner', 505),
  (theme_uuid, 'shadow', 'elevation', 'none', '{"value": "0 0 #0000"}', '--shadow-none', 506);

  -- ============================================================================
  -- OTHER TOKENS (Transitions, Z-Index)
  -- ============================================================================
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'other', 'transition', 'fast', '{"value": "150ms ease"}', '--transition-fast', 600),
  (theme_uuid, 'other', 'transition', 'base', '{"value": "200ms ease"}', '--transition-base', 601),
  (theme_uuid, 'other', 'transition', 'slow', '{"value": "300ms ease"}', '--transition-slow', 602);
  
  INSERT INTO theme_tokens (theme_id, category, subcategory, name, value, css_variable, sort_order) VALUES
  (theme_uuid, 'other', 'z-index', 'dropdown', '{"value": 100}', '--z-dropdown', 610),
  (theme_uuid, 'other', 'z-index', 'sticky', '{"value": 200}', '--z-sticky', 611),
  (theme_uuid, 'other', 'z-index', 'modal', '{"value": 300}', '--z-modal', 612),
  (theme_uuid, 'other', 'z-index', 'popover', '{"value": 400}', '--z-popover', 613),
  (theme_uuid, 'other', 'z-index', 'tooltip', '{"value": 500}', '--z-tooltip', 614);

END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify the seed was successful:

-- SELECT name, slug, status, is_default, source FROM themes WHERE slug = 'theme-system-default';
-- SELECT category, COUNT(*) as token_count FROM theme_tokens 
--   WHERE theme_id = (SELECT id FROM themes WHERE slug = 'theme-system-default')
--   GROUP BY category ORDER BY category;

