"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import { Item } from "@/lib/assistant";
import { Bot, Loader, Send, Sparkles } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import useConversationStore from "@/stores/useConversationStore";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  initialInputMessage?: string;
}

const Chat: React.FC<ChatProps> = ({ items, onSendMessage, isLoading = false, initialInputMessage = "" }) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputMessageText, setinputMessageText] = useState<string>(initialInputMessage);
  // This state is used to provide better user experience for non-English IMEs such as Japanese
  const [isComposing, setIsComposing] = useState(false);
  const { prompts } = usePrompts();
  const { setCurrentPromptId, addUsedPromptId, currentPromptId } = useConversationStore();
  const [suggestions, setSuggestions] = useState<typeof prompts>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !isComposing) {
      event.preventDefault();
      onSendMessage(inputMessageText);
      setinputMessageText("");
    }
  }, [onSendMessage, inputMessageText, isComposing]);

  useEffect(() => {
    const match = inputMessageText.match(/^\/prompt\s*(.*)/i);
    if (match) {
      const q = match[1] || "";
      const filtered = prompts.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputMessageText, prompts]);

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="min-h-full flex flex-col">
          {items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full p-4 mb-6 shadow-lg">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to Legal AI Assistant</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                I'm here to help with your legal workflows. You can ask questions, use saved prompts, 
                or start a conversation about legal topics.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles size={14} />
                  Type <code className="bg-muted px-1 rounded">/prompt</code> to search prompts
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-4 py-4">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.type === "tool_call" ? (
                  <ToolCall toolCall={item} />
                ) : item.type === "message" ? (
                  <div className="space-y-2">
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
            
            <div ref={itemsEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 p-4 md:px-6 bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-4xl mx-auto">
          {/* Show typing indicator if needed */}
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span>AI is thinking...</span>
            </div>
          )}
          
          <div className="relative">
            <div className="flex w-full items-end overflow-hidden rounded-xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <textarea
                id="prompt-textarea"
                ref={textareaRef}
                tabIndex={0}
                dir="auto"
                rows={1}
                placeholder="Type your message... (Use /prompt to search prompts)"
                className="min-h-[52px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground"
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
                aria-label="Message input"
              />
              
              {/* Prompt suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  <div className="p-2 border-b bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground">Available Prompts</span>
                  </div>
                  {suggestions.map((p, index) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0 focus:outline-none focus:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement | null;
                        if (textarea) {
                          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                          setter?.call(textarea, p.prompt);
                          textarea.dispatchEvent(new Event('input', { bubbles: true }));
                          textarea.focus();
                        }
                        setCurrentPromptId(p.id);
                        setShowSuggestions(false);
                      }}
                      aria-label={`Use prompt: ${p.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                      {p.category && (
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {p.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Send button */}
              <div className="flex items-end p-2">
                <button
                  disabled={!inputMessageText.trim() || isLoading}
                  data-testid="send-button"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    inputMessageText.trim() && !isLoading 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (inputMessageText.trim()) {
                      onSendMessage(inputMessageText);
                      if (currentPromptId !== null) {
                        addUsedPromptId(currentPromptId);
                        setCurrentPromptId(null);
                      }
                      setinputMessageText("");
                      // Reset textarea height
                      const textarea = document.getElementById('prompt-textarea');
                      if (textarea) textarea.style.height = 'auto';
                    }
                  }}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
            
            {/* Help text */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{inputMessageText.length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
