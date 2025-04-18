"use client"

import { useState } from "react"
import { Bot, Sparkles, X, Copy, Check, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { SlideUp } from "@/components/ui/motion"

// Mock AI suggestions - in a real app, this would come from an API
const PROMPT_SUGGESTIONS = [
  {
    title: "Contract Analysis",
    prompt:
      "Analyze the following contract and identify any potential legal issues, ambiguities, or clauses that may be disadvantageous to my client: {{contract_text}}",
    systemMessage:
      "You are a legal expert specializing in contract law. Provide detailed analysis with references to relevant legal principles and case law where appropriate.",
  },
  {
    title: "Legal Research Summary",
    prompt:
      "Summarize the key legal principles and precedents related to {{legal_topic}} in the jurisdiction of {{jurisdiction}}.",
    systemMessage:
      "You are a legal researcher with expertise in multiple jurisdictions. Provide accurate summaries with citations to relevant statutes and case law.",
  },
  {
    title: "Client Advice Template",
    prompt:
      "Based on the following facts: {{case_facts}}, provide legal advice for my client regarding their rights and options in this {{case_type}} matter.",
    systemMessage:
      "You are a legal advisor. Provide balanced, practical advice that considers both legal rights and practical considerations. Always note that this is general advice and not a substitute for personalized legal counsel.",
  },
]

interface AiPromptAssistantProps {
  onSelectPrompt?: (prompt: { title: string; prompt: string; systemMessage: string }) => void
}

export function AiPromptAssistant({ onSelectPrompt }: AiPromptAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [description, setDescription] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState<{
    title: string
    prompt: string
    systemMessage: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description of the prompt you need.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // In a real app, this would be an API call to an AI service
      const randomIndex = Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)
      const suggestion = PROMPT_SUGGESTIONS[randomIndex]

      setGeneratedPrompt({
        title: `AI-Generated: ${suggestion.title}`,
        prompt: suggestion.prompt,
        systemMessage: suggestion.systemMessage,
      })

      setIsGenerating(false)
      setActiveTab("result")
    }, 2000)
  }

  const handleCopy = () => {
    if (!generatedPrompt) return

    navigator.clipboard.writeText(
      `Title: ${generatedPrompt.title}\n\nPrompt: ${generatedPrompt.prompt}\n\nSystem Message: ${generatedPrompt.systemMessage}`,
    )

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard.",
    })
  }

  const handleUse = () => {
    if (!generatedPrompt || !onSelectPrompt) return

    onSelectPrompt(generatedPrompt)
    setIsOpen(false)
    setGeneratedPrompt(null)
    setDescription("")

    toast({
      title: "Prompt applied",
      description: "The AI-generated prompt has been applied to the form.",
    })
  }

  if (!isOpen) {
    return (
      <Button variant="outline" className="gap-2 group relative overflow-hidden" onClick={() => setIsOpen(true)}>
        <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="relative">AI Prompt Assistant</span>
      </Button>
    )
  }

  return (
    <SlideUp>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Prompt Assistant
              </CardTitle>
              <CardDescription>Get AI-powered suggestions for legal prompts</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="result" disabled={!generatedPrompt && !isGenerating}>
                Result
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Describe what you need</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., I need a prompt for analyzing contracts for potential legal issues..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-sm text-muted-foreground">Or choose from templates</Label>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs">
                      <Lightbulb className="h-3 w-3 mr-1 text-yellow-500" />
                      Suggestions
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3 text-left"
                      onClick={() => {
                        setGeneratedPrompt(suggestion)
                        setActiveTab("result")
                      }}
                    >
                      <div>
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{suggestion.prompt}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : generatedPrompt ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={generatedPrompt.title} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>Prompt</Label>
                    <div className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap text-sm">
                      {generatedPrompt.prompt}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>System Message</Label>
                    <div className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap text-sm">
                      {generatedPrompt.systemMessage}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No prompt generated yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setActiveTab("generate")}>
            Back
          </Button>

          <div className="flex gap-2">
            {generatedPrompt && (
              <>
                <Button variant="outline" className="gap-2" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>

                <Button className="gap-2" onClick={handleUse}>
                  <Sparkles className="h-4 w-4" />
                  Use This Prompt
                </Button>
              </>
            )}

            {!generatedPrompt && activeTab === "generate" && (
              <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="gap-2">
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Prompt
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </SlideUp>
  )
}

