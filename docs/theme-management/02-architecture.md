# Architecture Document

## System Overview

The Theme Management System enables users to import, create, edit, and export design system themes within the AI Design System Tool. It transforms read-only JSON token files into a fully editable database-backed system with visual editors, live preview, and multi-format export capabilities.

---

## Phase Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: FOUNDATION (4 chunks)                             │
│  Database schema, services, token parser                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: IMPORT FLOW (4 chunks) ⭐ THE CORE                │
│  File upload, token mapping, import wizard                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: EDITING (5 chunks)                                │
│  Theme editor, token editors, preview panel                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: CREATION & EXPORT (4 chunks)                      │
│  Creation wizard, export modal, format generators           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: INTEGRATION & TESTING (3 chunks)                  │
│  UI integration, comprehensive tests, polish                │
└─────────────────────────────────────────────────────────────┘
```

---

## Critical Path

> **Phase 2 is THE CORE** — The Import Flow establishes the fundamental data transformation from external JSON to editable database records. Everything before it (foundation) enables it; everything after (editing, export) consumes its output. If import doesn't work correctly, nothing else matters.

---

## Data Flow

```
[Figma Variables JSON]
    ↓
[Token Parser] → validates, extracts tokens, detects categories
    ↓
[Parsed Tokens Array]
    ↓
[Import Wizard] → user reviews mapping, enters theme details
    ↓
[Theme Service] → creates theme record, bulk inserts tokens
    ↓
[Supabase Database]
    ↓
[Theme Editor] ← loads theme + tokens
    ↓
[Token Editors] → type-specific editing (color picker, etc.)
    ↓
[Preview Panel] ← real-time CSS variable updates
    ↓
[Export Generator] → CSS/JSON/Tailwind/SCSS output
    ↓
[Download/Clipboard]
```

### Detailed Flow Description

1. **Import Entry** — User uploads JSON file via drag-and-drop or file picker
2. **Validation** — Parser checks JSON structure, identifies token types
3. **Token Extraction** — Recursive traversal extracts tokens with path, type, value, metadata
4. **Category Mapping** — Auto-detect categories from paths; user can override
5. **Theme Creation** — User enters name/slug/description; system validates uniqueness
6. **Database Persistence** — Theme record created, tokens bulk-inserted with foreign key
7. **Editor Loading** — Theme page fetches theme + tokens, groups by category
8. **Token Editing** — User modifies values via type-specific editors
9. **Change Tracking** — Modifications tracked for undo/redo and audit log
10. **Preview Update** — CSS variables regenerated and applied to preview components
11. **Export** — User selects format; generator produces output; download or copy

---

## Key Types (Contracts)

These types define the interfaces between phases:

```
Theme (Database Record)
  - id: UUID — Primary key
  - name: string — Display name (max 100 chars)
  - slug: string — URL/CSS-safe identifier (unique)
  - description: string | null — Optional description
  - status: 'draft' | 'published' | 'archived'
  - source: 'manual' | 'import' | 'figma'
  - source_file_name: string | null — Original filename if imported
  - created_at: timestamp
  - updated_at: timestamp
  - published_at: timestamp | null

ThemeToken (Database Record)
  - id: UUID — Primary key
  - theme_id: UUID — Foreign key to themes
  - category: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius' | 'grid' | 'other'
  - subcategory: string | null — Second-level grouping
  - group_name: string | null — Top-level path segment
  - name: string — Token name
  - value: JSONB — Type-specific value object
  - css_variable: string — Generated CSS variable name
  - figma_variable_id: string | null — Preserved Figma ID
  - sort_order: integer — Display ordering
  - created_at: timestamp
  - updated_at: timestamp

ParsedToken (Parser Output)
  - name: string
  - category: string
  - subcategory: string | null
  - group_name: string | null
  - value: any — Parsed value (structure varies by type)
  - type: string — Token type from $type
  - css_variable: string — Generated CSS variable
  - figma_variable_id: string | null
  - alias_reference: string | null — Target variable name if alias
  - path: string — Full path (e.g., "Color/Button/Primary/primary-bg")
  - sort_order: number

ParseResult (Parser Return)
  - tokens: ParsedToken[]
  - errors: string[]
  - warnings: string[]
  - metadata: { totalTokens: number, categories: Record<string, number> }

ThemeDetails (Form Data)
  - name: string
  - slug: string
  - description: string
  - isValid: boolean

ExportOptions
  - format: 'css' | 'json' | 'tailwind' | 'scss'
  - includeComments: boolean
  - minify: boolean
  - scopeToClass: string | null
  - includeFallbacks: boolean
```

---

## Phase Details

### Phase 1: Foundation

**Purpose:** Establish database schema, service layer, and token parsing infrastructure

| Chunk | Name | Purpose |
|-------|------|---------|
| 1.01 | Database Schema | Create tables, indexes, triggers in Supabase |
| 1.02 | Theme Service | CRUD operations for themes and tokens |
| 1.03 | Token Parser | Parse Figma Variables JSON to ParsedToken[] |
| 1.04 | Parser Tests | Comprehensive tests for parser edge cases |

**Phase 1 Test Checkpoint:**
- [ ] All tables exist in Supabase with correct constraints
- [ ] Theme CRUD operations work (create, read, update, delete)
- [ ] Token CRUD operations work with cascade delete
- [ ] Parser correctly handles all 5 project JSON files
- [ ] Parser tests cover edge cases (empty, malformed, large files)

---

### Phase 2: Import Flow ⭐

**Purpose:** Enable users to upload JSON files and import tokens into the database

| Chunk | Name | Purpose |
|-------|------|---------|
| 2.01 | Theme Source Modal | Entry point UI for import vs. create |
| 2.02 | File Upload Step | Drag-and-drop JSON upload with validation |
| 2.03 | Token Mapping Step | Review/adjust category assignments |
| 2.04 | Import Wizard | Complete wizard with details + review steps |

**Phase 2 Test Checkpoint:**
- [ ] Source modal opens from Themes page
- [ ] File upload accepts valid JSON, rejects invalid
- [ ] Token mapping shows correct category detection
- [ ] Category overrides persist through wizard
- [ ] Import creates theme + tokens in database
- [ ] Imported theme appears in Themes list

---

### Phase 3: Editing

**Purpose:** Provide full editing capabilities for themes and tokens

| Chunk | Name | Purpose |
|-------|------|---------|
| 3.01 | Theme Editor Layout | Two-panel layout with sidebar + editor |
| 3.02 | Category Sidebar | Navigate between token categories |
| 3.03 | Token Row Editor | Inline editing for individual tokens |
| 3.04 | Type-Specific Editors | Color picker, number input, shadow editor |
| 3.05 | Preview Panel | Live component preview with viewport toggle |

**Phase 3 Test Checkpoint:**
- [ ] Editor loads theme with all tokens
- [ ] Category navigation works
- [ ] Token values can be edited and saved
- [ ] Color picker shows correct value and updates on change
- [ ] Preview updates when tokens change
- [ ] Unsaved changes indicator works
- [ ] Auto-save triggers after 60 seconds

---

### Phase 4: Creation & Export

**Purpose:** Enable theme creation from scratch and export to multiple formats

| Chunk | Name | Purpose |
|-------|------|---------|
| 4.01 | Creation Wizard | Guided theme creation with templates |
| 4.02 | Token Editor Steps | Color, typography, spacing editor steps |
| 4.03 | Export Modal | Format selection and options UI |
| 4.04 | Export Generators | CSS, JSON, Tailwind, SCSS generators |

**Phase 4 Test Checkpoint:**
- [ ] Creation wizard completes with all required fields
- [ ] Templates pre-populate appropriate tokens
- [ ] Export modal shows format options
- [ ] CSS export produces valid CSS custom properties
- [ ] JSON export produces Figma-compatible structure
- [ ] Tailwind export produces valid config object
- [ ] Download and clipboard copy work

---

### Phase 5: Integration & Testing

**Purpose:** Integrate all features, update existing UI, comprehensive testing

| Chunk | Name | Purpose |
|-------|------|---------|
| 5.01 | Themes Page Integration | Update Themes page with new features |
| 5.02 | ThemeCard Updates | Add edit/delete/duplicate actions |
| 5.03 | Comprehensive Tests | Integration tests, E2E tests, edge cases |

**Phase 5 Test Checkpoint:**
- [ ] Themes page shows database themes + static themes
- [ ] Create button opens source modal
- [ ] Edit navigates to editor
- [ ] Delete removes theme with confirmation
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass for import flow
- [ ] E2E tests pass for edit flow
- [ ] E2E tests pass for export flow

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + Vite | Existing project stack |
| State | React hooks (useState, useEffect) | Simple local state; no global needed |
| Database | Supabase (PostgreSQL) | Existing project infrastructure |
| Styling | CSS Modules + CSS Variables | Matches existing approach |
| Icons | Lucide React | Already in project |
| Testing | Vitest + React Testing Library | Existing test setup |
| E2E Testing | Playwright | Industry standard, good DX |

---

## External Dependencies

| Dependency | Purpose | Risk Level |
|------------|---------|------------|
| Supabase | Database + Auth | Low — already integrated |
| Lucide React | Icons | Low — stable, no breaking changes |
| Playwright | E2E tests | Low — dev dependency only |
| None for parsing | Pure JS implementation | None — no external parser deps |
