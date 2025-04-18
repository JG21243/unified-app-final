"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, BarChart2, Tag, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { CommandMenu } from "@/components/command-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      name: "Prompts",
      path: "/",
      icon: FileText,
    },
    {
      name: "Dashboard",
      path: "/?tab=dashboard",
      icon: BarChart2,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Tag,
    },
  ]

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname.startsWith("/?") || pathname.startsWith("/prompts")
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <span className="font-bold text-lg">Legal Prompts</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-7 py-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive(route.path) ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="hidden md:flex items-center gap-2">
            <span className="font-bold text-lg">Legal Prompts</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                  isActive(route.path) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <CommandMenu />
          </div>
          <KeyboardShortcuts />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

