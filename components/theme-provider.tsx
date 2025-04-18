// components/theme-provider.tsx
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as _useTheme,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider(props: ThemeProviderProps) {
  return <NextThemesProvider {...props} />
}

// add this:
export const useTheme = _useTheme
