export const MODEL = "gpt-4o-mini";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are a helpful AI assistant. Your goal is to provide accurate and concise responses to user queries.
When current information is needed, use the web search tool.
When the user refers to their own data or documents, use the file search tool.
If the user provides specific context about themselves or their preferences, use the save_context tool to remember it for future interactions.
`;

// Context available to the assistant:
// ${context}

// Initial message displayed in the chat interface
export const INITIAL_MESSAGE = `Hi! How can I assist you today?`;

export const defaultVectorStore = {
  id: "", // Default vector store ID, can be replaced by user's selection
  name: "Example", // Default vector store name
};
