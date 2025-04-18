import type React from "react"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/components/favorites-provider"
import { TagsProvider } from "@/components/tags-provider"
import { GlobalHeader } from "@/components/layout/global-header"
import { GlobalFooter } from "@/components/layout/global-footer"

// Use variable font with more weights
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata = {
  title: "Legal Prompts Manager",
  description: "Manage and organize your legal prompts",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FavoritesProvider>
            <TagsProvider>
              <div className="relative flex min-h-screen flex-col">
                <GlobalHeader />
                <main className="flex-1">{children}</main>
                <GlobalFooter />
              </div>
            </TagsProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import "@/styles/globals.css"