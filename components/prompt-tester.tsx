"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Send, Clock, RotateCcw } from "lucide-react"
import { testPrompt, savePromptTest } from "@/app/actions"

interface PromptTesterProps {
  promptId: number
  promptText: string
  systemMessage: string | null
  variables: string[]
}

export function PromptTester({ promptId, promptText, systemMessage, variables }: PromptTesterProps) {
  const router = useRouter()
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("test")
  const responseRef = useRef<HTMLDivElement>(null)

  // Initialize variable values
  useEffect(() => {
    const initialValues: Record<string, string> = {}
    variables.forEach((variable) => {
      initialValues[variable] = ""
    })
    setVariableValues(initialValues)
  }, [variables])

  // Function to handle variable input changes
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  // Function to generate the final prompt with variables replaced
  const generateFinalPrompt = () => {
    let finalPrompt = promptText
    for (const [key, value] of Object.entries(variableValues)) {
      finalPrompt = finalPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || `[${key}]`)
    }
    return finalPrompt
  }

  // Function to test the prompt
  const handleTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Check if all variables have values
      const missingVariables = variables.filter((v) => !variableValues[v])
      if (missingVariables.length > 0) {
        toast({
          title: "Missing variables",
          description: `Please provide values for: ${missingVariables.join(", ")}`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await testPrompt({
        promptId,
        prompt: promptText,
        systemMessage,
        variables: variableValues,
      })

      if (result.success && result.data) {
        setTestResult(result.data)
        // Add to history
        setTestHistory((prev) => [result.data, ...prev].slice(0, 10))
        setActiveTab("result")
      } else {
        toast({
          title: "Test failed",
          description: result.error || "Failed to test prompt. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing prompt:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to save test result
  const handleSaveTest = async () => {
    if (!testResult) return

    try {
      const result = await savePromptTest(testResult)

      if (result.success) {
        toast({
          title: "Test saved",
          description: "The test result has been saved successfully.",
        })
      } else {
        toast({
          title: "Save failed",
          description: result.error || "Failed to save test. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving test:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to restore a test from history
  const handleRestoreTest = (test: any) => {
    const restoredVariables: Record<string, string> = {}
    Object.entries(test.variables).forEach(([key, value]) => {
      restoredVariables[key] = value as string
    })

    setVariableValues(restoredVariables)
    setActiveTab("test")

    toast({
      title: "Test restored",
      description: "Variable values have been restored from the selected test.",
    })
  }

  // Function to format response time
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test Prompt</CardTitle>
        <CardDescription>Fill in the variables and test how the prompt performs with the AI.</CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="result" disabled={!testResult}>
            Result
          </TabsTrigger>
          <TabsTrigger value="history" disabled={testHistory.length === 0}>
            History
          </TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="test" className="space-y-4 mt-4">
            {variables.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Variables</h3>
                {variables.map((variable) => (
                  <div key={variable} className="grid gap-2">
                    <Label htmlFor={variable}>{variable}</Label>
                    <Textarea
                      id={variable}
                      placeholder={`Enter value for ${variable}`}
                      value={variableValues[variable] || ""}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">This prompt doesn't contain any variables.</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">{generateFinalPrompt()}</div>
            </div>

            <Button onClick={handleTest} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test Prompt
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="result" className="space-y-4 mt-4">
            {testResult && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">AI Response</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatResponseTime(testResult.responseTime)}
                    </div>
                  </div>
                  <div
                    ref={responseRef}
                    className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm max-h-[400px] overflow-y-auto"
                  >
                    {testResult.response}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Final Prompt</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm max-h-[200px] overflow-y-auto">
                    {testResult.finalPrompt}
                  </div>
                </div>

                <Button onClick={handleSaveTest} variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Test Result
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {testHistory.length > 0 ? (
              <div className="space-y-4">
                {testHistory.map((test, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Test {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(test.timestamp).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreTest(test)}
                          title="Restore this test"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm line-clamp-2 text-muted-foreground">
                      {test.response.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">No test history available.</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}

