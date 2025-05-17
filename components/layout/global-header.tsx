"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, BarChart2, Tag, Plus, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { CommandMenu } from "@/components/command-menu"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function GlobalHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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

  const isActive = (currentPath: string) => {
    // Exact match for paths with query parameters like /?tab=dashboard
    if (currentPath.includes("?")) {
      return pathname === currentPath;
    }

    // Special handling for the root "Prompts" path (path: "/")
    if (currentPath === "/") {
      // Active if it's the exact root path or any /prompts/... sub-path,
      // AND the pathname does not contain any query parameters (to avoid conflict with /?tab=dashboard)
      return (pathname === "/" || pathname.startsWith("/prompts/")) && !pathname.includes("?");
    }

    // Default for other paths (e.g., /categories)
    return pathname.startsWith(currentPath);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 md:gap-6">
          {/* Add mobile menu for small screens */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 px-2 py-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="rounded-md bg-primary p-1">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg">Legal Prompts</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-primary",
                        isActive(route.path) ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">Legal Prompts</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex">
            <CommandMenu />
          </div>

          <Link href="/prompts/new">
            <Button variant="default" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline-block">New Prompt</span>
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

