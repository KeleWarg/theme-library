-- Theme Management System Database Schema
-- Version: 1.0.0
-- Chunk: 1.01 - Database Schema
-- 
-- Run this SQL in Supabase SQL Editor to create all required tables
-- for the Theme Management System.

-- ============================================================================
-- THEMES TABLE
-- Stores theme metadata (name, slug, status, source info)
-- ============================================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_default BOOLEAN DEFAULT false,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'figma')),
  source_file_name VARCHAR(255),
  version VARCHAR(20) DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by VARCHAR(100)
);

-- ============================================================================
-- THEME TOKENS TABLE
-- Stores individual design tokens with JSONB values for flexibility
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other')),
  subcategory VARCHAR(100),
  group_name VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  css_variable VARCHAR(150),
  figma_variable_id VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, category, name)
);

-- ============================================================================
-- THEME VERSIONS TABLE
-- Stores snapshots for version control (future feature)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  version_number VARCHAR(20) NOT NULL,
  tokens_snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- ============================================================================
-- THEME CHANGE LOGS TABLE
-- Tracks individual changes for audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  token_id UUID REFERENCES theme_tokens(id) ON DELETE SET NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'publish')),
  field_changed VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by VARCHAR(100)
);

-- ============================================================================
-- INDEXES
-- Performance optimization for frequently queried columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_theme_tokens_theme_id ON theme_tokens(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_tokens_category ON theme_tokens(category);
CREATE INDEX IF NOT EXISTS idx_theme_versions_theme_id ON theme_versions(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_change_logs_theme_id ON theme_change_logs(theme_id);

-- ============================================================================
-- TRIGGERS
-- Auto-update timestamps on record changes
-- ============================================================================

-- Trigger function that updates updated_at and propagates to parent theme
CREATE OR REPLACE FUNCTION update_theme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- When a token is updated, also update the parent theme's updated_at
  IF TG_TABLE_NAME = 'theme_tokens' THEN
    UPDATE themes SET updated_at = NOW() WHERE id = NEW.theme_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to themes table
DROP TRIGGER IF EXISTS themes_updated_at ON themes;
CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();

-- Apply trigger to theme_tokens table
DROP TRIGGER IF EXISTS theme_tokens_updated_at ON theme_tokens;
CREATE TRIGGER theme_tokens_updated_at
  BEFORE UPDATE ON theme_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();

-- ============================================================================
-- VERIFICATION QUERIES (run after creating tables)
-- ============================================================================
-- Uncomment and run these to verify the schema was created correctly:
--
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'theme%';
--
-- SELECT indexname FROM pg_indexes WHERE tablename LIKE 'theme%';
--
-- SELECT trigger_name, event_object_table FROM information_schema.triggers 
-- WHERE trigger_schema = 'public';

