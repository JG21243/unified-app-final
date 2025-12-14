"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Send, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PromptTesterStreamingProps {
  promptId: number
  prompt: string
  systemMessage?: string | null
  variables: string[]
}

export function PromptTesterStreaming({ promptId, prompt, systemMessage, variables }: PromptTesterStreamingProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Reset when variables change
  useEffect(() => {
    const initialValues: Record<string, string> = {}
    variables.forEach((variable) => {
      initialValues[variable] = ""
    })
    setVariableValues(initialValues)
  }, [variables])

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setResponse("")

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      // Replace variables in the prompt
      let processedPrompt = prompt
      for (const [variable, value] of Object.entries(variableValues)) {
        const placeholder = `{{${variable}}}`
        // If value is empty, leave the placeholder
        const replacement = value.trim() ? value : `[${variable}]`
        processedPrompt = processedPrompt.replace(new RegExp(placeholder, "g"), replacement)
      }

      // Make the API request
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: processedPrompt,
          systemMessage,
          promptId,
        }),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
      }

      // Parse the JSON response
      const data = await response.json()
      setResponse(data.response)
    } catch (err: any) {
      // Don't show the error if it was caused by the user cancelling the request
      if (err.name !== "AbortError") {
        console.error("Error generating response:", err)
        setError(err.message || "An error occurred while generating the response")
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variables.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Variables</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {variables.map((variable) => (
                <div key={variable} className="grid gap-1.5">
                  <Label htmlFor={variable}>{variable}</Label>
                  <Input
                    id={variable}
                    value={variableValues[variable] || ""}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder={`Enter value for ${variable}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="response">Response</Label>
          <div className="relative">
            <Textarea
              id="response"
              value={response}
              readOnly
              placeholder="AI response will appear here..."
              className="min-h-[200px] h-[40vh] sm:h-72 resize-y font-mono text-sm"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          {isLoading ? (
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Generate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

