"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error caught by error boundary:", error)
  }, [error])

  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isDatabaseError = error.message.includes('database') || error.message.includes('connection')

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="rounded-full bg-red-100 p-3 mb-4 inline-flex">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an unexpected error. Don&apos;t worry, this has been logged and we&apos;ll look into it.
          </p>
        </div>

      {/* Error details */}
      <Alert className="mb-6 text-left max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error details:</strong><br />
          {error.message || "An unexpected error occurred"}
          {error.digest && (
            <div className="mt-2 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Contextual help */}
      {isDatabaseError && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md">
          <h3 className="font-semibold text-blue-900 mb-2">Database Connection Issue</h3>
          <p className="text-sm text-blue-800">
            This appears to be a database connectivity issue. Please check your internet connection 
            and try again. If the problem persists, the service may be temporarily unavailable.
          </p>
        </div>
      )}

      {isNetworkError && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left max-w-md">
          <h3 className="font-semibold text-orange-900 mb-2">Network Connection Issue</h3>
          <p className="text-sm text-orange-800">
            Unable to connect to our servers. Please check your internet connection and try again.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}

