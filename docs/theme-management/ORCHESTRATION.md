# Orchestration Guide — Phases 6-9

## Quick Reference

| Phase | Feature | Chunks | Time |
|-------|---------|--------|------|
| **6** | AI Code Generation | 6 | 8h |
| **7** | Export + Dashboard | 8 | 10h |
| **8** | AI Platform Export | 8 | 8h |
| **9** | Figma Plugin | 6 | 6h |

**Total:** 28 chunks, 32h sequential, ~12h with 4 agents

---

## Parallel Execution (4 Agents)

```
Agent 1: 6.01 → 6.02 → 6.03 → 6.06 → 7.01 → 7.02 → 7.03 → 7.05 → 7.06 → 8.01 → 8.02 → 8.03 → 8.07 → 8.08
Agent 2: ──── 6.04 ──────────────── → ──── 7.04 ─────────────────────── → ──── 8.04 ──────────────┘
Agent 3: ──── 6.05 ──────────────── → ──── 7.07 → 7.08 ─────────────── → ──── 8.05 ──────────────┘
Agent 4: 9.01 → 9.02 → 9.03 → 9.04 → 9.05 → 9.06 (INDEPENDENT)
```

---

## Agent Prompts

### Start Phase 6
```
Implement chunk 6.01 (AI Types & Config).
Read chunks/chunk-6_01.md and create:
- src/lib/ai/types.ts
- src/lib/ai/config.ts
- src/lib/ai/__tests__/config.test.ts
```

### After 6.01 (Parallel)
```
6.01 is ✅. Start in parallel:
- Agent A: 6.02 (Prompt Builder)
- Agent B: 6.04 (GenerateButton)
- Agent C: 6.05 (FeedbackModal)
```

### Start Phase 9 (Immediate)
```
Implement chunk 9.01 (Plugin Scaffold).
This is INDEPENDENT - no Phase 6-8 dependencies.
Read chunks/chunk-9_01.md and create figma-variables-exporter/ structure.
```

### Run Gate 6A
```
6.01-6.03 are ✅. Run Gate 6A:
1. Create tests/integration/gate-6a.test.ts from GATE_CHECKPOINTS.md
2. Run: npm test tests/integration/gate-6a.test.ts
3. If pass: proceed to 6.06
4. If fail: fix before continuing
```

---

## File Structure

### Phase 6
```
src/lib/ai/
├── types.ts          # 6.01
├── config.ts         # 6.01
├── promptBuilder.ts  # 6.02
├── generateCode.ts   # 6.03
└── __tests__/
src/components/ui/
├── GenerateButton.jsx    # 6.04
└── FeedbackModal.jsx     # 6.05
```

### Phase 7
```
src/lib/export/
├── types.ts              # 7.01
├── utils.ts              # 7.01
├── llmsGenerator.ts      # 7.02
├── packageGenerator.ts   # 7.03
├── tokenExporter.ts      # 7.04
src/lib/dashboard/
└── stats.ts              # 7.07
src/components/
├── export/ExportModal.jsx    # 7.05
└── dashboard/StatCard.jsx    # 7.07
src/pages/
├── Settings.jsx          # 7.06
└── Dashboard.jsx         # 7.08
```

### Phase 8
```
src/lib/aiExport/
├── types.ts              # 8.01
├── tokenUtils.ts         # 8.02
├── cursorRules.ts        # 8.03
├── claudeCode.ts         # 8.04
├── projectKnowledge.ts   # 8.05
├── fullPackage.ts        # 8.08
src/components/
└── AIExportPanel.jsx     # 8.07
mcp-server/               # 8.06
├── package.json
└── src/server.ts, index.ts
```

### Phase 9
```
figma-variables-exporter/
├── manifest.json         # 9.01
├── package.json          # 9.01
├── ui.html               # 9.02
├── src/
│   ├── variableReader.ts # 9.03
│   ├── exporter.ts       # 9.04
│   └── code.ts           # 9.04
└── README.md             # 9.06
```

---

## Gate Summary

| Gate | Trigger | Blocks |
|------|---------|--------|
| 6A | 6.01-6.03 | 6.06 |
| 6B | Phase 6 | Phase 7 |
| 7A | 7.01-7.03 | 7.05-7.06 |
| 7B | Phase 7 | Phase 8 |
| 8A | 8.01-8.05 | 8.07 |
| 8B | Phase 8 | Release |
| 9 | Phase 9 | Release |
