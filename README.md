## Myshop Seller Portal

A Next.js 14 dashboard where sellers authenticate with Supabase, manage their profile, and maintain a product catalogue.

### Prerequisites

- Node.js 18+ and npm
- Supabase project with the following tables:
  - `profiles` — columns: `id uuid primary key`, `full_name text`, `company_name text`, `phone text`, `website text`, `bio text`, `avatar_url text`, `created_at timestamptz`, `updated_at timestamptz`
  - `products` — columns: `id uuid`, `seller_id uuid references profiles(id)`, `name text`, `description text`, `price numeric`, `currency text`, `status text`, `inventory integer`, `image_url text`, `created_at timestamptz`, `updated_at timestamptz`
  - Enable Row Level Security with policies that scope rows to `auth.uid()`

### Environment Variables

Create a `.env.local` (based on `env.example`) with:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional – used by Playwright e2e tests
E2E_SELLER_EMAIL=you@example.com
E2E_SELLER_PASSWORD=super-secret
```

### Running Locally

```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Quality Commands

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test:e2e    # Playwright (requires Supabase test user)
```

When running end-to-end tests for the first time install the browsers:

```bash
npx playwright install
```

### Project Structure

- `app/` – App Router routes (`/login`, `/dashboard`, etc.)
- `components/` – Reusable UI and feature-specific components
- `lib/` – Supabase clients, data helpers, validation schemas
- `tests/` – Playwright integration tests

### Notes

- Dashboard routes are protected in `middleware.ts` and redirect unauthenticated users to `/login`.
- Product mutations use Supabase server actions and show toast notifications via `sonner`.
- Forms leverage `react-hook-form` with Zod validation for consistent client/server rules.
