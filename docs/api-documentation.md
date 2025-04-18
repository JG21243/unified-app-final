# API Documentation

This document outlines the server actions and API endpoints available in the Legal Prompts Manager application.

## Server Actions

Server Actions are Next.js functions that run on the server but can be called from the client. They're used for data mutations and server-side operations.

### Prompt Management

#### `getPrompts()`

Retrieves all prompts from the database.

**Returns:**
- `prompts`: Array of prompt objects
- `error`: Error message if any

**Example:**
```tsx
import { getPrompts } from "@/app/actions"

const { prompts, error } = await getPrompts()

