'use client'

import { useEffect } from 'react'
import { initApiLogger } from '../lib/api-logger'

export function ApiLogger() {
  useEffect(() => {
    initApiLogger()
  }, [])

  return null
}
