"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import { Item } from "@/lib/assistant";
import { Bot, Loader, Send, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  prompts: { id: number; prompt: string; name: string }[];
  onSelectPrompt: (prompt: { id: number; prompt: string }) => void;
}

const Chat: React.FC<ChatProps> = ({ items, onSendMessage, isLoading = false, prompts, onSelectPrompt }) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const [inputMessageText, setinputMessageText] = useState<string>("");
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  // This state is used to provide better user experience for non-English IMEs such as Japanese
  const [isComposing, setIsComposing] = useState(false);

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  // Open prompt picker with Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPickerOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        onSendMessage(inputMessageText);
        if (selectedPromptId !== null) {
          onSelectPrompt({ id: selectedPromptId, prompt: inputMessageText });
        } else {
          onSelectPrompt({ id: -1, prompt: inputMessageText });
        }
        setSelectedPromptId(null);
        setinputMessageText("");
      }
    },
    [onSendMessage, inputMessageText, isComposing, selectedPromptId, onSelectPrompt]
  );

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  return (
    <div className="flex justify-center items-center size-full">
      <div className="flex grow flex-col h-full max-w-[750px] gap-2">
        <div className="h-[calc(90vh-100px)] overflow-y-scroll px-4 md:px-6 flex flex-col scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="mt-auto space-y-2 py-4">
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 my-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-4 mb-4 shadow-md">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Welcome to Gemini 2.5 Pro</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Ask me anything and I&apos;ll do my best to help you with your questions.</p>
              </div>
            )}
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.type === "tool_call" ? (
                  <ToolCall toolCall={item} />
                ) : item.type === "message" ? (
                  <div className="flex flex-col gap-1">
                    <Message message={item} />
                    {item.content &&
                      item.content[0].annotations &&
                      item.content[0].annotations.length > 0 && (
                        <Annotations
                          annotations={item.content[0].annotations}
                        />
                      )}
                  </div>
                ) : null}
              </React.Fragment>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full p-2 flex items-center justify-center h-8 w-8 mt-1 shadow-md">
                    <Bot size={16} />
                  </div>
                  <div className="mr-4 rounded-2xl px-4 py-3 md:mr-8 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 h-4 w-4 relative">
                        <div className="absolute h-4 w-4 rounded-full animate-ping bg-indigo-400 opacity-75"></div>
                        <div className="relative rounded-full h-3 w-3 bg-indigo-500"></div>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">Gemini is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={itemsEndRef} />
          </div>
        </div>
        
        <div className="sticky bottom-0 p-4 md:px-6">
          <div className="relative">
            <div className="flex w-full items-end overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700 transition-all">
              <textarea
                id="prompt-textarea"
                tabIndex={0}
                dir="auto"
                rows={1}
                placeholder="Message Gemini..."
                className="min-h-[48px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={inputMessageText}
                onChange={(e) => {
                  setinputMessageText(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                disabled={isLoading}
              />
              <button
                disabled={!inputMessageText || isLoading}
                data-testid="send-button"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full mr-1 mb-1 transition-all ${
                  inputMessageText && !isLoading 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
                onClick={() => {
                  if (inputMessageText.trim()) {
                    onSendMessage(inputMessageText);
                    if (selectedPromptId !== null) {
                      onSelectPrompt({ id: selectedPromptId, prompt: inputMessageText });
                    } else {
                      onSelectPrompt({ id: -1, prompt: inputMessageText });
                    }
                    setSelectedPromptId(null);
                    setinputMessageText("");
                    // Reset textarea height
                    const textarea = document.getElementById('prompt-textarea');
                    if (textarea) textarea.style.height = 'auto';
                  }
                }}
              >
                {isLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Press Enter to send, Shift+Enter for a new line
            </p>
            {isPickerOpen && (
              <CommandDialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <CommandInput
                  value={pickerQuery}
                  onValueChange={setPickerQuery}
                  placeholder="Search prompts..."
                />
                <CommandList>
                  {prompts.filter((p) => p.name.toLowerCase().includes(pickerQuery.toLowerCase())).map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => {
                        setinputMessageText(p.prompt);
                        setSelectedPromptId(p.id);
                        setIsPickerOpen(false);
                        setPickerQuery("");
                      }}
                    >
                      {p.name}
                    </CommandItem>
                  ))}
                  {prompts.filter((p) => p.name.toLowerCase().includes(pickerQuery.toLowerCase())).length === 0 && <CommandEmpty>No prompts found.</CommandEmpty>}
                </CommandList>
              </CommandDialog>
            )}
            {inputMessageText.startsWith("/prompt") && (
              <div className="absolute bottom-14 left-0 right-0 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto z-10">
                {prompts
                  .filter((p) => p.name.toLowerCase().includes(inputMessageText.slice(7).trim().toLowerCase()))
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                      onClick={() => {
                        setinputMessageText(p.prompt);
                        setSelectedPromptId(p.id);
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <button
          className="md:hidden fixed bottom-20 right-4 bg-primary text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsPickerOpen(true)}
        >
          Prompts
        </button>
      </div>
    </div>
  );
};

export default Chat;
