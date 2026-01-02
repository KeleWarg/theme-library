# Chunk Index

## Overview

Total chunks: **42** across **8** phases
Estimated total time: **70-85 hours**

---

## Reading This Document

- Each chunk is identified as `X.YY` (Phase.ChunkNumber)
- Dependencies show which chunks must be complete before starting
- Individual chunk specs are in `chunks/chunk-X.YY.md`

---

## Phase 1: Foundation

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 1.01 | Database Schema | 1h | None | ✅ |
| 1.02 | Theme Service | 2h | 1.01 | ✅ |
| 1.03 | Token Parser | 3h | None | ✅ |
| 1.04 | Parser Tests | 2h | 1.03 | ✅ |

**Phase 1 Total:** 8 hours

---

## Phase 2: Import Flow ⭐ CORE

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 2.01 | Theme Source Modal | 1.5h | None | ✅ |
| 2.02 | File Upload Step | 2h | 1.03 | ✅ |
| 2.03 | Token Mapping Step | 2.5h | 1.03 | ✅ |
| 2.04 | Import Wizard | 3h | 1.02, 2.01, 2.02, 2.03 | ✅ |

**Phase 2 Total:** 9 hours

---

## Phase 3: Editing

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 3.01 | Theme Editor Layout | 2h | 1.02 | ✅ |
| 3.02 | Category Sidebar | 1.5h | 3.01 | ✅ |
| 3.03 | Token Row Editor | 2.5h | 3.01 | ✅ |
| 3.04 | Type-Specific Editors | 3h | 3.03 | ✅ |
| 3.05 | Preview Panel | 2.5h | 3.01, 3.04 | ✅ |

**Phase 3 Total:** 11.5 hours

---

## Phase 4: Creation & Export

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 4.01 | Creation Wizard | 3h | 2.01, 1.02 | ✅ |
| 4.02 | Token Editor Steps | 3h | 4.01, 3.04 | ✅ |
| 4.03 | Export Modal | 1.5h | 1.02 | ✅ |
| 4.04 | Export Generators | 2.5h | 4.03 | ✅ |

**Phase 4 Total:** 10 hours

---

## Phase 5: Integration & Testing

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 5.01 | Themes Page Integration | 2h | Phase 2, Phase 3 | ✅ |
| 5.02 | ThemeCard Updates | 1.5h | 5.01 | ✅ |
| 5.03 | Comprehensive Tests | 4h | All previous | ✅ |

**Phase 5 Total:** 7.5 hours

---

## Phase 6: AI Code Generation

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 6.01 | AI Types & Config | 0.5h | Phase 5 | ✅ |
| 6.02 | Prompt Builder | 1.5h | 6.01 | ✅ |
| 6.03 | Code Generation Service | 2h | 6.02 | ✅ |
| 6.04 | GenerateButton Component | 1h | 6.01 | ✅ |
| 6.05 | FeedbackModal Component | 1h | 6.01 | ✅ |
| 6.06 | ComponentDetail Integration | 2h | 6.03, 6.04 | ✅ |

**Phase 6 Total:** 8 hours

---

## Phase 7: Export + Dashboard

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 7.01 | Export Types & Utils | 1h | Phase 6 | ✅ |
| 7.02 | LLMS.txt Generator | 1.5h | 7.01 | ✅ |
| 7.03 | Package Generator | 2h | 7.01 | ✅ |
| 7.04 | CSS Token Exporter | 1.5h | 7.01 | ✅ |
| 7.05 | Export Modal Component | 2h | 7.02, 7.03, 7.04 | ✅ |
| 7.06 | Settings Page | 1.5h | 7.01 | ✅ |
| 7.07 | Dashboard Stats | 1.5h | 7.01 | ✅ |
| 7.08 | Dashboard Page | 2h | 7.07 | ✅ |

**Phase 7 Total:** 13 hours

---

## Phase 8: AI Platform Export

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 8.01 | AI Export Types | 0.5h | Phase 7 | ✅ |
| 8.02 | Token Utils | 1h | 8.01 | ✅ |
| 8.03 | Cursor Rules Generator | 1h | 8.02 | ✅ |
| 8.04 | Claude Code Generator | 1h | 8.02 | ✅ |
| 8.05 | Project Knowledge Generator | 1h | 8.02 | ✅ |
| 8.06 | MCP Server | 2h | 8.02 | ✅ |
| 8.07 | AI Export Panel | 1.5h | 8.03, 8.04, 8.05 | ✅ |
| 8.08 | Full Package Generator | 1h | 8.01 | ✅ |

**Phase 8 Total:** 9 hours

---

## Phase 9: Figma Plugin (INDEPENDENT)

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 9.01 | Plugin Scaffold | 0.5h | None | ✅ |
| 9.02 | Plugin UI | 1h | 9.01 | ✅ |
| 9.03 | Variable Reader | 1.5h | 9.02 | ✅ |
| 9.04 | Export Logic | 1.5h | 9.03 | ✅ |
| 9.05 | API Sync | 1.5h | 9.02, 9.03, 9.04 | ✅ |
| 9.06 | Manual Testing | 1h | 9.05 | ✅ |

**Phase 9 Total:** 8 hours

**Note:** Phase 9 can run in parallel with Phases 6-8

---

## Dependency Graph

```
Phase 1: Foundation
  1.01 (Schema) ─── 1.02 (Service)
                         │
  1.03 (Parser) ─── 1.04 (Parser Tests)
       │
       ↓
Phase 2: Import Flow ⭐
  2.01 (Modal) ───┐
  2.02 (Upload) ──┼── 2.04 (Wizard)
  2.03 (Mapping) ─┘
                         │
                         ↓
Phase 3: Editing
  3.01 (Layout) ──┬── 3.02 (Sidebar)
                  ├── 3.03 (Row Editor) ── 3.04 (Type Editors)
                  └── 3.05 (Preview) ◄─────────────┘
                         │
                         ↓
Phase 4: Creation & Export
  4.01 (Creation) ── 4.02 (Editor Steps)
  4.03 (Export Modal) ── 4.04 (Generators)
                         │
                         ↓
Phase 5: Integration
  5.01 (Page) ── 5.02 (Card) ── 5.03 (Tests)
                         │
                         ↓
Phase 6: AI Code Generation
  6.01 (Types & Config) ──┬── 6.02 (Prompt Builder) ── 6.03 (Code Gen)
                          ├── 6.04 (GenerateButton) ─────────┐
                          └── 6.05 (FeedbackModal)           │
                                                             ↓
                                               6.06 (ComponentDetail Integration)
                         │
                         ↓
Phase 7: Export + Dashboard
  7.01 (Types & Utils) ──┬── 7.02 (LLMS.txt) ───────┐
                         ├── 7.03 (Package Gen) ────┼── 7.05 (Export Modal)
                         ├── 7.04 (CSS Exporter) ───┘
                         ├── 7.06 (Settings Page)
                         └── 7.07 (Dashboard Stats) ── 7.08 (Dashboard Page)
                         │
                         ↓
Phase 8: AI Platform Export
  8.01 (Types) ── 8.02 (Token Utils) ──┬── 8.03 (Cursor Rules) ────┐
                                       ├── 8.04 (Claude Code) ─────┼── 8.07 (AI Export Panel)
                                       ├── 8.05 (Project Knowledge) ┘
                                       └── 8.06 (MCP Server)
  8.08 (Full Package) ◄── 8.01
```

---

## Critical Path

The minimum path to a working import feature:

```
1.01 → 1.02 → 1.03 → 2.02 → 2.03 → 2.04 → 5.01
```

This path enables: Schema → Service → Parser → Upload → Mapping → Wizard → Integration

**Estimated critical path time:** ~14 hours

---

## Parallelization Opportunities

These chunks can be worked on in parallel:

| Parallel Group | Chunks | Notes |
|----------------|--------|-------|
| Foundation | 1.01 + 1.03 | Schema and parser have no dependencies |
| Import UI | 2.01 + 2.02 + 2.03 | All three steps can be built independently |
| Editor UI | 3.02 + 3.03 | Sidebar and row editor both depend only on layout |
| Export | 4.03 + 4.04 | Modal and generators are coupled but separable |

---

## Gate Checkpoints

| Gate | Trigger | Test File | Status |
|------|---------|-----------|--------|
| Gate 1 | 1.01 + 1.02 + 1.03 complete | `gate-1.test.js` | ✅ |
| Gate 2 | 2.01 + 2.02 + 2.03 complete | `gate-2.test.jsx` | ✅ |
| Gate 3 | 2.04 complete | `gate-3.test.jsx` | ✅ |
| Gate 4 | Phase 3 complete (3.01-3.05) | `gate-4.test.jsx` | ✅ |
| Gate 5 | Phase 4 complete (4.01-4.04) | `gate-5.test.jsx` | ✅ |
| Gate 6 | Phase 5 complete (5.01-5.03) | `full-flow.spec.ts` | ✅ |
| Gate 6A | 6.01 + 6.02 + 6.03 complete | `gate-6a.test.ts` | ✅ |
| Gate 6B | Phase 6 complete (6.01-6.06) | `gate-6b.test.tsx` | ✅ |
| Gate 7A | 7.01 + 7.02 + 7.03 + 7.04 complete | `gate-7a.test.ts` | ⬜ |
| Gate 7B | Phase 7 complete (7.01-7.08) | `gate-7b.test.ts` | ⬜ |
| Gate 8A | 8.01 + 8.02 + 8.03 + 8.04 + 8.05 complete | `gate-8a.test.ts` | ⬜ |
| Gate 8B | Phase 8 complete (8.01-8.08) | `gate-8b.test.ts` | ⬜ |
| Gate 9 | Phase 9 complete (9.01-9.06) | Manual Figma Testing | ⬜ |

---

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked
- 🔍 Needs review
