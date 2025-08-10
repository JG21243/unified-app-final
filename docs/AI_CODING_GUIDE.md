# AI Coding Assistant Guide

## Overview

This document provides specific guidance for AI coding assistants (GitHub Copilot, Cursor, etc.) working with the unified-app-final repository.

## Quick Start for AI Assistants

### Essential Files to Review

1. **AGENTS.md** - Comprehensive project operating manual
2. **.github/copilot-instructions.md** - GitHub Copilot specific guidelines
3. **.cursorrules** - Cursor AI specific rules
4. **package.json** - Dependencies and scripts
5. **tsconfig.json** - TypeScript configuration

### Pre-Development Checklist

- [ ] Run `npm install` to install dependencies
- [ ] Review existing code patterns in components/
- [ ] Check app/ directory structure for App Router patterns
- [ ] Understand Drizzle ORM schema in lib/db/
- [ ] Review TailwindCSS configuration

### Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run quality checks
npm run lint
npm run type-check
npm test

# 3. Start development
npm run dev

# 4. Build for production
npm run build
```

## Code Patterns & Best Practices

### Component Architecture

- **Server Components**: Default choice for data fetching
- **Client Components**: Only for user interactions
- **UI Components**: Reusable primitives in components/ui/

### TypeScript Standards

- Strict mode enabled
- Zod validation for all data schemas
- Explicit typing preferred
- Interface over type for props

### Database Operations

- Use Drizzle ORM exclusively
- Implement proper error handling
- Use transactions for complex operations
- Never suggest running migrations without confirmation

### Styling Guidelines

- TailwindCSS utility classes only
- Follow headwind plugin ordering
- Use cn() utility for conditional classes
- Support dark/light modes

## Security & Safety Rules

### Environment Variables

- Never commit real API keys
- Use .env.example for documentation
- Validate all environment variables

### Data Handling

- Validate inputs with Zod schemas
- Use server-only imports for sensitive code
- Implement proper error boundaries

### AI Integration

- Vector store files ≤25MB limit
- Never upload sensitive data without approval
- Implement streaming for better UX

## Testing Requirements

- Jest with 90% coverage threshold
- Component behavior testing focus
- Integration tests for complex features
- Mock external dependencies appropriately

## Common Pitfalls to Avoid

1. Using Client Components when Server Components suffice
2. Direct database queries without Drizzle ORM
3. Hardcoding configuration values
4. Ignoring TypeScript strict mode errors
5. Not following TailwindCSS ordering conventions
6. Committing environment files with real secrets

## File Structure Quick Reference

```
app/                 # Next.js App Router pages & API
├── actions/         # Server Actions
├── api/            # API Route Handlers
├── chat/           # Chat interface pages
└── prompts/        # Prompt management pages

components/         # React components
├── ui/            # Primitive UI components
└── ...            # Feature components

lib/               # Server-side utilities
├── db/           # Database schema & operations
├── tools/        # Custom AI tools
└── server/       # Server utilities

config/           # Configuration files
design/           # Design tokens & themes
scripts/          # Build & development scripts
stores/           # Zustand state stores
tests/            # Jest test files
```

## AI Tool Integration Notes

### GitHub Copilot

- Configured via .github/copilot-instructions.md
- Enabled for all TypeScript/React files
- Inline suggestions and chat enabled

### Cursor AI

- Configured via .cursorrules file
- Follows same patterns as Copilot
- Enhanced with project-specific context

### VSCode Extensions

- Full list in .vscode/extensions.json
- Includes linting, formatting, and AI tools
- Optimized settings in .vscode/settings.json

## Getting Help

- Review AGENTS.md for comprehensive project context
- Check existing components for patterns
- Refer to Next.js 15 and React 19 documentation
- Consult Drizzle ORM docs for database operations
