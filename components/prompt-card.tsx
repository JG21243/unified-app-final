import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { LegalPrompt } from "@/app/actions"

export interface PromptCardProps {
  prompt: LegalPrompt
  selectable?: boolean
  selected?: boolean
  onSelect?: (checked: boolean) => void // Update this line
  onFavorite?: (id: number, isFavorite: boolean) => void
  onDuplicate?: (id: number) => Promise<void>
  onDelete?: (id: number) => void
}

/**
 * Renders a card for a prompt with optional selection checkbox and metadata.
 *
 * @param prompt - The prompt data to display, including id, name, category, text, and creation date.
 * @param selectable - If true, shows a checkbox to allow selecting the card. Defaults to false.
 * @param selected - If true, applies selected styling and checks the selection checkbox. Defaults to false.
 * @param onSelect - Callback invoked when the selection checkbox changes; receives the new selected state.
 * @param onFavorite - Callback for handling "favorite" action (unused by this component).
 * @param onDuplicate - Callback for handling "duplicate" action (unused by this component).
 * @param onDelete - Callback for handling "delete" action (unused by this component).
 * @returns A JSX element representing the prompt card.
 */
export function PromptCard({
  prompt,
  selectable = false,
  selected = false,
  onSelect,
}: PromptCardProps) {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    // The Checkbox onCheckedChange provides boolean | "indeterminate"
    // We only care about the boolean state for selection
    if (typeof checked === "boolean" && onSelect) {
      onSelect(checked)
    }
  }

  return (
    <Card className={`relative hover-lift ${selected ? "ring-2 ring-primary" : ""}`}>
      {selectable && (
        <div className="absolute right-3 top-3 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Select ${prompt.name}`}
            className="h-5 w-5"
          />
        </div>
      )}
      <CardHeader className={selectable ? "pr-10" : ""}>
        <CardTitle className="flex items-start justify-between gap-2 text-base sm:text-lg">
          <Link href={`/prompts/${prompt.id}`} className="hover:text-primary transition-colors line-clamp-1">
            {prompt.name}
          </Link>
        </CardTitle>
        {prompt.category && (
          <Badge variant="outline" className="w-fit mt-2">
            {prompt.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-xs sm:text-sm text-muted-foreground">{prompt.prompt}</p>
      </CardContent>
      <CardFooter className="border-t border-border/30 mt-2 pt-4">
        <p className="text-xs text-muted-foreground">Created {formatDate(prompt.createdAt)}</p>
      </CardFooter>
    </Card>
  )
}

