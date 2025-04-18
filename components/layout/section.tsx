import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Section({ title, description, children, className, contentClassName }: SectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-base text-muted-foreground max-w-3xl">{description}</p>}
        </div>
      )}
      <div className={cn("", contentClassName)}>{children}</div>
    </div>
  )
}

