"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Copy, Check, Sparkles, Loader2, Variable, MessageSquare, Save, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { extractVariables } from "@/lib/validation-utils"
import { testPrompt, savePromptTest } from "@/app/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PromptTestingInterfaceProps {
  prompt: {
    id: number
    name: string
    prompt: string
    systemMessage: string | null
  }
}

interface VariableValues {
  [key: string]: string
}

interface TestResult {
  id?: number
  promptId: number
  variables: VariableValues
  finalPrompt: string
  response: string
  responseTime: number
  timestamp: string
  saved?: boolean
}

export function PromptTestingInterface({ prompt }: PromptTestingInterfaceProps) {
  const [variables, setVariables] = useState<string[]>([])
  const [variableValues, setVariableValues] = useState<VariableValues>({})
  const [finalPrompt, setFinalPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("variables")
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [useSystemMessage, setUseSystemMessage] = useState(true)
  const [recentTests, setRecentTests] = useState<TestResult[]>([])

  // Extract variables from the prompt
  useEffect(() => {
    const extractedVars = extractVariables(prompt.prompt)
    setVariables(extractedVars)

    // Initialize variables with empty strings
    const initialVars: VariableValues = {}
    extractedVars.forEach((variable) => {
      initialVars[variable] = ""
    })
    setVariableValues(initialVars)
  }, [prompt.prompt])

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [variable]: value }))
  }

  const generateFinalPrompt = () => {
    let result = prompt.prompt

    // Replace variables in the prompt
    for (const [key, value] of Object.entries(variableValues)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      result = result.replace(regex, value || `{{${key}}}`)
    }

    setFinalPrompt(result)
    return result
  }

  const handleTest = async () => {
    setIsGenerating(true)
    setActiveTab("result")

    try {
      const finalPromptText = generateFinalPrompt()

      // Check if any variables are empty
    const emptyVars = Object.entries(variableValues).filter(([, value]) => !value)
      if (emptyVars.length > 0) {
        toast({
          title: "Warning",
          description: "Some variables are empty. They will remain as placeholders in the test.",
          variant: "default",
        })
      }

      // Call the API to test the prompt
      const result = await testPrompt({
        promptId: prompt.id,
        prompt: finalPromptText,
        systemMessage: useSystemMessage ? prompt.systemMessage : null,
        variables: variableValues,
      })

      if (result.success) {
        setTestResult(result.data)
        // Add to recent tests
        setRecentTests((prev) => [result.data, ...prev].slice(0, 5))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to test prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing prompt:", error)
      toast({
        title: "Error",
        description: "Failed to test prompt",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTest = async () => {
    if (!testResult) return

    setIsSaving(true)
    try {
      const result = await savePromptTest(testResult)

      if (result.success) {
        setTestResult((prev) => (prev ? { ...prev, saved: true, id: result.data.id } : null))
        toast({
          title: "Test saved",
          description: "The test result has been saved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save test",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving test:", error)
      toast({
        title: "Error",
        description: "Failed to save test",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const fillRandomValues = () => {
    const filledVars: VariableValues = {}
    variables.forEach((variable) => {
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
    setVariableValues(filledVars)
  }

  const exportTestResult = () => {
    if (!testResult) return

    try {
      const data = JSON.stringify(testResult, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `prompt-test-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exported",
        description: "Test result has been exported as JSON",
      })
    } catch (error) {
      console.error("Error exporting test result:", error)
      toast({
        title: "Error",
        description: "Failed to export test result",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Test Prompt
          </CardTitle>
          <CardDescription>Test your prompt with different variable values</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="variables" className="gap-1">
                <Variable className="h-4 w-4" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!finalPrompt}>
                Preview
              </TabsTrigger>
              <TabsTrigger value="result" disabled={!testResult && !isGenerating}>
                Result
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="variables" className="pt-4 space-y-4">
              {variables.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Fill in the variables</h3>
                    <Button variant="outline" size="sm" onClick={fillRandomValues} className="h-8 px-2 gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Fill Sample Data
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {variables.map((variable) => (
                      <div key={variable} className="space-y-2">
                        <Label htmlFor={variable} className="flex items-center gap-2">
                          {variable}
                          <Badge variant="outline" className="font-normal">
                            Variable
                          </Badge>
                        </Label>
                        <Input
                          id={variable}
                          placeholder={`Enter value for ${variable}`}
                          value={variableValues[variable] || ""}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  {prompt.systemMessage && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="use-system-message"
                        checked={useSystemMessage}
                        onCheckedChange={setUseSystemMessage}
                      />
                      <Label htmlFor="use-system-message" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Include system message
                      </Label>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No variables found in this prompt. You can still test it.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                  <span>Final Prompt</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(finalPrompt)}
                        className="h-8 gap-1"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap border">{finalPrompt}</div>
              </div>

              {useSystemMessage && prompt.systemMessage && (
                <div>
                  <h3 className="text-sm font-medium mb-2">System Message</h3>
                  <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap border">{prompt.systemMessage}</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="result" className="pt-4 space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Generating response...</p>
                </div>
              ) : testResult ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                      <span>AI Response</span>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(testResult.response)}
                              className="h-8 gap-1"
                            >
                              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied ? "Copied!" : "Copy"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={exportTestResult} className="h-8 gap-1">
                              <Download className="h-3.5 w-3.5" />
                              Export
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export as JSON</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap border">{testResult.response}</div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>Response time: {testResult.responseTime}ms</div>
                    <div>{new Date(testResult.timestamp).toLocaleString()}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test results yet. Run a test to see results here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="pt-4">
              {isLoadingTests ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-20 w-full" />
                      <div className="flex justify-between mt-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.map((test, index) => (
                    <Card key={index} className="p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium">Test {test.id || index + 1}</h4>
                        <Badge variant={test.saved ? "default" : "outline"} className="text-xs">
                          {test.saved ? "Saved" : "Unsaved"}
                        </Badge>
                      </div>
                      <div className="text-sm line-clamp-3 mb-2">{test.response}</div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div>Response time: {test.responseTime}ms</div>
                        <div>{new Date(test.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="flex justify-end mt-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setTestResult(test)
                            setActiveTab("result")
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test history available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              generateFinalPrompt()
              setActiveTab("preview")
            }}
            disabled={isGenerating}
          >
            Preview
          </Button>

          <div className="flex gap-2">
            {testResult && !testResult.saved && (
              <Button variant="outline" onClick={handleSaveTest} disabled={isSaving} className="gap-1">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Result"}
              </Button>
            )}

            <Button onClick={handleTest} disabled={isGenerating} className="gap-1">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Test Prompt
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}

