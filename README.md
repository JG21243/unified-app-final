# AI Assistant Starter App

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS_15.2.3-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![TailwindCSS](https://img.shields.io/badge/Styled_with-TailwindCSS-38bdf8)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6)

This project combines the features of a general AI assistant starter app with functionalities from a "legal-prompts-app". It aims to provide a robust foundation for building advanced AI assistants capable of document interaction, custom tool use, and domain-specific tailoring (e.g., for legal applications). Built with Next.js 15.2.3 and TypeScript, this responsive web application leverages the [OpenAI API](https://platform.openai.com/docs/api-reference/responses) to offer an intuitive chat interface with powerful AI capabilities.

<!-- Suggestion: Consider adding a screenshot or GIF demonstrating the application's chat interface and key features here. -->

## ✨ Features

- **Modern UI with Dark/Light Mode** - Sleek, responsive interface with theme support
- **Multi-turn Conversation** - Natural, contextual conversation handling
- **Vector Store Integration** - Upload and search through your documents
- **Web Search Capabilities** - AI-powered web search tool integration
- **File Search & Processing** - Upload and analyze PDF, code, and text files up to 25MB
- **Function Calling** - Custom function implementation for extended capabilities
- **Streaming Responses** - Real-time streaming of AI responses
- **Rich Content Display** - Support for markdown, code highlighting, and annotations
- **Mobile-Friendly Design** - Optimized experience across all devices

## 🚀 Technologies

- **Next.js 15.2.3** - React framework for production
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
   DATABASE_URL=your_database_url_here
   ```

   You can get your API key from the [OpenAI platform](https://platform.openai.com/api-keys).
   The `DATABASE_URL` is required for storing conversation history and other user-specific data.

4. **Start Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## 💻 Codebase Overview

This section provides a high-level overview of the project's structure and key development utilities.

### Project Structure

The repository is organized as follows:

- **`app/`**: Contains the Next.js application, including pages (routes), API endpoints, and React components forming the user interface. Key subdirectories often include `app/components/` for UI elements and `app/api/` for server-side logic.
- **`lib/`**: Houses core application logic, server-side functions, database interaction utilities (e.g., Prisma client), and integrations with AI services like the OpenAI API.
- **`config/`**: Stores application-wide constants, AI model configurations (e.g., temperature, max tokens), definitions for AI functions/tools, and other static configurations.
- **`scripts/`**: Includes utility scripts for development, maintenance, or build processes (e.g., data seeding, `generate-ui-inventory.js`).
- **`docs/`**: Contains supplementary documentation, guides, or generated reports like `ui-inventory.md`.

### UI Inventory

To aid developers in understanding and navigating the application's UI components, a generation script is provided:

- **Purpose**: The `npm run generate:ui-inventory` script (defined in `package.json` and located at `scripts/generate-ui-inventory.js`) scans the `app/components/` directory.
- **Output**: It generates `docs/ui-inventory.md`, a markdown file listing all discovered UI components.
- **Benefit**: This inventory offers a quick reference to available components, their file paths, and their props (interfaces), valuable for new developers or those looking to reuse existing elements.

## 🚀 Deployment

As a Next.js application, this project can be deployed to any platform that supports Node.js. A common and straightforward option is Vercel, the platform created by the developers of Next.js.

Regardless of the chosen platform, ensure that you configure the necessary environment variables (e.g., `OPENAI_API_KEY`, `DATABASE_URL`) in your deployment environment's settings. These are crucial for the application to function correctly.

## ⚙️ Configuration

This section highlights key files and variables for customizing the application's behavior.

### Environment Variables

For local development, create a `.env.local` file in the project root. Key environment variables include:

- **`OPENAI_API_KEY`**: Essential for accessing the OpenAI API.
- **`DATABASE_URL`**: Required for database connectivity, storing conversation history, and other user-specific data.

Ensure these are also set in your deployment environment.

### Key Configuration Files

Several files in the `config/` directory allow for deeper customization:

- **`config/constants.ts`**: Contains application-wide constants. Adjust settings like the default AI model (e.g., `MODEL`) and the `DEVELOPER_PROMPT` here to influence the AI assistant's responses and behavior.
- **`config/functions.ts`** and **`config/tools-list.ts`**: These files define the custom functions and tools available to the AI assistant. Extend them to add new capabilities or integrate with other services.

## 📚 Features in Detail

### Vector Store for Document Search

Upload and search through your documents using the integrated vector store:
- Support for code files, PDFs, text documents, and more
- File size limit of 25MB
- Create and manage vector stores for document collections
The system uses a default vector store, as defined in `config/constants.ts`. This may be relevant for users looking to customize their setup or integrate their own vector store solutions.

### Web Search Integration

Configure and use the AI-powered web search tool to find relevant information online during conversations.

### Function Calling

The application includes several pre-built AI functions:
- Get weather information
- Retrieve jokes
- More can be added through the extensible function framework

### Legal Prompt Management

This feature, originating from the "legal-prompts-app" integration, allows for managing and utilizing a curated list of prompts. While initially designed for legal applications, it can be adapted for various specialized domains requiring predefined prompt templates. The `app/components/legal-prompts-list.tsx` component renders these prompts, with data likely sourced from `scripts/prompts-data.json`.

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
