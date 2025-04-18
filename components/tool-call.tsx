import React from "react";

import { ToolCallItem } from "@/lib/assistant";
import { BookOpenText, Globe, Loader2, Code, Search } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ToolCallProps {
  toolCall: ToolCallItem;
}

function ApiCallCell({ toolCall }: ToolCallProps) {
  const isCompleted = toolCall.status === "completed";
  
  return (
    <div className="flex flex-col w-full md:w-[80%] relative mb-2">
      <div className="w-full">
        <div className="flex flex-col text-sm rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="font-medium p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <div className={`p-1.5 rounded-full ${isCompleted 
                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 text-blue-600 dark:text-blue-300' 
                : 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/60 dark:to-yellow-900/60 text-amber-600 dark:text-amber-300'}`}>
                {isCompleted ? <Code size={16} /> : <Loader2 size={16} className="animate-spin" />}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isCompleted ? `${toolCall.name}` : `Calling ${toolCall.name}...`}
              </div>
            </div>
            
            {isCompleted && (
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/60 dark:to-emerald-900/60 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
                Completed
              </span>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 py-2">
            <div className="px-4">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Input Parameters</div>
              <div className="max-h-60 overflow-y-auto text-xs rounded-md">
                <SyntaxHighlighter
                  customStyle={{
                    borderRadius: '6px',
                    padding: "12px",
                    marginTop: 0,
                    marginBottom: 8,
                    fontSize: "12px",
                    backgroundColor: "#1e1e1e", // Dark background regardless of mode
                    border: "1px solid rgba(82, 82, 89, 0.32)"
                  }}
                  language="json"
                  style={vscDarkPlus}
                >
                  {JSON.stringify(toolCall.parsedArguments, null, 2)}
                </SyntaxHighlighter>
              </div>
            </div>
            
            <div className="px-4 pt-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Response</div>
              <div className="max-h-60 overflow-y-auto text-xs rounded-md">
                {toolCall.output ? (
                  <SyntaxHighlighter
                    customStyle={{
                      borderRadius: '6px',
                      padding: "12px",
                      marginTop: 0,
                      marginBottom: 0,
                      fontSize: "12px",
                      backgroundColor: "#1e1e1e", // Dark background regardless of mode
                      border: "1px solid rgba(82, 82, 89, 0.32)"
                    }}
                    language="json"
                    style={vscDarkPlus}
                  >
                    {JSON.stringify(JSON.parse(toolCall.output), null, 2)}
                  </SyntaxHighlighter>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2 py-3 px-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="flex-shrink-0 h-4 w-4 relative">
                      <div className="absolute h-4 w-4 rounded-full animate-ping bg-amber-400 opacity-75"></div>
                      <div className="relative rounded-full h-3 w-3 bg-amber-500"></div>
                    </div>
                    <span>Waiting for result...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileSearchCell({ toolCall }: ToolCallProps) {
  const isCompleted = toolCall.status === "completed";
  
  return (
    <div className="flex flex-col w-full relative mb-2">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900">
        {isCompleted ? (
          <BookOpenText size={16} />
        ) : (
          <Loader2 size={16} className="animate-spin" />
        )}
        <div className="text-sm font-medium">
          {isCompleted ? "Searched files" : "Searching files..."}
        </div>
      </div>
    </div>
  );
}

function WebSearchCell({ toolCall }: ToolCallProps) {
  const isCompleted = toolCall.status === "completed";
  
  return (
    <div className="flex flex-col w-full relative mb-2">
      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-700 dark:text-indigo-300 py-2 px-3 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
        {isCompleted ? (
          <Globe size={16} />
        ) : (
          <Search size={16} className="animate-pulse" />
        )}
        <div className="text-sm font-medium">
          {isCompleted ? "Searched the web" : "Searching the web..."}
        </div>
      </div>
    </div>
  );
}

export default function ToolCall({ toolCall }: ToolCallProps) {
  return (
    <div className="flex justify-start py-2">
      {(() => {
        switch (toolCall.tool_type) {
          case "function_call":
            return <ApiCallCell toolCall={toolCall} />;
          case "file_search_call":
            return <FileSearchCell toolCall={toolCall} />;
          case "web_search_call":
            return <WebSearchCell toolCall={toolCall} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
