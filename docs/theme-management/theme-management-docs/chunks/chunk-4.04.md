# Chunk 4.04 — Export Generators

## Purpose
Create the generator functions that produce CSS, JSON, Tailwind, and SCSS output.

---

## Inputs
- Theme tokens array
- Export options

## Outputs
- `src/lib/exportGenerators.js`
- `src/lib/exportGenerators.test.js`

---

## Dependencies
- None (pure functions)

---

## Implementation Notes

### Key Considerations
- CSS: Custom properties in :root or scoped class
- JSON: Figma-compatible with $type/$value/$extensions
- Tailwind: theme.extend object structure
- SCSS: $variable-name: value format

### Gotchas
- JSON must preserve Figma metadata for round-trip
- Tailwind colors need specific structure
- SCSS variables can't start with numbers

### Algorithm/Approach
Pure functions that transform token array to string output.

---

## Files Created
- `src/lib/exportGenerators.js`
- `src/lib/exportGenerators.test.js`

---

## Output Examples

### CSS
```css
:root {
  --color-primary: #657E79;
  --spacing-md: 16px;
}
```

### JSON (Figma-compatible)
```json
{
  "Color": {
    "primary": {
      "$type": "color",
      "$value": { "hex": "#657E79" }
    }
  }
}
```

### Tailwind
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#657E79'
      }
    }
  }
}
```

### SCSS
```scss
$color-primary: #657E79;
$spacing-md: 16px;
```

---

## Tests

### Unit Tests
- [ ] CSS generator produces valid CSS
- [ ] CSS minify option works
- [ ] CSS scope option wraps in class
- [ ] JSON preserves Figma metadata
- [ ] JSON pretty print option works
- [ ] Tailwind produces valid JS object
- [ ] SCSS produces valid variables

### Verification
- [ ] Import CSS into project, verify works
- [ ] Re-import JSON into tool
- [ ] Use Tailwind config in project

---

## Time Estimate
2.5 hours
