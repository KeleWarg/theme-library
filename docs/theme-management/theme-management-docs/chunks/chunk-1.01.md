# Chunk 1.01 — Database Schema

## Purpose
Create the Supabase database tables, indexes, and triggers needed to store themes and tokens.

---

## Inputs
- None (foundation chunk)

## Outputs
- `themes` table (consumed by chunk 1.02)
- `theme_tokens` table (consumed by chunk 1.02)
- `theme_versions` table (consumed by chunk 1.02)
- `theme_change_logs` table (consumed by chunk 1.02)

---

## Dependencies
- None

---

## Implementation Notes

### Key Considerations
- Use UUID primary keys for all tables (Supabase default)
- JSONB for token values to handle varying structures
- Foreign key with CASCADE delete for tokens → themes
- Unique constraint on theme slug

### Gotchas
- Remember to create indexes for frequently queried columns
- Trigger for `updated_at` must also update parent theme when tokens change
- Status enum must use CHECK constraint (Supabase doesn't support native enums easily)

### Algorithm/Approach
Execute SQL directly in Supabase SQL Editor. Tables follow the schema defined in 01-research-foundation.md.

---

## Files Created
- `sql/001-create-tables.sql` — Table creation SQL (for version control)

---

## SQL Implementation

```sql
-- Themes table: stores theme metadata
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

-- Theme tokens table: stores individual design tokens
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

-- Theme versions table: stores snapshots for version control
CREATE TABLE IF NOT EXISTS theme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  version_number VARCHAR(20) NOT NULL,
  tokens_snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Theme change logs: tracks individual changes for audit
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_theme_tokens_theme_id ON theme_tokens(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_tokens_category ON theme_tokens(category);
CREATE INDEX IF NOT EXISTS idx_theme_versions_theme_id ON theme_versions(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_change_logs_theme_id ON theme_change_logs(theme_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_theme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF TG_TABLE_NAME = 'theme_tokens' THEN
    UPDATE themes SET updated_at = NOW() WHERE id = NEW.theme_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to themes
DROP TRIGGER IF EXISTS themes_updated_at ON themes;
CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();

-- Apply trigger to tokens
DROP TRIGGER IF EXISTS theme_tokens_updated_at ON theme_tokens;
CREATE TRIGGER theme_tokens_updated_at
  BEFORE UPDATE ON theme_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_updated_at();
```

---

## Tests

### Unit Tests
- [ ] N/A (database schema, tested via integration)

### Integration Tests
- [ ] Verify all 4 tables exist after running SQL
- [ ] Verify indexes exist
- [ ] Verify triggers fire on update

### Verification
- [ ] Run SQL in Supabase SQL Editor without errors
- [ ] Check Table Editor shows all tables
- [ ] Insert test theme, verify `created_at` populated
- [ ] Update test theme, verify `updated_at` changes
- [ ] Delete theme, verify tokens cascade delete

---

## Time Estimate
1 hour

---

## Notes
- SQL should be saved in project repo for version control even though it's run manually
- Consider adding RLS (Row Level Security) policies in future for multi-tenant support
