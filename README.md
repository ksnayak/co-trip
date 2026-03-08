# CoTrip

Collaborative trip planning platform. Build itineraries, track budgets, manage reservations, and plan trips with your travel crew.

**Live Demo**: [https://co-trip-wine.vercel.app](https://co-trip-wine.vercel.app)

## Features

- **Itinerary Board** — Drag-and-drop daily planner with activities, times, and locations
- **Real-time Collaboration** — Changes sync instantly across all connected users
- **Budget Tracking** — Log expenses, view spending by category with charts
- **Checklists** — Packing lists, to-dos, and custom checklists with assignees
- **Reservations** — Track hotels, flights, restaurants with confirmation codes
- **File Sharing** — Upload and organize trip documents and photos
- **Expense Splitting** — Equal or custom splits among trip members with settlement tracking
- **Multi-currency Support** — INR, USD, EUR, GBP, JPY, AUD, CAD, THB
- **Role-based Access** — Owner, editor, and viewer roles with granular permissions
- **Invite System** — Email-based invitations with tokenized accept flow
- **Optimistic Updates** — All mutations update UI instantly with rollback on failure

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, TanStack Router, TanStack Query, TanStack Table, Tailwind CSS, shadcn/ui, @dnd-kit |
| Backend | Express.js (Node.js), TypeScript, layered architecture |
| Database | Supabase (PostgreSQL with RLS) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Realtime | Supabase Realtime (Postgres changes) |
| Storage | Supabase Storage (signed upload URLs) |

## Architecture

```
client/src/
├── features/          # Feature modules (auth, trips, itinerary, budget, etc.)
│   ├── components/    # Feature-specific UI
│   ├── hooks/         # React Query hooks + mutations
│   └── types.ts       # Feature types
├── components/        # Shared UI (shadcn/ui, layout)
├── hooks/             # Shared hooks (useRealtime, useTripRole)
├── lib/               # Supabase client, API client, utils
└── routes/            # TanStack Router file-based routes

server/src/
├── controllers/       # Request handling
├── services/          # Business logic
├── repositories/      # Database queries (Supabase)
├── middleware/         # Auth, role checks, error handling
├── routes/            # Express route definitions
└── types/             # Shared TypeScript types
```

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Database Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/00001_initial_schema.sql` in the Supabase SQL Editor
3. Enable Realtime on these tables: `activities`, `comments`, `checklist_items`, `expenses`, `trip_members`
4. Enable Google OAuth in Supabase Auth settings (optional)

### Backend

```bash
cd server
cp .env.example .env
# Fill in your Supabase URL and service role key
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
# Fill in your Supabase URL and anon key
npm install
npm run dev
```

Open http://localhost:5173

### Environment Variables

**Server** (`server/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Client** (`client/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

## Deployment

- **Frontend**: Deployed on [Vercel](https://co-trip-wine.vercel.app) (`client/`)
- **Backend**: Deployed on Render (`server/`)
- **Database**: Hosted on Supabase
