/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageItem } from "@/lib/assistant";
import React from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot, Sparkles } from "lucide-react";

interface MessageProps {
  message: MessageItem;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="text-sm">
      {message.role === "user" ? (
        <div className="flex justify-end mb-4">
          <div className="flex items-start gap-3">
            <div className="ml-4 rounded-2xl px-4 py-3 md:ml-8 bg-gradient-to-r from-indigo-100 to-blue-50 dark:from-indigo-900/70 dark:to-blue-900/60 text-gray-800 dark:text-gray-100 shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {message.content[0].text as string}
                </ReactMarkdown>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-2 flex items-center justify-center h-8 w-8 mt-1 shadow-sm">
              <User size={16} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full p-2 flex items-center justify-center h-8 w-8 mt-1 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div className="mr-4 rounded-2xl px-4 py-3 md:mr-8 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown className="markdown-content">
                  {message.content[0].text as string}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
