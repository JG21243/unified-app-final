"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, BarChart2, Tag, Bot, Plus, Menu } from "lucide-react"
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
      name: "Chat",
      path: "/chat",
      icon: Bot,
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
          {/* Mobile menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 mr-1 md:hidden hover:bg-accent"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] px-0">
              <div className="flex flex-col h-full">
                {/* Header section */}
                <div className="flex items-center gap-3 px-6 py-4 border-b">
                  <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                    <div className="rounded-lg bg-primary p-2">
                      <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">Legal Prompts</span>
                  </Link>
                </div>
                
                {/* Navigation section */}
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-2">
                    {routes.map((route) => {
                      const active = isActive(route.path);
                      return (
                        <Link
                          key={route.path}
                          href={route.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            active 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <route.icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "")} />
                          <span>{route.name}</span>
                          {active && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/80" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
                
                {/* Footer section */}
                <div className="px-4 py-4 border-t bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="rounded-lg bg-primary p-2">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">Legal Prompts</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {routes.map((route) => {
              const active = isActive(route.path);
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <route.icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "")} />
                  <span>{route.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Command menu - hidden on mobile for simplicity */}
          <div className="hidden sm:flex">
            <CommandMenu />
          </div>

          {/* New prompt button - responsive text */}
          <Link href="/prompts/new">
            <Button variant="default" size="sm" className="gap-2 h-9">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline-block">New Prompt</span>
              <span className="xs:hidden sr-only">New</span>
            </Button>
          </Link>

          {/* Theme toggle - only on desktop, included in mobile menu */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

