"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ 
  children, 
  ...props
}: { 
  children: React.ReactNode 
} & Record<string, unknown>) {
  const [mounted, setMounted] = React.useState(false)
  
  // Only show UI once the component has mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </NextThemesProvider>
  )
} 