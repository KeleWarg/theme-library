# Chunk Index

## Overview

Total chunks: **20** across **5** phases
Estimated total time: **40-55 hours**

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

---

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked
- 🔍 Needs review
