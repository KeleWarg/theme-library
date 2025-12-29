# Design System: Cursor Build Guide

This guide explains how to use Cursor AI to build the complete design system pipeline using the existing project documentation.

---

## What You Already Have

### Token JSON Files (Figma Exports)
These are already exported from Figma variables:

| File | Content |
|------|---------|
| `Health_-_SEM_tokens.json` | Health SEM theme colors |
| `Home_-_SEM_tokens.json` | Home SEM theme colors |
| `LLM_tokens.json` | LLM theme colors |
| `ForbesMedia_-_SEO_tokens.json` | Forbes Media theme colors |
| `Compare_Coverage_tokens.json` | Compare Coverage theme colors |
| `Value_tokens.json` | Value theme colors |
| `Desktop_tokens.json` | Desktop typography/breakpoints |
| `Tablet_tokens.json` | Tablet typography/breakpoints |
| `Mobile_tokens.json` | Mobile typography/breakpoints |

**Token Format (DTCG Standard):**
```json
{
  "Color": {
    "Button": {
      "Primary": {
        "primary-bg": {
          "$type": "color",
          "$value": {
            "hex": "#657E79"
          }
        }
      }
    }
  }
}
```

### Phase Documentation
Detailed implementation guides already exist:

| Phase | File | Description |
|-------|------|-------------|
| 1 | `PHASE_1_SETUP.md` | Project setup, layout shell |
| 2 | `PHASE_2_FOUNDATIONS.md` | Token viewer (colors, typography, spacing) |
| 3 | `PHASE_3_THEMES.md` | Theme switching/preview |
| 4 | `PHASE_4_DATABASE.md` | Supabase schema & setup |
| 5 | `PHASE_5_COMPONENTS_LIST.md` | Components grid page |
| 6 | `PHASE_6_COMPONENT_DETAIL.md` | Component editor with Monaco |
| 7 | `PHASE_7_AI_GENERATION.md` | Claude code generation |
| 8-10 | `PHASE_8_9_10_FINAL.md` | Export, dashboard, Figma plugin |

### Orchestrator
`ORCHESTRATOR.md` - Master guide with execution rules and code standards.

---

## How to Build in Cursor

### Step 1: Project Setup

Open Cursor in a new folder and paste:

```
Read ORCHESTRATOR.md and PHASE_1_SETUP.md, then implement Task 1.1.

Use these token JSON files as the data source:
- Health_-_SEM_tokens.json
- Home_-_SEM_tokens.json  
- LLM_tokens.json
- ForbesMedia_-_SEO_tokens.json
- Compare_Coverage_tokens.json
- Desktop_tokens.json
- Tablet_tokens.json
- Mobile_tokens.json

The tokens are in DTCG format with $type and $value.$hex for colors.
```

### Step 2: Work Through Phases

For each phase, use this pattern:

```
Read PHASE_X_[NAME].md and implement Task X.1.
Write tests as specified in the doc.
```

After each task:
```
Task X.1 complete. Run tests and implement Task X.2.
```

### Step 3: Token Transformation

The token JSONs need to be transformed to CSS variables. In Phase 2, tell Cursor:

```
Create a token transformer script that:

1. Reads the Figma token JSON files (Health_-_SEM_tokens.json, etc.)

2. Parses the DTCG format:
   - Color tokens: use $value.hex
   - String tokens: use $value directly
   - Number tokens: use $value directly

3. Generates CSS with theme classes:
   .theme-health-sem {
     --color-btn-primary-bg: #657E79;
     --color-btn-primary-text: #FFFFFF;
   }

4. Outputs:
   - tokens.css (all CSS variables)
   - tokens.json (flattened key-value pairs)
   - tokens.ts (TypeScript types)

The token path "Color/Button/Primary/primary-bg" becomes 
CSS variable "--color-btn-primary-bg".
```

### Step 4: Reference Token Data

When implementing PHASE_2_FOUNDATIONS.md, tell Cursor:

```
The tokenData.js should import from the transformed tokens.
Map these categories from the JSON:

From theme tokens (Health_-_SEM_tokens.json, etc.):
- Color.Button.Primary.* → button colors
- Color.Button.Secondary.* → secondary buttons
- Color.Button.Ghost.* → ghost buttons
- Color.Bg.* → backgrounds
- Color.Fg.* → foregrounds
- Color.Feedback.* → feedback states

From typography tokens (Desktop_tokens.json, etc.):
- Font Family.* → font families
- Font Size.* → font sizes  
- Font Weight.* → font weights
- Line Height.* → line heights

From breakpoint tokens:
- Breakpoint.* → breakpoint widths
- Grid.* → columns, margin, gutter
```

---

## Phase-Specific Cursor Prompts

### Phase 1: Setup
```
Read PHASE_1_SETUP.md.
Create a Vite React project with the layout shell (Sidebar, Header).
Use the dependencies from ORCHESTRATOR.md.
```

### Phase 2: Foundations
```
Read PHASE_2_FOUNDATIONS.md.
Create tokenData.js that parses the DTCG token JSONs.
Build the ColorSwatch, TypographySample, and Tabs components.
The Foundations page should show all tokens from the JSON files.
```

### Phase 3: Themes
```
Read PHASE_3_THEMES.md.
Implement theme switching using CSS classes.
Each theme JSON file (Health_-_SEM, Home_-_SEM, etc.) becomes a theme option.
Theme class names: theme-health-sem, theme-home-sem, theme-llm, etc.
```

### Phase 4: Database
```
Read PHASE_4_DATABASE.md.
Create the Supabase schema for components and tokens.
The schema stores component metadata synced from Figma.
```

### Phase 5: Components List
```
Read PHASE_5_COMPONENTS_LIST.md.
Build the components grid with filtering by status.
Statuses: pending_code, generated, approved, published.
```

### Phase 6: Component Detail
```
Read PHASE_6_COMPONENT_DETAIL.md.
Create the component detail page with:
- Monaco code editor for react_code
- Live preview iframe
- Status workflow buttons
```

### Phase 7: AI Generation
```
Read PHASE_7_AI_GENERATION.md.
Integrate Claude API to generate React code.
The prompt should include:
- Component name and description from Figma
- Prop types mapped from Figma properties
- Token CSS variables to use
```

### Phase 8-10: Export, Dashboard, Plugin
```
Read PHASE_8_9_10_FINAL.md.
Build the export system that generates:
- NPM package with components
- LLMS.txt for AI-friendly docs
- tokens.css from the theme JSONs

Build the dashboard home page with stats.

The Figma plugin syncs components (not just tokens) to the dashboard.
```

---

## Token Transformation Reference

### Input: DTCG JSON from Figma
```json
{
  "Color": {
    "Button": {
      "Primary": {
        "primary-bg": {
          "$type": "color",
          "$value": { "hex": "#657E79" }
        }
      }
    }
  },
  "Font Size": {
    "heading-lg": {
      "$type": "number",
      "$value": 48
    }
  }
}
```

### Output: CSS Variables
```css
.theme-health-sem {
  --color-btn-primary-bg: #657E79;
  --font-size-heading-lg: 48px;
}
```

### Transformation Rules
| JSON Path | CSS Variable |
|-----------|--------------|
| `Color.Button.Primary.primary-bg` | `--color-btn-primary-bg` |
| `Color.Bg.white` | `--color-bg-white` |
| `Color.Fg.heading` | `--color-fg-heading` |
| `Font Size.heading-lg` | `--font-size-heading-lg` |
| `Font Weight.bold` | `--font-weight-bold` |
| `Grid.columns` | `--grid-columns` |

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FIGMA                                    │
├─────────────────────────────────────────────────────────────────┤
│ Variables (already exported as JSON):                           │
│   Health_-_SEM_tokens.json                                      │
│   Home_-_SEM_tokens.json                                        │
│   Desktop_tokens.json, etc.                                     │
│                                                                 │
│ Components (need plugin to extract):                            │
│   Button, Card, Alert, etc.                                     │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN TRANSFORMER                             │
│                    (scripts/transform-tokens.js)                 │
├─────────────────────────────────────────────────────────────────┤
│ Input: *_tokens.json files                                      │
│ Output:                                                         │
│   - dist/tokens.css                                             │
│   - dist/tokens.json                                            │
│   - dist/tokens.ts                                              │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                               │
│                    (PHASES 1-9)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Phase 1: Setup & Layout                                         │
│ Phase 2: Token Viewer (uses transformed tokens)                 │
│ Phase 3: Theme Switching                                        │
│ Phase 4: Supabase Database                                      │
│ Phase 5: Components List                                        │
│ Phase 6: Component Detail + Code Editor                         │
│ Phase 7: AI Code Generation (Claude)                            │
│ Phase 8-9: Export & Dashboard                                   │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NPM PACKAGE                                   │
├─────────────────────────────────────────────────────────────────┤
│ dist/                                                           │
│   components/Button.jsx, Card.jsx, ...                          │
│   tokens/tokens.css, tokens.json                                │
│   LLMS.txt                                                      │
│   package.json                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## What's Missing (To Build)

### 1. Figma Plugin for Components
The token JSONs are already exported. But for the **component extraction flow**, you need a Figma plugin that:

- Extracts component name, description, variants
- Maps Figma properties → React props
- Captures PNG snapshot
- POSTs to admin dashboard API

**Cursor prompt:**
```
Read PHASE_8_9_10_FINAL.md section on Figma Plugin.
Create a Figma plugin that extracts COMPONENT metadata (not tokens).
The plugin should sync to /api/components with:
- figmaId, name, description
- variants array
- propTypes array  
- tokensUsed array
- snapshot (base64 PNG)
```

### 2. Full Admin Dashboard Build
Use the phase docs in sequence:

```
Start with PHASE_1_SETUP.md
Work through each phase in order
Reference the existing token JSONs for data
```

---

## File Mapping

| Your File | Use In |
|-----------|--------|
| `ORCHESTRATOR.md` | Overall execution guide |
| `PHASE_*.md` | Step-by-step implementation |
| `*_tokens.json` | Raw token data (already have) |
| `LLMS.txt` | AI documentation format |

---

## Quick Start Commands

```bash
# 1. Create project
npm create vite@latest design-system-admin -- --template react
cd design-system-admin

# 2. Install dependencies (from ORCHESTRATOR.md)
npm install react-router-dom lucide-react @supabase/supabase-js @monaco-editor/react jszip file-saver
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 3. Copy token JSONs to project
cp *_tokens.json src/tokens/

# 4. Open in Cursor and start Phase 1
cursor .
```

Then in Cursor:
```
Read ORCHESTRATOR.md and PHASE_1_SETUP.md.
The token data is in src/tokens/*_tokens.json in DTCG format.
Implement Task 1.1.
```

---

## Checklist

### Already Done ✅
- [x] Token JSONs exported from Figma
- [x] Phase documentation written
- [x] DTCG format defined
- [x] CSS variable naming convention

### To Build in Cursor
- [ ] Phase 1: Project setup & layout
- [ ] Phase 2: Token viewer (read JSONs)
- [ ] Phase 3: Theme switching
- [ ] Phase 4: Supabase setup
- [ ] Phase 5: Components list
- [ ] Phase 6: Component detail
- [ ] Phase 7: Claude integration
- [ ] Phase 8-10: Export, dashboard, plugin
- [ ] Figma component extraction plugin
