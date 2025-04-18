"use client"

import { useState, useEffect } from "react"
import { Play, Copy, Check, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { LegalPrompt } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { extractVariables } from "@/lib/validation-utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PromptPreviewProps {
  prompt: LegalPrompt
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [previewText, setPreviewText] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [promptVariables, setPromptVariables] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("variables")
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isSimulating, setIsSimulating] = useState(false)

  // Extract variables from the prompt
  useEffect(() => {
    const extractedVars = extractVariables(prompt.prompt)
    setPromptVariables(extractedVars)

    // Initialize variables with empty strings
    const initialVars: Record<string, string> = {}
    extractedVars.forEach((variable) => {
      initialVars[variable] = ""
    })
    setVariables(initialVars)
  }, [prompt.prompt])

  const handleVariableChange = (variable: string, value: string) => {
    setVariables((prev) => ({ ...prev, [variable]: value }))
  }

  const generatePreview = () => {
    setIsGenerating(true)

    try {
      let result = prompt.prompt

      // Replace variables in the prompt
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
        result = result.replace(regex, value || `{{${key}}}`)
      }

      setPreviewText(result)
      setActiveTab("preview")

      if (Object.values(variables).some((v) => !v)) {
        toast({
          title: "Warning",
          description: "Some variables are empty and will remain as placeholders in the preview.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error generating preview:", error)
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const simulateAiResponse = () => {
    if (!previewText) {
      toast({
        title: "Generate preview first",
        description: "Please generate a preview before simulating an AI response.",
        variant: "default",
      })
      return
    }

    setIsSimulating(true)
    setAiResponse("")

    // Simulate typing effect for AI response
    const mockResponse = `Based on the information provided, here's my analysis:

1. The contract contains several key provisions that require attention.
2. Section 3.2 has ambiguous language regarding termination rights.
3. The liability clause in section 7 appears to be overly broad and may not be enforceable.
4. The governing law provision specifies jurisdiction but lacks a venue clause.

I recommend clarifying these points before proceeding with the agreement. The termination rights should be more explicitly defined, and the liability clause should be narrowed to specific scenarios.`

    let i = 0
    const typingInterval = setInterval(() => {
      if (i < mockResponse.length) {
        setAiResponse((prev) => prev + mockResponse.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsSimulating(false)
      }
    }, 15)

    setActiveTab("response")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const resetVariables = () => {
    const resetVars: Record<string, string> = {}
    promptVariables.forEach((variable) => {
      resetVars[variable] = ""
    })
    setVariables(resetVars)
    setPreviewText("")
    setAiResponse("")
    setActiveTab("variables")
  }

  const fillRandomValues = () => {
    const filledVars: Record<string, string> = {}
    promptVariables.forEach((variable) => {
      // Generate placeholder text based on variable name
      if (variable.includes("name")) {
        filledVars[variable] = "John Smith"
      } else if (variable.includes("date")) {
        filledVars[variable] = new Date().toLocaleDateString()
      } else if (variable.includes("email")) {
        filledVars[variable] = "john.smith@example.com"
      } else if (variable.includes("contract") || variable.includes("text")) {
        filledVars[variable] =
          "This agreement is made between Party A and Party B for the provision of legal services..."
      } else {
        filledVars[variable] = `Sample ${variable} value`
      }
    })
    setVariables(filledVars)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview" disabled={!previewText}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="response" disabled={!aiResponse}>
            AI Response
          </TabsTrigger>
          {prompt.systemMessage && <TabsTrigger value="system">System Message</TabsTrigger>}
        </TabsList>

        <TabsContent value="variables" className="pt-4">
          {promptVariables.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Variables</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fillRandomValues} className="h-8 px-2">
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Fill Sample Data
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetVariables} className="h-8 px-2">
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promptVariables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <label htmlFor={variable} className="text-sm font-medium flex items-center gap-2">
                      {variable}
                      <Badge variant="outline" className="font-normal">
                        Variable
                      </Badge>
                    </label>
                    <Input
                      id={variable}
                      placeholder={`Enter value for ${variable}`}
                      value={variables[variable] || ""}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button onClick={generatePreview} className="gap-2 w-full" disabled={isGenerating}>
                  <Play className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate Preview"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No variables found in this prompt. You can still generate a preview.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Button
                  onClick={() => {
                    setPreviewText(prompt.prompt)
                    setActiveTab("preview")
                  }}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Show Preview
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          {previewText && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">{previewText}</div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => copyToClipboard(previewText)} className="gap-2">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>

                <Button onClick={simulateAiResponse} disabled={isSimulating} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isSimulating ? "Generating..." : "Simulate AI Response"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="response" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-md min-h-[200px]">
                {aiResponse || (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>AI response will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(aiResponse)}
                className="gap-2"
                disabled={!aiResponse}
              >
                <Copy className="h-4 w-4" />
                Copy Response
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {prompt.systemMessage && (
          <TabsContent value="system" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">{prompt.systemMessage}</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => copyToClipboard(prompt.systemMessage || "")} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy System Message
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

