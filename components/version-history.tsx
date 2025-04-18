"use client"

import { useState } from "react"
import { History, ArrowLeft, ArrowRight, RotateCcw, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { SlideUp } from "./ui/motion"

// Mock version history - in a real app, this would come from an API
const VERSION_HISTORY = [
  {
    id: 1,
    version: "v3",
    prompt:
      "Analyze the following contract and identify any potential legal issues, ambiguities, or clauses that may be disadvantageous to my client: {{contract_text}}",
    systemMessage:
      "You are a legal expert specializing in contract law. Provide detailed analysis with references to relevant legal principles and case law where appropriate.",
    updatedAt: new Date(2023, 6, 15),
    updatedBy: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    changeDescription: "Added more specific instructions for contract analysis",
  },
  {
    id: 2,
    version: "v2",
    prompt: "Review this contract and identify any issues: {{contract_text}}",
    systemMessage: "You are a legal expert specializing in contract law. Provide detailed analysis.",
    updatedAt: new Date(2023, 6, 10),
    updatedBy: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    changeDescription: "Updated system message for better context",
  },
  {
    id: 3,
    version: "v1",
    prompt: "Review this contract: {{contract_text}}",
    systemMessage: "You are a legal expert.",
    updatedAt: new Date(2023, 6, 5),
    updatedBy: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    changeDescription: "Initial version",
  },
]

interface VersionHistoryProps {
  promptId: number
  onClose?: () => void
}

export function VersionHistory({ promptId, onClose }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState(VERSION_HISTORY[0])
  const [isRestoring, setIsRestoring] = useState(false)

  const handleRestore = () => {
    setIsRestoring(true)

    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Version restored",
        description: `Restored to version ${selectedVersion.version}`,
      })

      setIsRestoring(false)
      if (onClose) onClose()
    }, 1000)
  }

  const handleNavigate = (direction: "prev" | "next") => {
    const currentIndex = VERSION_HISTORY.findIndex((v) => v.id === selectedVersion.id)

    if (direction === "prev" && currentIndex < VERSION_HISTORY.length - 1) {
      setSelectedVersion(VERSION_HISTORY[currentIndex + 1])
    } else if (direction === "next" && currentIndex > 0) {
      setSelectedVersion(VERSION_HISTORY[currentIndex - 1])
    }
  }

  return (
    <SlideUp>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Version History
              </CardTitle>
              <CardDescription>View and restore previous versions of this prompt</CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedVersion.version}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(selectedVersion.updatedAt, { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate("prev")}
                disabled={VERSION_HISTORY.findIndex((v) => v.id === selectedVersion.id) === VERSION_HISTORY.length - 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate("next")}
                disabled={VERSION_HISTORY.findIndex((v) => v.id === selectedVersion.id) === 0}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-muted/50 p-3 rounded-lg">
            <Avatar>
              <AvatarImage src={selectedVersion.updatedBy.avatar} alt={selectedVersion.updatedBy.name} />
              <AvatarFallback>
                {selectedVersion.updatedBy.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{selectedVersion.updatedBy.name}</div>
              <div className="text-xs text-muted-foreground">{selectedVersion.changeDescription}</div>
            </div>
          </div>

          <Tabs defaultValue="prompt">
            <TabsList className="mb-4">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="system">System Message</TabsTrigger>
              <TabsTrigger value="diff">Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="prompt">
              <div className="bg-muted/50 p-3 rounded-lg whitespace-pre-wrap text-sm">{selectedVersion.prompt}</div>
            </TabsContent>

            <TabsContent value="system">
              <div className="bg-muted/50 p-3 rounded-lg whitespace-pre-wrap text-sm">
                {selectedVersion.systemMessage}
              </div>
            </TabsContent>

            <TabsContent value="diff">
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                {/* In a real app, this would show a diff between versions */}
                <p className="text-muted-foreground text-center py-4">Diff view would show changes between versions</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" className="gap-2" onClick={() => window.open("#", "_blank")}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          <Button
            onClick={handleRestore}
            disabled={isRestoring || VERSION_HISTORY.findIndex((v) => v.id === selectedVersion.id) === 0}
            className="gap-2"
          >
            {isRestoring ? (
              <>
                <span className="animate-spin">⏳</span>
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Restore This Version
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </SlideUp>
  )
}

