import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface PromptCardProps {
  prompt: {
    id: number
    name: string
    prompt: string
    category?: string
    systemMessage?: string | null
    createdAt: string
  }
  selectable?: boolean
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function PromptCard({ prompt, selectable = false, selected = false, onSelect }: PromptCardProps) {
  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
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

