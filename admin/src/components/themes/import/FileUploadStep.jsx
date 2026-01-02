import { useState, useRef, useCallback } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { parseTokenFile, validateTokenFile } from '../../../lib/tokenParser'

// Config values from config-reference.md
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/**
 * FileUploadStep - File upload component with drag-and-drop support for JSON token files
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback when file is successfully processed
 * @param {Object|null} props.selectedFile - Currently selected file data
 * @param {Function} props.onClear - Callback to clear selected file
 */
export default function FileUploadStep({ onFileSelect, selectedFile, onClear }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = useCallback((file) => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      return { valid: false, error: 'Invalid file type. Please upload a .json file.' }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` 
      }
    }

    return { valid: true, error: null }
  }, [])

  const processFile = useCallback(async (file) => {
    setError(null)
    setIsProcessing(true)

    try {
      // Validate file type and size
      const fileValidation = validateFile(file)
      if (!fileValidation.valid) {
        setError(fileValidation.error)
        setIsProcessing(false)
        return
      }

      // Read file content
      const text = await file.text()

      // Parse JSON
      let content
      try {
        content = JSON.parse(text)
      } catch (parseError) {
        setError('Invalid JSON syntax. Please check the file format.')
        setIsProcessing(false)
        return
      }

      // Validate token file structure
      const structureValidation = validateTokenFile(content)
      if (!structureValidation.valid) {
        setError(structureValidation.errors.join('. '))
        setIsProcessing(false)
        return
      }

      // Parse tokens
      const parseResult = parseTokenFile(content)

      // Build file data object
      const fileData = {
        file,
        name: file.name,
        size: file.size,
        content,
        validation: {
          ...structureValidation,
          parseResult,
        },
      }

      onFileSelect(fileData)
    } catch (err) {
      setError(`Error processing file: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [validateFile, onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
    // Reset input value so same file can be selected again
    e.target.value = ''
  }, [processFile])

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleClear = useCallback(() => {
    setError(null)
    onClear()
  }, [onClear])

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // If file is selected, show preview
  if (selectedFile) {
    return (
      <FilePreview 
        file={selectedFile} 
        onClear={handleClear} 
      />
    )
  }

  return (
    <div data-testid="file-upload-step">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        data-testid="file-input"
      />

      {/* Drop zone */}
      <div
        data-testid="drop-zone"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleBrowseClick()
          }
        }}
        aria-label="Drop zone for JSON file upload"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          border: `2px dashed ${isDragging 
            ? 'var(--color-btn-primary-bg, #657E79)' 
            : 'var(--color-fg-divider, #D7DCE5)'}`,
          borderRadius: '12px',
          background: isDragging 
            ? 'var(--color-bg-brand-subtle, #F2F5F4)' 
            : 'var(--color-bg-neutral-subtle, #F4F5F8)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
            e.currentTarget.style.background = 'var(--color-bg-brand-subtle, #F2F5F4)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
            e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--color-btn-focused-border, #80CAF4)'
          e.currentTarget.style.outlineOffset = '2px'
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none'
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDragging 
              ? 'var(--color-btn-primary-bg, #657E79)' 
              : 'var(--color-bg-neutral-light, #ECEFF3)',
            borderRadius: '16px',
            marginBottom: '20px',
            color: isDragging 
              ? 'var(--color-bg-white, #FFFFFF)' 
              : 'var(--color-btn-primary-bg, #657E79)',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={32} />
        </div>

        {/* Text */}
        {isProcessing ? (
          <p
            style={{
              fontSize: 'var(--font-size-body-md, 16px)',
              color: 'var(--color-fg-body, #383C43)',
              margin: 0,
            }}
          >
            Processing file...
          </p>
        ) : (
          <>
            <p
              style={{
                fontSize: 'var(--font-size-body-lg, 18px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
                margin: '0 0 8px 0',
              }}
            >
              {isDragging ? 'Drop file here' : 'Drag & drop your JSON file'}
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-caption, #616A76)',
                margin: '0 0 16px 0',
              }}
            >
              or click to browse
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-body-xs, 12px)',
                color: 'var(--color-fg-caption, #616A76)',
                margin: 0,
              }}
            >
              Supports Figma Variables export (.json, max {MAX_FILE_SIZE_MB}MB)
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          data-testid="error-message"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(235, 64, 21, 0.08)',
            border: '1px solid var(--color-fg-feedback-error, #EB4015)',
            borderRadius: '8px',
          }}
        >
          <AlertCircle 
            size={20} 
            style={{ 
              color: 'var(--color-fg-feedback-error, #EB4015)',
              flexShrink: 0,
              marginTop: '2px',
            }} 
          />
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-feedback-error, #EB4015)',
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * FilePreview - Shows details about the selected file
 */
function FilePreview({ file, onClear }) {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const { validation } = file
  const warnings = [
    ...(validation?.warnings || []),
    ...(validation?.parseResult?.warnings || []),
  ]
  const tokenCount = validation?.parseResult?.metadata?.totalTokens || 0
  const categories = validation?.parseResult?.metadata?.categories || {}

  return (
    <div data-testid="file-preview">
      {/* File info card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px',
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '12px',
        }}
      >
        {/* File icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-brand-subtle, #F2F5F4)',
            borderRadius: '10px',
            color: 'var(--color-btn-primary-bg, #657E79)',
            flexShrink: 0,
          }}
        >
          <File size={24} />
        </div>

        {/* File details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <h4
              data-testid="file-name"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-body-md, 16px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </h4>
            <CheckCircle 
              size={18} 
              style={{ 
                color: 'var(--color-fg-feedback-success, #0C7663)',
                flexShrink: 0,
              }} 
            />
          </div>
          <p
            data-testid="file-size"
            style={{
              margin: '0 0 8px 0',
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-caption, #616A76)',
            }}
          >
            {formatFileSize(file.size)}
          </p>
          
          {/* Token summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span
              data-testid="token-count"
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-btn-primary-bg, #657E79)',
                fontWeight: 'var(--font-weight-medium, 500)',
              }}
            >
              {tokenCount} tokens found
            </span>
            {Object.entries(categories).map(([category, count]) => (
              <span
                key={category}
                style={{
                  fontSize: 'var(--font-size-body-xs, 12px)',
                  color: 'var(--color-fg-caption, #616A76)',
                  background: 'var(--color-bg-neutral-light, #ECEFF3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {category}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={onClear}
          data-testid="clear-button"
          aria-label="Remove file"
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-fg-caption, #616A76)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
            e.currentTarget.style.color = 'var(--color-fg-body, #383C43)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = 'var(--color-fg-caption, #616A76)'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div
          data-testid="warning-message"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '12px',
            padding: '12px 16px',
            background: 'rgba(255, 177, 54, 0.1)',
            border: '1px solid var(--color-fg-feedback-warning, #FFB136)',
            borderRadius: '8px',
          }}
        >
          <AlertTriangle 
            size={20} 
            style={{ 
              color: 'var(--color-fg-feedback-warning, #FFB136)',
              flexShrink: 0,
              marginTop: '2px',
            }} 
          />
          <div>
            {warnings.map((warning, index) => (
              <p
                key={index}
                style={{
                  margin: index === 0 ? 0 : '4px 0 0 0',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-body, #383C43)',
                  lineHeight: 1.5,
                }}
              >
                {warning}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

