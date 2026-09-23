import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only registers auto-cleanup when Vitest globals are enabled,
// and they are not. Without this, renders accumulate in the document and
// queries start matching elements from earlier tests.
afterEach(() => {
  cleanup()
})
