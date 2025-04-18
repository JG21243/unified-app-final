# AI Assistant Starter App

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS_15-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![TailwindCSS](https://img.shields.io/badge/Styled_with-TailwindCSS-38bdf8)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6)

A modern, feature-rich AI assistant application built on the [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) with Next.js 15 and TypeScript. This responsive web application provides an intuitive chat interface with powerful AI capabilities.

![AI Assistant Screenshot](your-screenshot-url-here)

## ✨ Features

- **Modern UI with Dark/Light Mode** - Sleek, responsive interface with theme support
- **Multi-turn Conversation** - Natural, contextual conversation handling
- **Vector Store Integration** - Upload and search through your documents
- **Web Search Capabilities** - AI-powered web search tool integration
- **File Search & Processing** - Upload and analyze PDF, code, and text files up to 10MB
- **Function Calling** - Custom function implementation for extended capabilities
- **Streaming Responses** - Real-time streaming of AI responses
- **Rich Content Display** - Support for markdown, code highlighting, and annotations
- **Mobile-Friendly Design** - Optimized experience across all devices

## 🚀 Technologies

- **Next.js 15** - React framework for production
- **TypeScript** - Type safety and improved developer experience
- **TailwindCSS** - Utility-first CSS framework
- **OpenAI API** - Powerful AI model integration
- **Zustand** - State management 
- **React Dropzone** - File upload functionality
- **React Markdown** - Rich text rendering
- **Lucide Icons** - Beautiful, consistent icon set

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- OpenAI API key

### Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/openai/openai-responses-starter-app.git
   cd openai-responses-starter-app
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up OpenAI API Key:**

   Create a `.env.local` file in the project root:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

   You can get your API key from the [OpenAI platform](https://platform.openai.com/api-keys).

4. **Start Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## 📚 Features in Detail

### Vector Store for Document Search

Upload and search through your documents using the integrated vector store:
- Support for code files, PDFs, text documents, and more
- File size limit of 10MB
- Create and manage vector stores for document collections

### Web Search Integration

Configure and use the AI-powered web search tool to find relevant information online during conversations.

### Function Calling

The application includes several pre-built AI functions:
- Get weather information
- Retrieve jokes
- More can be added through the extensible function framework

### Responsive Design

The application is fully responsive with:
- Dedicated mobile navigation
- Optimized layouts for all screen sizes
- Touch-friendly interface elements

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve this starter app.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Unified Repo Notes
This project is a merged codebase combining openai-responses-starter-app and legal-prompts-app. Duplicate configs were consolidated on 2025-04-18.
