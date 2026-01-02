# Chunk Index

## Overview

Total chunks: **48** across **9** phases  
Estimated total time: **72-87 hours**

| Phases | Feature | Chunks | Status |
|--------|---------|--------|--------|
| 1-5 | Theme Management | 20 | ✅ Complete |
| 6-9 | AI Gen, Export, Figma | 28 | ⬜ Not Started |

---

## Reading This Document

- Each chunk is identified as `X.YY` (Phase.ChunkNumber)
- Dependencies show which chunks must be complete before starting
- Individual chunk specs are in `chunks/chunk-X.YY.md` or `chunks/phase-X-chunks.md`
- Gate checkpoints must pass before crossing phase boundaries

---

## Phase 1: Foundation ✅

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 1.01 | Database Schema | 1h | None | ✅ |
| 1.02 | Theme Service | 2h | 1.01 | ✅ |
| 1.03 | Token Parser | 3h | None | ✅ |
| 1.04 | Parser Tests | 2h | 1.03 | ✅ |

**Phase 1 Total:** 8 hours ✅

---

## Phase 2: Import Flow ✅

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 2.01 | Theme Source Modal | 1.5h | None | ✅ |
| 2.02 | File Upload Step | 2h | 1.03 | ✅ |
| 2.03 | Token Mapping Step | 2.5h | 1.03 | ✅ |
| 2.04 | Import Wizard | 3h | 1.02, 2.01, 2.02, 2.03 | ✅ |

**Phase 2 Total:** 9 hours ✅

---

## Phase 3: Editing ✅

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 3.01 | Theme Editor Layout | 2h | 1.02 | ✅ |
| 3.02 | Category Sidebar | 1.5h | 3.01 | ✅ |
| 3.03 | Token Row Editor | 2.5h | 3.01 | ✅ |
| 3.04 | Type-Specific Editors | 3h | 3.03 | ✅ |
| 3.05 | Preview Panel | 2.5h | 3.01, 3.04 | ✅ |

**Phase 3 Total:** 11.5 hours ✅

---

## Phase 4: Creation & Export ✅

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 4.01 | Creation Wizard | 3h | 2.01, 1.02 | ✅ |
| 4.02 | Token Editor Steps | 3h | 4.01, 3.04 | ✅ |
| 4.03 | Export Modal | 1.5h | 1.02 | ✅ |
| 4.04 | Export Generators | 2.5h | 4.03 | ✅ |

**Phase 4 Total:** 10 hours ✅

---

## Phase 5: Integration & Testing ✅

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 5.01 | Themes Page Integration | 2h | Phase 2, Phase 3 | ✅ |
| 5.02 | ThemeCard Updates | 1.5h | 5.01 | ✅ |
| 5.03 | Comprehensive Tests | 4h | All previous | ✅ |

**Phase 5 Total:** 7.5 hours ✅

---

## Phase 6: AI Code Generation ⭐ START HERE

Generates React component code from Figma specs using Claude API.

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 6.01 | AI Types & Config | 0.5h | Phase 5 ✅ | ⬜ |
| 6.02 | Prompt Builder | 1.5h | 6.01 | ⬜ |
| 6.03 | Code Generation Service | 2h | 6.02 | ⬜ |
| 6.04 | GenerateButton Component | 1h | 6.01 | ⬜ |
| 6.05 | FeedbackModal Component | 1h | 6.01 | ⬜ |
| 6.06 | ComponentDetail Integration | 2h | 6.03, 6.04, 6.05 | ⬜ |

**Phase 6 Total:** 8 hours

**Parallelization:** After 6.01, run 6.02 + 6.04 + 6.05 in parallel (3 agents)

---

## Phase 7: Export System + Dashboard

Package export, LLMS.txt generation, and dashboard UI.

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 7.01 | Export Types & Utils | 1h | Phase 6 ✅ | ⬜ |
| 7.02 | LLMS.txt Generator | 1.5h | 7.01 | ⬜ |
| 7.03 | Package Generator | 1.5h | 7.01, 7.02 | ⬜ |
| 7.04 | CSS Token Exporter | 1h | 7.01 | ⬜ |
| 7.05 | Export Modal Component | 1.5h | 7.03 | ⬜ |
| 7.06 | Settings Page | 1.5h | 7.05 | ⬜ |
| 7.07 | Dashboard Stats | 1h | Phase 6 ✅ | ⬜ |
| 7.08 | Dashboard Page | 1h | 7.07 | ⬜ |

**Phase 7 Total:** 10 hours

**Parallelization:** After 7.01, run 7.02 + 7.04 + 7.07 in parallel (3 agents)

---

## Phase 8: AI Platform Export

Extends Phase 7 with Cursor, Claude Code, Bolt/Lovable, and MCP support.

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 8.01 | AI Export Types | 0.5h | Phase 7 ✅ | ⬜ |
| 8.02 | Token Utils | 0.5h | 8.01 | ⬜ |
| 8.03 | Cursor Rules Generator | 1h | 8.02 | ⬜ |
| 8.04 | Claude Code Generator | 1h | 8.02 | ⬜ |
| 8.05 | Project Knowledge Generator | 0.5h | 8.02 | ⬜ |
| 8.06 | MCP Server | 2h | 8.01 | ⬜ |
| 8.07 | AI Export Panel | 1.5h | 8.03, 8.04, 8.05 | ⬜ |
| 8.08 | Full Package + Integration | 1h | 8.07, 8.06 | ⬜ |

**Phase 8 Total:** 8 hours

**Parallelization:** After 8.01, run 8.02 + 8.06 in parallel. After 8.02, run 8.03 + 8.04 + 8.05 in parallel.

---

## Phase 9: Figma Plugin (PARALLEL TRACK)

Standalone Figma plugin — can run independently of Phases 6-8.

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 9.01 | Plugin Scaffold | 0.5h | None | ⬜ |
| 9.02 | Plugin UI | 1h | 9.01 | ⬜ |
| 9.03 | Variable Reader | 1.5h | 9.02 | ⬜ |
| 9.04 | Export Logic | 1.5h | 9.03 | ⬜ |
| 9.05 | API Sync | 1h | 9.04, 1.02 ✅ | ⬜ |
| 9.06 | Plugin Testing | 0.5h | 9.05 | ⬜ |

**Phase 9 Total:** 6 hours

**Note:** Phase 9 has NO dependencies on Phases 6-8 and can run entirely in parallel.

---

## Dependency Graph

```
COMPLETED ════════════════════════════════════════════════════════════════════
Phase 1: Foundation ✅
  1.01 (Schema) ─── 1.02 (Service)
  1.03 (Parser) ─── 1.04 (Parser Tests)

Phase 2: Import Flow ✅
  2.01 (Modal) ───┐
  2.02 (Upload) ──┼── 2.04 (Wizard)
  2.03 (Mapping) ─┘

Phase 3: Editing ✅
  3.01 (Layout) ──┬── 3.02 (Sidebar)
                  ├── 3.03 (Row Editor) ── 3.04 (Type Editors)
                  └── 3.05 (Preview) ◄─────────────────────────┘

Phase 4: Creation & Export ✅
  4.01 (Creation) ── 4.02 (Editor Steps)
  4.03 (Export Modal) ── 4.04 (Generators)

Phase 5: Integration ✅
  5.01 (Page) ── 5.02 (Card) ── 5.03 (Tests)

NEW ══════════════════════════════════════════════════════════════════════════

Phase 5 ✅ ──────────────────────────────────┐
       │                                     │
       ▼                                     ▼
Phase 6: AI Code Gen                   Phase 9: Figma Plugin
  6.01 ─────────────────┐              (PARALLEL - no deps)
    │                   │                9.01
  ┌─┼─┐                 │                  │
  ▼ ▼ ▼                 │                  ▼
6.02 6.04 6.05          │                9.02
  │   │   │             │                  │
  ▼   │   │             │                  ▼
6.03  │   │             │                9.03
  │   │   │             │                  │
  └───┴───┘             │                  ▼
       │                │                9.04
       ▼                │                  │
     6.06               │                  ▼
       │                │                9.05
       ▼                │                  │
Phase 7: Export         │                  ▼
  7.01 ─────────────┐   │                9.06
    │               │   │
  ┌─┼───┐           │   │
  ▼ ▼   ▼           │   │
7.02 7.04 7.07      │   │
  │       │         │   │
  ▼       │         │   │
7.03      │         │   │
  │       │         │   │
  ▼       ▼         │   │
7.05    7.08        │   │
  │                 │   │
  ▼                 │   │
7.06                │   │
       │            │   │
       ▼            │   │
Phase 8: AI Export  │   │
  8.01 ─────────┐   │   │
    │           │   │   │
  ┌─┴─┐         │   │   │
  ▼   ▼         │   │   │
8.02  8.06      │   │   │
  │     │       │   │   │
┌─┼─┐   │       │   │   │
▼ ▼ ▼   │       │   │   │
8.03 8.04 8.05  │   │   │
  └──┼──┘       │   │   │
     ▼          │   │   │
   8.07 ◄───────┘   │   │
     │              │   │
     ▼              │   │
   8.08             │   │
```

---

## Gate Checkpoints

### Completed Gates (Phases 1-5)

| Gate | Trigger | Test File | Status |
|------|---------|-----------|--------|
| Gate 1 | 1.01 + 1.02 + 1.03 | `gate-1.test.js` | ✅ |
| Gate 2 | 2.01 + 2.02 + 2.03 | `gate-2.test.jsx` | ✅ |
| Gate 3 | 2.04 complete | `gate-3.test.jsx` | ✅ |
| Gate 4 | Phase 3 complete | `gate-4.test.jsx` | ✅ |
| Gate 5 | Phase 4 complete | `gate-5.test.jsx` | ✅ |
| Gate 6 | Phase 5 complete | `full-flow.spec.ts` | ✅ |

### New Gates (Phases 6-9)

| Gate | Trigger | Test Command | Status |
|------|---------|--------------|--------|
| Gate 6A | 6.01-6.03 ✅ | `npm test tests/integration/gate-6a.test.ts` | ⬜ |
| Gate 6B | Phase 6 ✅ | `npm test tests/integration/gate-6b.test.tsx` | ⬜ |
| Gate 7A | 7.01-7.03 ✅ | `npm test tests/integration/gate-7a.test.ts` | ⬜ |
| Gate 7B | Phase 7 ✅ | `npm test tests/integration/gate-7b.test.tsx` | ⬜ |
| Gate 8A | 8.01-8.05 ✅ | `npm test tests/integration/gate-8a.test.ts` | ⬜ |
| Gate 8B | Phase 8 ✅ | `npm test tests/integration/gate-8b.test.tsx` | ⬜ |
| Gate 9 | Phase 9 ✅ | Manual Figma testing | ⬜ |

---

## Optimal Execution Strategy

### With 4 Agents

```
Agent 1: 6.01→6.02→6.03→6.06 → 7.01→7.02→7.03→7.05→7.06 → 8.01→8.02→8.03→8.07→8.08
Agent 2: ────────6.04──────── → ─────7.04───────────────── → ─────8.04──────────┘
Agent 3: ────────6.05──────── → ─────7.07→7.08──────────── → ─────8.05──────────┘
Agent 4: 9.01→9.02→9.03→9.04→9.05→9.06 (entirely independent)
```

### Timeline

| Agents | Est. Time for Phases 6-9 |
|--------|--------------------------|
| 1 | ~32 hours |
| 2 | ~18 hours |
| 4 | ~12 hours |

---

## Quick Start Commands

### Check Status
```
Check docs/theme-management/03-chunk-index.md and tell me:
1. Which chunks are ✅ complete?
2. Which chunks can start now (all deps ✅)?
3. Are any gates triggered?
```

### Start Phase 6
```
I'm starting chunk 6.01 (AI Types & Config).
Phases 1-5 are ✅ complete.
Read docs/theme-management/chunks/phase-6-chunks.md and implement chunk 6.01.
```

### Start Phase 9 (Parallel)
```
I'm starting chunk 9.01 (Plugin Scaffold).
This is independent of Phases 6-8 - can run in parallel.
Read docs/theme-management/chunks/phase-9-chunks.md and implement chunk 9.01.
```

---

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked by gate
- ❌ Failed