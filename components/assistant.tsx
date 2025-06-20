"use client";
import React, { useState } from "react";
import Chat from "./chat";
import useConversationStore from "@/stores/useConversationStore";
import { Item, processMessages } from "@/lib/assistant";

export default function Assistant({ prompts }: { prompts: { id: number; name: string; prompt: string }[] }) {
  const {
    chatMessages,
    addConversationItem,
    addChatMessage,
    lastUsedPromptId,
    setLastUsedPromptId,
  } = useConversationStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userItem: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: message.trim() }],
      promptId: lastUsedPromptId || undefined,
    };
    const userMessage: any = {
      role: "user",
      content: message.trim(),
      promptId: lastUsedPromptId || undefined,
    };

    try {
      setIsLoading(true);
      addConversationItem(userMessage as any);
      addChatMessage(userItem);
      await processMessages();
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsLoading(false);
      setLastUsedPromptId(null);
    }
  };

  return (
    <div className="h-full w-full bg-white flex justify-center">
      <div className="w-full max-w-4xl">
        <Chat
          items={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          prompts={prompts}
          onSelectPrompt={(p) => {
            setLastUsedPromptId(p.id === -1 ? null : p.id)
          }}
        />
      </div>
    </div>
  );
}
