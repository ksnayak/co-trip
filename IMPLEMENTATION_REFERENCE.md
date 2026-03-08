# CoTrip — Implementation Reference

## Overview
Collaborative trip planning platform built as a full-stack app. Plan itineraries, track budgets, manage reservations, and collaborate with your travel crew in real-time.

**Status**: Fully implemented, compiles with zero TypeScript errors on both client and server.

## Tech Stack
- **Frontend**: React 19 + Vite 7 + TanStack Router (file-based) + TanStack Query + TanStack Table + Tailwind CSS v4 + shadcn/ui + @dnd-kit
- **Backend**: Express 5 (Node.js) — layered architecture (controllers → services → repositories)
- **Database/Auth/Realtime/Storage**: Supabase (PostgreSQL with RLS)
- **Deployment**: Vercel (frontend) + Render (backend)

## Project Location
```
/Users/sagarnayak/Developer/Personal/CoTrip/
```

---

## Project Structure

```
CoTrip/
├── client/                                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                            # 19 shadcn/ui primitives
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   └── layout/
│   │   │       ├── AppShell.tsx               # Global header + user menu
│   │   │       └── TripLayout.tsx             # Trip detail layout + tab nav
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/AuthProvider.tsx # Auth context + Supabase auth
│   │   │   │   ├── components/LoginForm.tsx    # Login/signup form
│   │   │   │   ├── hooks/useAuth.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── trips/
│   │   │   │   ├── components/TripCard.tsx     # Trip list card
│   │   │   │   ├── components/TripForm.tsx     # Create trip dialog
│   │   │   │   ├── components/TripHeader.tsx   # Trip actions (edit/delete)
│   │   │   │   ├── components/TripRoleProvider.tsx
│   │   │   │   ├── hooks/useTrips.ts          # CRUD hooks
│   │   │   │   └── trips.types.ts
│   │   │   ├── itinerary/
│   │   │   │   ├── components/ItineraryBoard.tsx   # DnD board with DragOverlay
│   │   │   │   ├── components/DayColumn.tsx         # Droppable day column
│   │   │   │   ├── components/ActivityCard.tsx      # Activity card + edit form
│   │   │   │   ├── components/SortableActivityCard.tsx
│   │   │   │   ├── hooks/useItinerary.ts
│   │   │   │   └── itinerary.types.ts
│   │   │   ├── members/
│   │   │   │   ├── components/MemberList.tsx   # Members + role management
│   │   │   │   ├── components/InviteDialog.tsx # Email invitation
│   │   │   │   ├── hooks/useMembers.ts
│   │   │   │   └── members.types.ts
│   │   │   ├── comments/
│   │   │   │   ├── components/CommentThread.tsx
│   │   │   │   ├── hooks/useComments.ts
│   │   │   │   └── comments.types.ts
│   │   │   ├── checklists/
│   │   │   │   ├── components/ChecklistPanel.tsx # Checklists + items + progress
│   │   │   │   ├── hooks/useChecklists.ts
│   │   │   │   └── checklists.types.ts
│   │   │   ├── budget/
│   │   │   │   ├── components/ExpenseTable.tsx    # TanStack Table + sorting
│   │   │   │   ├── components/BudgetSummary.tsx   # Pie chart + progress bar
│   │   │   │   ├── components/ExpenseForm.tsx
│   │   │   │   ├── hooks/useExpenses.ts
│   │   │   │   └── budget.types.ts
│   │   │   ├── files/
│   │   │   │   ├── components/FileGrid.tsx    # Drag-drop upload + grid
│   │   │   │   ├── hooks/useFiles.ts
│   │   │   │   └── files.types.ts
│   │   │   └── reservations/
│   │   │       ├── components/ReservationTable.tsx  # TanStack Table
│   │   │       ├── components/ReservationForm.tsx
│   │   │       ├── hooks/useReservations.ts
│   │   │       └── reservations.types.ts
│   │   ├── hooks/
│   │   │   ├── useRealtime.ts                 # Generic Supabase subscription
│   │   │   └── useTripRole.ts                 # Role context consumer
│   │   ├── lib/
│   │   │   ├── api.ts                         # Fetch wrapper with auth headers
│   │   │   ├── supabase.ts                    # Supabase client init
│   │   │   └── utils.ts                       # cn() utility
│   │   ├── routes/                            # TanStack Router file-based
│   │   │   ├── __root.tsx                     # QueryClient + AuthProvider + Toaster
│   │   │   ├── index.tsx                      # Landing page
│   │   │   ├── auth.callback.tsx              # OAuth redirect handler
│   │   │   ├── invite.$token.tsx              # Invitation accept
│   │   │   ├── _authenticated.tsx             # Auth guard layout
│   │   │   ├── _authenticated.dashboard.tsx   # Trip list + filters
│   │   │   ├── _authenticated.trips.$tripId.tsx          # Trip layout
│   │   │   ├── _authenticated.trips.$tripId.itinerary.tsx
│   │   │   ├── _authenticated.trips.$tripId.budget.tsx
│   │   │   ├── _authenticated.trips.$tripId.checklists.tsx
│   │   │   ├── _authenticated.trips.$tripId.files.tsx
│   │   │   ├── _authenticated.trips.$tripId.reservations.tsx
│   │   │   └── _authenticated.trips.$tripId.members.tsx
│   │   ├── main.tsx
│   │   ├── index.css                          # Tailwind v4 + CSS variables
│   │   └── routeTree.gen.ts                   # Auto-generated
│   ├── components.json                        # shadcn/ui config
│   ├── vite.config.ts                         # Vite + TanStack Router plugin
│   ├── tsconfig.json
│   ├── tsconfig.app.json                      # With @/ path alias
│   └── package.json
│
├── server/                                    # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── trips.controller.ts
│   │   │   ├── activities.controller.ts
│   │   │   ├── members.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── checklists.controller.ts
│   │   │   ├── expenses.controller.ts
│   │   │   ├── files.controller.ts
│   │   │   └── reservations.controller.ts
│   │   ├── services/
│   │   │   ├── trips.service.ts
│   │   │   ├── activities.service.ts
│   │   │   ├── members.service.ts
│   │   │   └── budget.service.ts
│   │   ├── repositories/
│   │   │   ├── trips.repository.ts
│   │   │   ├── activities.repository.ts
│   │   │   ├── members.repository.ts
│   │   │   ├── invitations.repository.ts
│   │   │   ├── comments.repository.ts
│   │   │   ├── checklists.repository.ts
│   │   │   ├── expenses.repository.ts
│   │   │   ├── reservations.repository.ts
│   │   │   └── files.repository.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                        # JWT verification
│   │   │   ├── tripAccess.ts                  # Trip membership check
│   │   │   ├── tripRole.ts                    # Role-based access
│   │   │   └── errorHandler.ts                # Global error handler
│   │   ├── routes/
│   │   │   ├── index.ts                       # Route aggregator
│   │   │   ├── trips.routes.ts
│   │   │   ├── activities.routes.ts
│   │   │   ├── members.routes.ts
│   │   │   ├── comments.routes.ts
│   │   │   ├── checklists.routes.ts
│   │   │   ├── expenses.routes.ts
│   │   │   ├── reservations.routes.ts
│   │   │   └── files.routes.ts
│   │   ├── lib/supabase.ts                    # Admin + user client
│   │   ├── types/index.ts                     # All entity types + Express augmentation
│   │   ├── utils/
│   │   │   ├── errors.ts                      # AppError hierarchy
│   │   │   └── params.ts                      # Express 5 param helper
│   │   └── index.ts                           # App entry point
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 00001_initial_schema.sql           # Complete schema (472 lines)
│
├── .gitignore
└── README.md
```

---

## Database Schema

### Tables (12)
| Table | Purpose |
|---|---|
| `profiles` | User profiles (mirrors auth.users) |
| `trips` | Trip details (title, destination, dates, budget) |
| `trip_members` | User-trip relationship with role |
| `trip_invitations` | Email-based invitation tokens |
| `itinerary_days` | Days in a trip itinerary |
| `activities` | Activities within itinerary days |
| `comments` | Comments on days or activities |
| `checklists` | Named checklists (packing, todo, custom) |
| `checklist_items` | Individual checklist items |
| `reservations` | Hotels, flights, restaurants, etc. |
| `expenses` | Trip expenses with categories |
| `attachments` | File uploads linked to trip/activity |

### Key Database Features
- **RLS on all tables** with role-based policies (owner/editor/viewer)
- **Triggers**: `handle_new_user`, `add_trip_owner`, `scaffold_trip_days`, `set_updated_at`
- **Helper functions**: `is_trip_member()`, `is_trip_editor_or_owner()`, `is_trip_owner()`
- **RPC**: `accept_invitation(token)` — atomic accept + create membership
- **View**: `budget_summary` — expenses aggregated by trip + category
- **Realtime**: enabled on `activities`, `comments`, `checklist_items`, `expenses`, `trip_members`
- **Indexes**: on all foreign keys used in queries

---

## API Routes

| Group | Endpoints |
|---|---|
| **Trips** | `POST /api/trips`, `GET /api/trips`, `GET/PATCH/DELETE /api/trips/:tripId` |
| **Itinerary** | `GET /api/trips/:tripId/days`, `PATCH /api/trips/:tripId/days/:dayId` |
| **Activities** | `POST/PATCH/DELETE /api/trips/:tripId/activities/:activityId`, `POST .../reorder` |
| **Members** | `GET /api/trips/:tripId/members`, `PATCH/DELETE .../members/:memberId` |
| **Invitations** | `POST /api/trips/:tripId/invitations`, `POST /api/invitations/:token/accept` |
| **Comments** | `GET/POST /api/trips/:tripId/comments`, `PATCH/DELETE .../:commentId` |
| **Checklists** | CRUD checklists + items under `/api/trips/:tripId/checklists` |
| **Expenses** | CRUD under `/api/trips/:tripId/expenses`, `GET .../budget/summary` |
| **Reservations** | CRUD under `/api/trips/:tripId/reservations` |
| **Files** | `POST .../upload-url`, `POST .../files`, `DELETE .../files/:fileId` |

**Middleware chain**: `verifyAuth` → `verifyTripAccess` → `verifyTripRole('owner', 'editor')`

---

## Frontend Features

| Feature | Components | Key Behavior |
|---|---|---|
| **Auth** | AuthProvider, LoginForm | Email/password + Google OAuth, auto-redirect |
| **Dashboard** | TripCard, CreateTripDialog | Trip list with upcoming/past filters |
| **Itinerary** | ItineraryBoard, DayColumn, ActivityCard | Drag-and-drop with @dnd-kit, cross-day movement |
| **Members** | MemberList, InviteDialog | Role management (owner only), email invites |
| **Comments** | CommentThread | Real-time threaded comments on days/activities |
| **Checklists** | ChecklistPanel | Progress bars, item toggle, multiple list types |
| **Budget** | ExpenseTable, BudgetSummary, ExpenseForm | TanStack Table, recharts pie chart, member breakdown |
| **Files** | FileGrid | Drag-drop upload via signed URLs, image previews |
| **Reservations** | ReservationTable, ReservationForm | TanStack Table with type icons, sortable |

**Shared hooks**:
- `useRealtime(table, filter, queryKey)` — invalidates React Query on Supabase changes
- `useTripRole()` — provides `{ role, canEdit, isOwner }` from TripRoleContext

---

## Environment Setup

### Supabase Dashboard Setup
1. Create a Supabase project at https://supabase.com
2. **SQL Editor**: Run `supabase/migrations/00001_initial_schema.sql`
3. **Settings → API**: Copy Project URL, anon key, service_role key
4. **Authentication → Providers**: Enable Email (default) + Google OAuth (optional)
5. **Database → Replication**: Enable realtime on `activities`, `comments`, `checklist_items`, `expenses`, `trip_members`
6. **Storage**: Create a bucket called `attachments` (for file uploads)

### Client Environment (`client/.env`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001
```

### Server Environment (`server/.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Running Locally
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open http://localhost:5173

---

## Deployment

| Platform | Service | Env Vars |
|---|---|---|
| **Vercel** | Frontend (`client/`) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` |
| **Render** | Backend (`server/`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `PORT` |

---

## Verification Checklist
1. Sign up → profile auto-created in `profiles` table
2. Create trip → days auto-scaffolded, creator added as owner
3. Invite member → accept via `/invite/:token` → verify role in members tab
4. Add activities → drag to reorder → drag between days → positions persist
5. Open trip in 2 browsers → add activity → appears in other browser
6. Add comments → appear in real-time
7. Create checklists → toggle items → syncs across browsers
8. Add expenses → verify budget summary + pie chart
9. Upload file → verify in grid → delete
10. Add reservation → verify in table
11. Viewer cannot edit/delete (except comments)
