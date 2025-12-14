"use client"

import { useState } from "react"
import { Users, Share2, Lock, Globe, UserPlus, Copy, Check, Settings, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Section } from "./layout/section"
import { SlideUp } from "./ui/motion"

// Mock team members - in a real app, this would come from an API
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Admin",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Editor",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Viewer",
  },
]

// Mock workspaces - in a real app, this would come from an API
const WORKSPACES = [
  {
    id: 1,
    name: "Contract Templates",
    description: "Standard legal contract templates",
    promptCount: 12,
    members: 5,
    visibility: "private",
  },
  {
    id: 2,
    name: "Client Advice",
    description: "Prompts for client consultations",
    promptCount: 8,
    members: 3,
    visibility: "shared",
  },
  {
    id: 3,
    name: "Research Queries",
    description: "Legal research assistance prompts",
    promptCount: 15,
    members: 7,
    visibility: "public",
  },
]

export function CollaborativeWorkspace() {
  const [activeWorkspace, setActiveWorkspace] = useState(WORKSPACES[0])
  const [shareLink] = useState("https://legal-prompts.app/workspace/contract-templates")
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(activeWorkspace.visibility === "public")

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Link copied",
      description: "Workspace link copied to clipboard",
    })
  }

  const handleVisibilityChange = (checked: boolean) => {
    setIsPublic(checked)

    toast({
      title: `Workspace is now ${checked ? "public" : "private"}`,
      description: `Anyone ${checked ? "with the link can" : "you invite can"} access this workspace`,
    })
  }

  return (
    <SlideUp>
      <Section
        title="Collaborative Workspace"
        description="Share and collaborate on prompts with your team"
        contentClassName="space-y-6"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {activeWorkspace.name}
                </CardTitle>
                <CardDescription>{activeWorkspace.description}</CardDescription>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Workspace Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Workspace Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete Workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                {activeWorkspace.promptCount} Prompts
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeWorkspace.members} Members
              </Badge>

              <Badge
                variant={
                  activeWorkspace.visibility === "public"
                    ? "default"
                    : activeWorkspace.visibility === "shared"
                      ? "secondary"
                      : "outline"
                }
                className="flex items-center gap-1"
              >
                {activeWorkspace.visibility === "public" ? (
                  <Globe className="h-3 w-3" />
                ) : activeWorkspace.visibility === "shared" ? (
                  <Share2 className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {activeWorkspace.visibility === "public"
                  ? "Public"
                  : activeWorkspace.visibility === "shared"
                    ? "Shared"
                    : "Private"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="members">
              <TabsList className="mb-4">
                <TabsTrigger value="members">Team Members</TabsTrigger>
                <TabsTrigger value="sharing">Sharing</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <div className="space-y-4">
                  {TEAM_MEMBERS.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          member.role === "Admin" ? "default" : member.role === "Editor" ? "secondary" : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button className="w-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite New Member
                </Button>
              </TabsContent>

              <TabsContent value="sharing" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Workspace Visibility</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        <span>{isPublic ? "Public workspace" : "Private workspace"}</span>
                      </div>
                      <Switch id="visibility" checked={isPublic} onCheckedChange={handleVisibilityChange} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublic
                        ? "Anyone with the link can view this workspace"
                        : "Only invited members can access this workspace"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-link">Share Link</Label>
                    <div className="flex gap-2">
                      <Input id="share-link" value={shareLink} readOnly className="flex-1" />
                      <Button variant="outline" size="icon" onClick={handleCopyLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <div className="flex -space-x-2">
              {TEAM_MEMBERS.map((member) => (
                <Avatar key={member.id} className="border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium border-2 border-background">
                +2
              </div>
            </div>

            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Workspace
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {WORKSPACES.map((workspace) => (
            <Card
              key={workspace.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeWorkspace.id === workspace.id ? "border-primary" : ""
              }`}
              onClick={() => setActiveWorkspace(workspace)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{workspace.name}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    {workspace.promptCount} Prompts
                  </Badge>

                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {workspace.members} Members
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </SlideUp>
  )
}

