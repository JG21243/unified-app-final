import Link from "next/link"
import { Github, Twitter, Mail } from "lucide-react"

export function GlobalFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 sm:px-6 md:py-8">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Legal Prompts Manager. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Designed for legal professionals to manage and organize AI prompts
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="mailto:contact@legalprompts.com"
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

