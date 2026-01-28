# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Synkra AIOS Development Framework

This repository is part of **Synkra AIOS**, an AI-Orchestrated System for Full Stack Development. The following guidelines apply to all work.

### Agent System

**Important:** Agents are activated with @agent-name syntax: `@dev`, `@qa`, `@architect`, `@pm`, `@po`, `@sm`, `@analyst`

The master agent is activated with `@aios-master`. Agent commands use the `*` prefix: `*help`, `*create-story`, `*task`, `*exit`

When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

### Story-Driven Development

1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: `[ ]` → `[x]`
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Workflow Execution

1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

Workflows with `elicit: true` require user input. Present options clearly, validate responses, and provide helpful defaults.

### Commit Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID when applicable: `feat: implement feature [Story X.Y]`
- Keep commits atomic and focused

### Critical Rules for Development

#### NEVER
- ❌ Implement without showing options first (always use 1, 2, 3 format)
- ❌ Delete/remove content without asking first
- ❌ Delete anything created in the last 7 days without explicit approval
- ❌ Change something that was already working
- ❌ Pretend work is done when it isn't
- ❌ Process batch without validating one first
- ❌ Add features that weren't requested
- ❌ Use mock data when real data exists in database
- ❌ Explain/justify when receiving criticism (just fix)
- ❌ Trust AI/subagent output without verification
- ❌ Create from scratch when similar exists in squads/

#### ALWAYS
- ✅ Present options as "1. X, 2. Y, 3. Z" format
- ✅ Use AskUserQuestion tool for clarifications
- ✅ Check squads/ and existing components before creating new
- ✅ Read COMPLETE schema before proposing database changes
- ✅ Investigate root cause when error persists
- ✅ Commit before moving to next task
- ✅ Create handoff in `docs/sessions/YYYY-MM/` at end of session

## Project Overview

Gestão TZK is a Next.js 16 full-stack application for managing clients, projects, and associated workflows. It features project lifecycle management, financial tracking, kanban boards, and client onboarding flows.

**Tech Stack:**
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS 4 with shadcn/ui components
- **Authentication:** JWT-based session management with httpOnly cookies
- **Form Handling:** React Hook Form with Zod validation
- **UI Components:** Radix UI primitives + shadcn/ui

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code with ESLint
npm run lint

# Type check (built into Next.js)
npm run build
```

Note: There are no dedicated test scripts currently configured.

## Project Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router structure
│   ├── (main)/            # Protected routes with sidebar layout
│   │   ├── admin/         # Admin features (financial, templates)
│   │   ├── dashboard/     # Client/user dashboards
│   │   ├── projects/      # Project management
│   │   ├── kanban/        # Kanban board views
│   │   ├── meeting/       # Meeting management
│   │   ├── onboarding/    # Client onboarding flows
│   │   ├── deliveries/    # Delivery tracking
│   │   └── [other routes] # Other features
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Root redirect page
├── components/
│   ├── ui/                # shadcn/ui components (Dialogs, Buttons, etc.)
│   ├── admin/             # Admin-specific components
│   ├── financial/         # Financial dashboard components
│   ├── meeting/           # Meeting-related components
│   ├── dashboard/         # Dashboard components
│   ├── sidebar.tsx        # Main navigation sidebar
│   ├── client-onboarding.tsx
│   └── theme-provider.tsx # Dark mode provider
├── lib/
│   ├── auth.ts            # JWT encryption/decryption, session management
│   ├── prisma.ts          # Singleton Prisma client
│   ├── schemas.ts         # Zod validation schemas
│   ├── date-utils.ts      # Date formatting and calculation utilities
│   ├── google-drive.ts    # Google Drive integration
│   ├── project-utils.ts   # Project-related utility functions
│   ├── standard-tasks.ts  # Standard task templates
│   └── utils.ts           # General utilities (classname helpers, etc.)
├── contexts/
│   └── role-context.tsx   # Role-based context provider
├── middleware.ts          # Next.js middleware for auth checks
└── scripts/               # Utility scripts (database debugging, etc.)
```

### Key Pages and Their Actions

Each page directory typically contains:
- `page.tsx` - UI component (Server or Client)
- `actions.ts` - Server actions for data mutations (marked with `'use server'`)

**Major Routes:**
- `/login` - Authentication
- `/(main)/dashboard` - Client project dashboard
- `/(main)/projects/[id]` - Individual project management
- `/(main)/projects/[id]/briefing` - Project briefing form
- `/(main)/kanban` - Kanban board view
- `/(main)/admin/financial` - Financial management and forecasting
- `/(main)/admin/templates` - Task template management
- `/(main)/meeting` - Meeting scheduling and management
- `/(main)/onboarding` - Client onboarding process

## Database Schema

The Prisma schema defines the core data model. Key entities include:

- **Client** - External clients with projects
- **Project** - Client projects with stages, tasks, and financial contracts
- **ProjectStage** - 7-stage workflow per project (some stages support multiple funnels)
- **Task/TaskTemplate** - Work items assigned to roles with dates
- **ProjectContract** - Contract details with installment tracking
- **StageTemplate/TaskTemplate** - Reusable templates for project stages and tasks
- **ActiveConversation/MessageHistory/AiInsight** - Analytics data for conversations
- **Expense** - Financial tracking for recurring and one-time expenses
- **User** - Admin users with JWT authentication
- **Feedback** - Client feedback management

**Important:** Use `prisma.db.$disconnect()` after operations in non-request contexts (e.g., cron jobs). The Prisma singleton handles normal request cleanup.

## Authentication & Authorization

- **Session Management:** JWT tokens stored in httpOnly cookies, 24-hour expiration
- **Role-Based:** User roles (ADMIN, CLOSER, CRM, IA, PRODUCT_OWNER, CLIENT) defined in schema
- **Middleware:** `src/middleware.ts` redirects unauthenticated users to login
- **Session Access:** Use `getSession()` from `@/lib/auth.ts` to get current user context

**Session object structure:**
```typescript
{
  user: {
    id: string
    email: string
    role: Role
  }
}
```

## Server Actions Pattern

All data mutations use server actions (marked with `'use server'`):

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function updateSomething(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // Validate input with Zod schemas from @/lib/schemas.ts
  // Perform database operations
  // Return updated data or redirect

  revalidatePath('/path') // Trigger ISR if needed
}
```

**Key conventions:**
- All server actions check authentication via `getSession()`
- Use Zod schemas for validation
- Call `revalidatePath()` to refresh cache after mutations
- Handle errors explicitly with meaningful messages

## Form Handling

Forms use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { someSchema } from '@/lib/schemas'

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(someSchema),
    defaultValues: {}
  })

  // Use form.handleSubmit with server action
}
```

Validation schemas are centralized in `src/lib/schemas.ts`.

## UI Components & Styling

- **Component Library:** shadcn/ui provides pre-built Radix UI components
- **Styling:** Tailwind CSS 4 with utility-first approach
- **Dark Mode:** next-themes integration, toggle in header
- **Responsive:** Tailwind breakpoints (mobile-first)

### Common UI Patterns

```typescript
// Button
<Button onClick={handleClick} variant="outline">Action</Button>

// Dialog
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

// Form field
<FormField control={form.control} name="field" render={({ field }) => (
  <FormItem>
    <FormLabel>Label</FormLabel>
    <FormControl>
      <Input {...field} />
    </FormControl>
  </FormItem>
)} />
```

## Common Patterns & Best Practices

### Async Data Fetching (Server Components)

Server components can directly query the database:

```typescript
async function MyComponent() {
  const data = await prisma.model.findMany({
    include: { relations: true }
  })
  return <div>{/* render data */}</div>
}
```

### Client-Server Communication

Client components call server actions:

```typescript
'use client'

export function MyForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await myServerAction(formData)
    // Handle result
  }

  return <form action={handleSubmit}>...</form>
}
```

### Date Handling

- Import from `date-fns` with `ptBR` locale for Portuguese formatting
- Use `src/lib/date-utils.ts` for common date operations (business hours calculations, etc.)
- Format dates using `format()` from date-fns before rendering

### Project Stage Flow

Projects follow a 7-stage workflow. Some stages (typically stage 4) support multiple "funnels":

```
Stage 1 → Stage 2 → Stage 3 → Stage 4 (multi-funnel) → Stage 5 → Stage 6 → Stage 7
```

Stage tracking uses:
- `ProjectStage` model with `stageNumber` and `funnelNumber` (null for non-funnel stages)
- Templates in `StageTemplate` and `TaskTemplate` for task generation

## Code Style & Conventions

**TypeScript:**
- Use explicit types for function parameters and return values
- Strict mode enabled in tsconfig

**File Naming:**
- Components: PascalCase (`MyComponent.tsx`)
- Utilities: camelCase (`my-utility.ts`)
- Server actions: suffix with `.ts` or include in `actions.ts` file

**Path Aliases:**
- Use `@/` prefix for all imports from `src/` directory
- Example: `import { MyComponent } from '@/components/my-component'`

**Error Handling:**
- Check authentication early in server actions
- Use Zod for input validation
- Return meaningful error messages to users
- Consider using `revalidatePath()` after successful mutations

## Git Configuration

The project uses Conventional Commits style. Key branches:
- `master` - Main development branch (default for PRs)

Check `.gitignore` for ignored patterns.

## Environment Variables

Required environment variables (check `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret for JWT signing
- Additional keys for Google Drive integration, OpenAI, etc.

Create `.env.local` for local development (not committed).

## Key Dependencies

- **@prisma/client & prisma** - Database ORM
- **next** - React framework (v16)
- **react & react-dom** - UI library
- **@radix-ui/** - Accessible UI primitives
- **tailwindcss** - Utility CSS
- **react-hook-form** - Form state management
- **zod** - TypeScript-first schema validation
- **date-fns** - Date utilities
- **@dnd-kit/** - Drag-and-drop functionality
- **recharts** - Chart library
- **gantt-task-react** - Gantt chart visualization
- **jose** - JWT handling
- **bcryptjs** - Password hashing
- **googleapis** - Google API integration

## Debugging & Troubleshooting

### Database Issues

- Check connection string in `.env`
- Verify PostgreSQL is running and accessible
- Use Prisma Studio to inspect data: `npx prisma studio`

### Build Errors

- Run `npm run lint` to check TypeScript and eslint issues
- Clear `.next` directory: `rm -rf .next` (or use PowerShell equivalent on Windows)
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Unexpected Behavior

- Check session/authentication with `getSession()`
- Verify database migrations are up to date: `npx prisma migrate status`
- Check browser console and server logs for errors

## Project State

The codebase has many modified files indicating recent active development:
- Financial dashboard and contract management recently added
- Client onboarding process in development
- Multiple feature branches being worked on

Always check git status and recent commits before making changes to understand the current state.

---

## AIOS Framework Structure

```
.aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

## MCP Usage Rules

All MCP infrastructure management is handled EXCLUSIVELY by the **DevOps Agent (@devops / Gage)**.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | DevOps | `*search-mcp` |
| Add MCP server | DevOps | `*add-mcp` |
| List enabled MCPs | DevOps | `*list-mcps` |
| Remove MCP server | DevOps | `*remove-mcp` |
| Setup Docker MCP | DevOps | `*setup-mcp-docker` |

**Critical:** Always prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |
| List directories | `Bash(ls)` or `Glob` | docker-gateway |

Only use docker-gateway when user explicitly says "use docker", "use container", or task specifically requires Docker operations.

### Known MCP Issues

**Docker MCP Secrets Bug (Dec 2025):**
- Credentials set via `docker mcp secret set` are NOT passed to containers
- Workaround: Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly with hardcoded env values
- Affected: Any MCP requiring authentication (Apify, Notion, Slack, etc.)
- Working: EXA (key in `~/.docker/mcp/config.yaml` under `apiKeys`)

## Testing Requirements

- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run build`
- Add tests for new features
- Test edge cases and error scenarios
