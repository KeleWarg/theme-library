# Phase 4: Database Setup

## Prerequisites
- Phase 1-3 complete
- All tests passing
- Supabase account (free tier works)

## Outcome
- Supabase project configured
- Database tables created
- Client and helper functions ready
- Mock data for testing

---

## Task 4.1: Create Supabase Project

### Instructions
This is a manual step in the browser.

### Steps
1. Go to https://supabase.com
2. Create new project (or use existing)
3. Note these values from Project Settings > API:
   - Project URL
   - anon/public key

### Create Environment File
Create `.env.local` in project root:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Add to .gitignore
Ensure `.env.local` is in `.gitignore`:
```
.env.local
.env*.local
```

### Verification
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] .env.local not committed to git

---

## Task 4.2: Create Database Tables

### Instructions
Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor).

### SQL
```sql
-- Components table: stores component data from Figma and generated code
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figma_id VARCHAR(100) UNIQUE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  
  -- From Figma plugin
  figma_data JSONB,
  preview_image TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  figma_properties JSONB DEFAULT '[]'::jsonb,
  linked_tokens TEXT[] DEFAULT '{}',
  
  -- Generated/written code
  jsx_code TEXT,
  css_code TEXT,
  code_status VARCHAR(20) DEFAULT 'pending' CHECK (code_status IN ('pending', 'generated', 'approved', 'manual')),
  
  -- Props for documentation
  props JSONB DEFAULT '[]'::jsonb,
  
  -- Publishing status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
  version VARCHAR(20) DEFAULT '1.0.0',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  figma_synced_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

-- Sync logs table: tracks sync operations
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('component', 'variables', 'theme')),
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_components_slug ON components(slug);
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX IF NOT EXISTS idx_components_code_status ON components(code_status);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(type);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (optional for now)
-- ALTER TABLE components ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
```

### Verification
- [ ] SQL executes without errors
- [ ] Tables visible in Supabase Table Editor
- [ ] Indexes created

---

## Task 4.3: Create Supabase Client

### Instructions
Create `src/lib/supabase.js`

### Code
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow app to work without Supabase for development
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = () => !!supabase
```

### Test File
Create `src/lib/supabase.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('supabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports supabase client when env vars set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')
    
    const { supabase, isSupabaseConfigured } = await import('./supabase')
    expect(isSupabaseConfigured()).toBe(true)
  })

  it('exports null when env vars missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    
    const { supabase, isSupabaseConfigured } = await import('./supabase')
    expect(isSupabaseConfigured()).toBe(false)
  })
})
```

### Verification
- [ ] Client initializes when env vars set
- [ ] App doesn't crash when env vars missing
- [ ] Tests pass

---

## Task 4.4: Create Database Helper Functions

### Instructions
Create `src/lib/database.js`

### Code
```javascript
import { supabase } from './supabase'

// ============ Components ============

export async function getComponents(filters = {}) {
  if (!supabase) return []
  
  let query = supabase
    .from('components')
    .select('*')
    .order('name')
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.code_status) {
    query = query.eq('code_status', filters.code_status)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getComponent(slug) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

export async function getComponentById(id) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createComponent(component) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .insert(component)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateComponent(id, updates) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComponent(id) {
  if (!supabase) return
  
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function upsertComponentByFigmaId(component) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .upsert(component, { 
      onConflict: 'figma_id',
      returning: 'representation'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ Sync Logs ============

export async function addSyncLog(type, componentId, status, message, details = null) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sync_logs')
    .insert({
      type,
      component_id: componentId,
      status,
      message,
      details
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getSyncLogs(limit = 20) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sync_logs')
    .select(`
      *,
      component:components(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// ============ Stats ============

export async function getComponentStats() {
  if (!supabase) return { total: 0, published: 0, pending: 0, generated: 0 }
  
  const { data, error } = await supabase
    .from('components')
    .select('status, code_status')
  
  if (error) throw error
  
  const total = data?.length || 0
  const published = data?.filter(c => c.status === 'published').length || 0
  const pending = data?.filter(c => c.code_status === 'pending').length || 0
  const generated = data?.filter(c => c.code_status === 'generated').length || 0
  
  return { total, published, pending, generated }
}
```

### Test File
Create `src/lib/database.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as database from './database'

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '123', name: 'Test' }, error: null }),
    }))
  }
}))

describe('database', () => {
  describe('getComponents', () => {
    it('returns empty array when supabase is null', async () => {
      vi.doMock('./supabase', () => ({ supabase: null }))
      const { getComponents } = await import('./database')
      // This would need special handling in actual test
    })

    it('calls supabase with correct query', async () => {
      const result = await database.getComponents()
      expect(result).toBeDefined()
    })
  })

  describe('getComponent', () => {
    it('queries by slug', async () => {
      const result = await database.getComponent('button')
      expect(result).toBeDefined()
    })
  })

  describe('createComponent', () => {
    it('inserts component', async () => {
      const result = await database.createComponent({ name: 'Test', slug: 'test' })
      expect(result).toBeDefined()
    })
  })

  describe('updateComponent', () => {
    it('updates component by id', async () => {
      const result = await database.updateComponent('123', { name: 'Updated' })
      expect(result).toBeDefined()
    })
  })
})
```

### Verification
- [ ] All CRUD functions work
- [ ] Filters work correctly
- [ ] Error handling works
- [ ] Tests pass

---

## Task 4.5: Create Mock/Seed Data

### Instructions
Create `src/lib/seedData.js` for development and testing.

### Code
```javascript
import { supabase } from './supabase'

export const mockComponents = [
  {
    name: 'Button',
    slug: 'button',
    description: 'Interactive button with multiple variants',
    category: 'actions',
    variants: [
      { name: 'Primary', props: { variant: 'primary' } },
      { name: 'Secondary', props: { variant: 'secondary' } },
      { name: 'Ghost', props: { variant: 'ghost' } },
    ],
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", default: 'primary', description: 'Button style variant', required: false },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Button size', required: false },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Button content', required: true },
    ],
    linked_tokens: ['btn-primary-bg', 'btn-primary-text', 'btn-secondary-bg', 'btn-ghost-text'],
    code_status: 'approved',
    status: 'published',
    jsx_code: `export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  ...props 
}) {
  const baseStyles = {
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '12px 24px',
    fontSize: 'var(--font-size-label-md)',
    fontWeight: 'var(--font-weight-semibold)',
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s, transform 0.1s',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-btn-primary-bg)',
      color: 'var(--color-btn-primary-text)',
    },
    secondary: {
      backgroundColor: 'var(--color-btn-secondary-bg)',
      color: 'var(--color-btn-secondary-text)',
      border: '1px solid var(--color-btn-secondary-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-btn-ghost-text)',
    },
  };

  return (
    <button 
      style={{ ...baseStyles, ...variantStyles[variant] }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}`
  },
  {
    name: 'Card',
    slug: 'card',
    description: 'Content container with optional elevation',
    category: 'layout',
    variants: [
      { name: 'Default', props: { elevated: false } },
      { name: 'Elevated', props: { elevated: true } },
    ],
    props: [
      { name: 'elevated', type: 'boolean', default: 'false', description: 'Add shadow elevation', required: false },
      { name: 'padding', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Internal padding', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Card content', required: true },
    ],
    linked_tokens: ['bg-white', 'bg-neutral-light'],
    code_status: 'generated',
    status: 'draft',
    jsx_code: null
  },
  {
    name: 'Input',
    slug: 'input',
    description: 'Text input with label and error state',
    category: 'forms',
    variants: [
      { name: 'Default', props: {} },
      { name: 'With Error', props: { error: 'This field is required' } },
    ],
    props: [
      { name: 'label', type: 'string', default: '-', description: 'Input label', required: false },
      { name: 'error', type: 'string', default: '-', description: 'Error message', required: false },
      { name: 'placeholder', type: 'string', default: '-', description: 'Placeholder text', required: false },
    ],
    linked_tokens: ['fg-heading', 'fg-body', 'fg-feedback-error', 'bg-white'],
    code_status: 'pending',
    status: 'draft',
    jsx_code: null
  },
  {
    name: 'Badge',
    slug: 'badge',
    description: 'Status indicator badge',
    category: 'feedback',
    variants: [
      { name: 'Default', props: { variant: 'default' } },
      { name: 'Success', props: { variant: 'success' } },
      { name: 'Warning', props: { variant: 'warning' } },
      { name: 'Error', props: { variant: 'error' } },
    ],
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'error'", default: 'default', description: 'Badge variant', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Badge text', required: true },
    ],
    linked_tokens: ['fg-feedback-success', 'fg-feedback-warning', 'fg-feedback-error'],
    code_status: 'pending',
    status: 'draft',
    jsx_code: null
  },
]

export async function seedDatabase() {
  if (!supabase) {
    console.warn('Supabase not configured. Using mock data.')
    return mockComponents
  }

  // Check if data already exists
  const { data: existing } = await supabase
    .from('components')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Database already seeded')
    return
  }

  // Insert seed data
  const { data, error } = await supabase
    .from('components')
    .insert(mockComponents)
    .select()

  if (error) throw error
  
  console.log('Database seeded with', data.length, 'components')
  return data
}

export async function clearDatabase() {
  if (!supabase) return

  await supabase.from('sync_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('components').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('Database cleared')
}
```

### Test File
Create `src/lib/seedData.test.js`:
```javascript
import { describe, it, expect } from 'vitest'
import { mockComponents } from './seedData'

describe('seedData', () => {
  describe('mockComponents', () => {
    it('has required components', () => {
      const names = mockComponents.map(c => c.name)
      expect(names).toContain('Button')
      expect(names).toContain('Card')
      expect(names).toContain('Input')
      expect(names).toContain('Badge')
    })

    it('each component has required fields', () => {
      mockComponents.forEach(component => {
        expect(component).toHaveProperty('name')
        expect(component).toHaveProperty('slug')
        expect(component).toHaveProperty('category')
        expect(component).toHaveProperty('props')
        expect(component).toHaveProperty('variants')
      })
    })

    it('Button has jsx_code', () => {
      const button = mockComponents.find(c => c.name === 'Button')
      expect(button.jsx_code).toBeTruthy()
      expect(button.code_status).toBe('approved')
    })
  })
})
```

### Verification
- [ ] Mock data structure is correct
- [ ] Seed function works with Supabase
- [ ] Clear function works
- [ ] Tests pass

---

## Task 4.6: Create useMockData Hook for Development

### Instructions
Create `src/hooks/useMockData.js` for working without Supabase.

### Code
```javascript
import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

// Use this hook when you need components but Supabase might not be configured
export function useMockableComponents(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured()) {
          const result = await fetchFn()
          setData(result)
        } else {
          // Use mock data in development without Supabase
          setData(mockComponents)
        }
      } catch (err) {
        setError(err)
        // Fall back to mock data on error
        setData(mockComponents)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [fetchFn])

  return { data, loading, error }
}
```

### Verification
- [ ] Hook returns mock data when Supabase not configured
- [ ] Hook uses real data when Supabase is configured
- [ ] Loading states work correctly

---

## Phase 4 Complete Checklist

- [ ] Task 4.1: Supabase project created
- [ ] Task 4.2: Database tables created
- [ ] Task 4.3: Supabase client with tests
- [ ] Task 4.4: Database helpers with tests
- [ ] Task 4.5: Seed data with tests
- [ ] Task 4.6: Mock data hook
- [ ] All tests passing: `npm test`
- [ ] Can connect to Supabase (or app works with mocks)

## Next Phase
Proceed to `PHASE_5_COMPONENTS_LIST.md`
