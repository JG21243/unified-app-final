# GitHub Copilot Instructions for unified-app-final

## Project Overview
This is a Next.js 15.2.3 TypeScript AI assistant starter application with React 19, featuring chat interfaces, vector store integration, prompt management, and custom AI tools. The project combines functionality from openai-responses-starter-app and legal-prompts-app.

## Core Technologies
- **Framework**: Next.js 15.2.3 with App Router and React 19
- **Language**: TypeScript 5 in strict mode
- **Styling**: TailwindCSS with custom design tokens
- **Database**: PostgreSQL via Drizzle ORM with Neon driver
- **State Management**: Zustand stores
- **AI Integration**: OpenAI API with vector stores
- **Package Manager**: npm (keep package-lock.json committed)

## Development Guidelines

### File Structure Conventions
- Server Components in `app/` for data fetching
- Client Components in `components/` for interactivity  
- Reusable UI primitives in `components/ui/`
- Server actions in `app/actions/`
- API routes in `app/api/`
- Database schema in `lib/db/`
- Custom tools in `lib/tools/`
- Configuration in `config/`
- Design tokens in `design/`

### Code Style & Patterns
- Use Server Components by default, Client Components only when needed for interactivity
- All exports must use Zod schemas for runtime validation
- Follow React 19 patterns and Next.js App Router conventions
- Tailwind class ordering enforced by headwind ESLint plugin
- Prefer TypeScript strict mode and explicit typing
- Use conventional commit prefixes (feat:, fix:, docs:, etc.)

### Testing Requirements
- Jest with 90% coverage threshold
- Place mocks in `tests/__mocks__/`
- Test files should mirror source structure
- Focus on component behavior and integration tests

### Database & Data
- Use Drizzle ORM for all database operations
- Never run migrations outside CI without explicit confirmation
- Database connection via Neon serverless driver
- Use transactions for complex operations

### AI Integration Patterns
- Vector stores for document search (≤25MB files)
- Custom function calling via `config/functions.ts`
- Streaming responses for real-time UX
- OpenAI API wrappers in `app/api/`

### Security & Safety
- Never commit real API keys (use `.env.example` for templates)
- Avoid uploading non-public data to vector stores without approval
- Destructive commands require `--yes-i-understand` flag
- Use server-only imports for sensitive operations

## Common Patterns

### Creating New Components
```typescript
'use client' // Only if client interactivity needed

import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

interface MyComponentProps extends ComponentProps<'div'> {
  // Use Zod schema for validation if needed
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* Component content */}
    </div>
  )
}
```

### Server Actions Pattern
```typescript
'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'

const schema = z.object({
  // Define schema
})

export async function myAction(formData: FormData) {
  const validatedFields = schema.safeParse({
    // Parse form data
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  // Database operations
  // Revalidate cache if needed
  // Redirect if needed
}
```

### API Route Pattern
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  // Define request schema
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bodySchema.parse(body)
    
    // Process request
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 400 })
  }
}
```

## File Restrictions
- **Never edit**: `public/`, `.next/`, generated artifacts, `node_modules/`
- **Database migrations**: Only in CI or with explicit user confirmation
- **Environment files**: Use `.env.example`, never commit real secrets

## Development Workflow
1. `npm install` - Install dependencies
2. `npm run lint` - ESLint + Prettier
3. `npm run type-check` - TypeScript validation
4. `npm test` - Jest tests
5. `npm run build` - Next.js build

Run full sequence before opening/merging PRs.

## Environment Variables
- `OPENAI_API_KEY` - OpenAI API access
- `VECTOR_STORE_ID` - Default vector store
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_API_BASE` - Public API endpoint

## Additional Notes
- This project has an extensive AGENTS.md file - reference it for detailed project context
- Use feature branches with squash-merge for linear history
- Prefer minimal, surgical changes over large refactors
- Document complex business logic and AI integration patterns
- Consider mobile responsiveness for all UI changes