import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: ReactNode // Changed from string to ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 gap-4 mb-6 sm:mb-10",
        "animate-in",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        {description &&
          (typeof description === "string" ? (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl text-balance">{description}</p>
          ) : (
            <div className="text-muted-foreground">{description}</div>
          ))}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 animate-in">{actions}</div>}
    </div>
  )
}

