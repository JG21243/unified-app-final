"use client"

import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Bot, SparklesIcon, Github, BookOpen, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import ContextPanel from "@/components/tools-panel" // Corrected: ToolsPanel is default export named ContextPanel
import { useState } from "react"
import Assistant from "@/components/assistant" // Added import for Assistant
import ChatPromptSelector from "@/components/chat-prompt-selector"

// Header component for the app
const AppHeader = () => (
  <PageHeader
    title={<AppLogo />}
    actions={<NavActions />}
    className="sticky top-0 z-10 bg-background border-b shadow-sm px-4 sm:px-6 lg:px-8"
  />
)

// App logo and title component
const AppLogo = () => (
  <div className="flex items-center">
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-1.5 mr-2">
      <Bot size={20} />
    </div>
    <h1 className="text-lg font-semibold text-foreground flex items-center">
      AI Assistant
      <ModelBadge />
    </h1>
  </div>
)

// Model badge component
const ModelBadge = () => (
  <span className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
    <SparklesIcon size={12} />
    Gemini 2.5 Pro
  </span>
)

// Navigation actions component
const NavActions = () => (
  <div className="flex items-center space-x-4">
    <div className="hidden md:flex items-center space-x-4 text-sm">
      <a
        href="https://github.com/openai/openai-responses-starter-app"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <Github size={16} />
        <span>GitHub</span>
      </a>
      <a
        href="https://platform.openai.com/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <BookOpen size={16} />
        <span>Docs</span>
      </a>
    </div>
    <ThemeToggle />
  </div>
)

// Configuration panel header component
const ConfigPanelHeader = () => (
  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
    <h2 className="text-lg font-medium text-foreground flex items-center">
      <SparklesIcon size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" />
      Configuration
    </h2>
  </div>
)

// Mobile tools panel component
interface MobileToolsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const MobileToolsPanel = ({ isOpen, onClose }: MobileToolsPanelProps) =>
  isOpen ? (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30 backdrop-blur-sm md:hidden">
      <div className="w-[85%] bg-white dark:bg-gray-900 h-full shadow-lg animate-slide-left">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <SparklesIcon size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" />
            Configuration
          </h2>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onClose}
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>
        <ContextPanel /> {/* Corrected: Use ContextPanel */}
      </div>
    </div>
  ) : null
// Main component
export default function ChatPage() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <AppHeader />

      {/* Main Content */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg my-4 overflow-hidden">
        <div className="w-full md:w-[70%] border-r border-gray-100 dark:border-gray-800">
          <Assistant
            prefill={selectedPrompt}
            renderAboveInput={<ChatPromptSelector onSelect={setSelectedPrompt} />}
          />
        </div>
        <div className="hidden md:block w-[30%] bg-white dark:bg-gray-900">
          <ConfigPanelHeader />
          <ContextPanel />
        </div>

        {/* Mobile menu button */}
        <div className="fixed bottom-4 right-4 md:hidden z-40">
          <button
            onClick={() => setIsToolsPanelOpen(true)}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            aria-label="Open settings"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile tools panel */}
        <MobileToolsPanel isOpen={isToolsPanelOpen} onClose={() => setIsToolsPanelOpen(false)} />
      </div>
    </div>
  )
}