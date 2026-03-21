# AI-Constructed — Construction Planning SaaS

AI-powered construction planning. Users create a project, get an AI-generated plan, cost estimate, and a downloadable PDF report.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Auth & DB | Supabase (Postgres, Auth, Storage) |
| Styling | Tailwind CSS v4 |
| AI | OpenAI API (`gpt-4o-mini`) |
| PDF | `pdf-lib` |

---

## Folder Structure

```
frontend/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected layout + pages
│   │   ├── layout.tsx         # Auth guard + Navbar
│   │   ├── dashboard/         # Project list
│   │   └── projects/
│   │       ├── create/        # Create project form
│   │       └── [id]/          # Project detail
│   ├── api/
│   │   ├── projects/          # CRUD
│   │   ├── generate-plan/     # OpenAI plan generation
│   │   ├── estimate-cost/     # Cost breakdown
│   │   └── generate-pdf/      # PDF via pdf-lib + Supabase Storage
│   ├── layout.tsx
│   └── page.tsx               # Landing page (Hero, Features, etc.)
├── components/
│   ├── auth/LoginForm.tsx
│   ├── landing/               # Landing page sections
│   │   ├── Navbar.tsx, Hero.tsx, Stats.tsx
│   │   ├── Features.tsx, HowItWorks.tsx, Showcase.tsx
│   │   └── CTA.tsx, Footer.tsx
│   ├── layout/Navbar.tsx + SignOutButton.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx, ProjectDetail.tsx
│   │   ├── CreateProjectForm.tsx, FloorPlanSVG.tsx
│   └── ui/Button, Input, Card, LoadingSpinner, MarkdownText
├── lib/supabase/
│   ├── client.ts              # Browser (client components)
│   └── server.ts              # Server components + API routes
├── services/
│   ├── ai.ts                  # OpenAI integration
│   ├── cost.ts                # Cost estimation logic
│   ├── layout.ts              # Floor plan layout (treemap algorithm)
│   ├── pdf.ts                 # PDF generation
│   └── projects.ts            # DB helpers
├── types/index.ts
├── proxy.ts                   # Development proxy configuration
└── .env.example
```

---

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=sk-<your-openai-key>
```

### 3. Supabase Setup

#### a) Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project.

#### b) Run the database migration

In the Supabase **SQL Editor**, run:

```sql
-- Projects table
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plot_size    text not null,
  floors       integer not null,
  style        text not null,
  plan_description text,
  estimated_cost   numeric,
  pdf_url      text,
  created_at   timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Policy: users can only access their own projects
create policy "Users manage own projects"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

#### c) Create Supabase Storage bucket

In the Supabase **Storage** section:
1. Click **New bucket**
2. Name: `project-reports`
3. Check **Public bucket** (so PDF URLs are accessible)
4. Click **Create bucket**

Then add storage policies in the Supabase SQL Editor:

```sql
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read access"
  on storage.objects for select
  to public
  using (bucket_id = 'project-reports');
```

#### d) Enable Email Auth

Go to **Authentication → Providers → Email** and ensure it is enabled.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/projects` | `{ plot_size, floors, style }` | Create a project |
| GET | `/api/projects` | — | List user projects |
| POST | `/api/generate-plan` | `{ projectId, plot_size, floors, style }` | Generate AI plan |
| POST | `/api/estimate-cost` | `{ projectId, plot_size, floors }` | Calculate cost |
| POST | `/api/generate-pdf` | `{ projectId }` | Generate & upload PDF |

All endpoints require a valid Supabase session cookie.

---

## Production Deployment (Vercel)

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com) → import repository → select `frontend/` as root
3. Add env vars in Vercel project settings
4. Deploy

> Update Supabase **Authentication → URL Configuration** with your Vercel domain as Site URL and redirect URL.

---

## License

MIT
