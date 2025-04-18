import type { ReactNode } from "react"

export default function PromptsLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background">{children}</main>
}

