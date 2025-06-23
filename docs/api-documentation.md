# API Documentation

This guide lists all server actions and API routes available in the project. Each section includes the function or route signature, a brief description, and an example usage when applicable.

## Server Actions

Server actions are defined under `app/actions.ts` and `app/actions/ai-actions.ts`. They are invoked from client components using the `use server` directive and handle database or OpenAI interactions.

### Prompt Management

#### `getPrompts()`
Fetch all prompts from the database.
```ts
import { getPrompts } from '@/app/actions'
const { prompts, error } = await getPrompts()
```

#### `getPromptById(id: number)`
Retrieve a single prompt by its numeric ID.

#### `getLegalPrompts(options?)`
Return a paginated list of legal prompts. Options include `search`, `category`, `limit`, and `offset`.
```ts
const { prompts, total } = await getLegalPrompts({ limit: 20 })
```

#### `getLegalPromptById(id: number)`
Return a detailed prompt object or `null` if not found.

#### `createPrompt(formData: FormData)`
Legacy helper used for simple form submissions. Inserts a new prompt and redirects.

#### `createLegalPrompt(data)`
Validate and create a prompt from a typed object.
```ts
const result = await createLegalPrompt({
  name: 'Example',
  prompt: 'Tell me about {{topic}}',
  category: 'general',
  systemMessage: null,
})
if (result.success) {
  console.log(result.data?.id)
}
```

#### `updatePrompt(id: number, formData: FormData)`
Update an existing prompt with standard form data and redirect.

#### `updateLegalPrompt(id: number, data)`
Update a prompt using a typed object. Returns the updated record on success and
sets the `updatedAt` timestamp to the current time.

#### `deletePrompt(id: number)`
Remove a prompt and redirect to the home page.

#### `duplicateLegalPrompt(id: number)`
Create a copy of an existing prompt and return the new prompt details.

#### `deleteLegalPrompt(id: number)`
Delete a prompt without redirecting. Returns a success flag or error message.

#### `bulkDeletePrompts(ids: string[])`
Delete multiple prompts by ID array.

#### `getCategories()`
Fetch the list of unique prompt categories.

#### `getPromptStats()`
Return statistics including total prompt count, per-category counts, and other metrics.

#### `getPromptTags(promptId: number)`
Return tags associated with a prompt (mock implementation).

#### `getAllTags()` / `createTag(tag: string)` / `deleteTag(tag: string)`
Helpers for tag management (mostly mock implementations).

#### `getPromptVersions(promptId: number)` / `restorePromptVersion(promptId, versionId)`
Handle basic version retrieval and restore logic.

#### `testPrompt(content, variables)`
Mock testing helper that echoes the processed prompt.

#### `savePromptTest(testResult)`
Persist a prompt test result (mock).

#### `getPromptAnalytics(promptId, timeRange)`
Return analytics data for a prompt (mock).

### AI Actions

#### `testPrompt(prompt, systemMessage?, variableValues?)`
Located in `app/actions/ai-actions.ts`. Sends the constructed prompt to OpenAI and returns the model response.
```ts
const { success, response } = await testPrompt(
  'Write a short note about {{topic}}',
  'You are a helpful assistant',
  { topic: 'contracts' }
)
```

## API Routes

API routes live under `app/api/`. They expose HTTP endpoints that can be called from the client or external services.

### `/api/ai` – POST
Generate a chat completion from OpenAI. Expects `{ prompt, systemMessage? }` in the request body and returns `{ response }`.

### `/api/turn_response` – POST
Stream tool calling or message events from OpenAI as Server-Sent Events (SSE). Send `{ messages, tools }` in the request body.

### `/api/functions/*`
Utility endpoints used for tool calling examples.
- **`/api/functions/get_joke`** – GET: fetches a programming joke from an external API.
- **`/api/functions/get-weather`** – GET: returns a fixed sample weather response.
- **`/api/functions/get_weather`** – GET: retrieves real weather data using Open‑Meteo.
- **`/api/functions/get-joke`** – GET: returns a static joke.

### `/api/vector_stores/*`
Endpoints for managing OpenAI vector stores.
- **`/api/vector_stores/create_store`** – POST: create a new vector store.
- **`/api/vector_stores/add_file`** – POST: add an uploaded file to an existing store.
- **`/api/vector_stores/upload_file`** – POST: upload a file (≤25MB) for embedding.
- **`/api/vector_stores/list_files`** – GET: list files in a vector store (provide `vector_store_id` query param).
- **`/api/vector_stores/retrieve_store`** – GET: retrieve store metadata by ID.

### `/api/prompts` – GET
Return all prompts with fallback data when the database is unavailable. Used by
client hooks to populate prompt selectors.

