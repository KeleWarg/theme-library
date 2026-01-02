# Chunk 2.02 — File Upload Step

## Purpose
Create the file upload component with drag-and-drop support and JSON validation.

---

## Inputs
- `parseTokenFile` function (from chunk 1.03)
- `validateTokenFile` function (from chunk 1.03)

## Outputs
- `src/components/themes/import/FileUploadStep.jsx` (consumed by chunk 2.04)
- File data object with parsed content

---

## Dependencies
- Chunk 1.03 must be complete (parser functions)

---

## Implementation Notes

### Key Considerations
- Drag-and-drop with visual feedback
- File type validation (.json only)
- File size validation (5MB max)
- JSON syntax validation
- Structure validation via `validateTokenFile`

### Gotchas
- `e.preventDefault()` required in drag handlers
- File reading is async (`file.text()`)
- JSON.parse can throw on invalid JSON

### Algorithm/Approach
1. Handle drag events with visual state
2. On file selection (drag or click), validate type and size
3. Read file content as text
4. Parse JSON and validate structure
5. Call onFileSelect callback with processed data

---

## Files Created
- `src/components/themes/import/FileUploadStep.jsx`
- `src/components/themes/import/FileUploadStep.test.jsx`

---

## Key Props

```typescript
interface FileUploadStepProps {
  onFileSelect: (fileData: {
    file: File
    name: string
    size: number
    content: object
    validation: ValidationResult
  }) => void
  selectedFile: FileData | null
  onClear: () => void
}
```

---

## Tests

### Unit Tests
- [ ] Renders upload zone when no file selected
- [ ] Renders file preview when file selected
- [ ] Shows error for non-JSON files
- [ ] Shows error for files > 5MB
- [ ] Shows error for invalid JSON syntax
- [ ] Calls onFileSelect with valid JSON
- [ ] Calls onClear when remove clicked
- [ ] Shows validation warnings if present

### Verification
- [ ] Drag-and-drop works visually
- [ ] Click to browse works
- [ ] File info displays correctly

---

## Time Estimate
2 hours
