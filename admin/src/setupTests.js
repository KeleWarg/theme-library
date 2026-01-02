import '@testing-library/jest-dom'

// Polyfill DataTransfer for jsdom
class DataTransferPolyfill {
  constructor() {
    this.items = []
    this.files = []
  }
  
  get items() {
    return this._items
  }
  
  set items(value) {
    this._items = value
  }
  
  add(file) {
    this._items.push(file)
    if (file instanceof File) {
      this.files.push(file)
    }
    return { kind: 'file', type: file.type }
  }
}

if (typeof DataTransfer === 'undefined') {
  global.DataTransfer = DataTransferPolyfill
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
}





