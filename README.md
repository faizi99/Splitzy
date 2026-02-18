# Splitzy

A group expense splitting app — track shared expenses, calculate balances, and settle debts with minimal transactions.

## Features

- **Groups** — Create groups for trips, households, or any shared expense pool
- **Expense Tracking** — Record expenses with equal, custom, percentage, or shares-based splits
- **Balance Calculation** — Automatically calculates who owes whom across all expenses
- **Settlement Planning** — Suggests the minimum number of payments to settle all debts
- **Settlement History** — Record payments and track what's been settled
- **Authentication** — Email/password, Google OAuth, and optional GitHub OAuth

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Turso (libsql / SQLite) via Prisma 7
- **Auth**: NextAuth.js v5 (beta)
- **UI**: Tailwind CSS v4 + Radix UI + Lucide icons

## Getting Started

### Prerequisites

- Node.js 20+
- A [Turso](https://turso.tech) database (or local SQLite for development)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="libsql://<your-db>.turso.io"
TURSO_AUTH_TOKEN="<your-auth-token>"

# NextAuth
AUTH_SECRET="<random-secret>"        # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # omit in production on Vercel

# Google OAuth
GOOGLE_CLIENT_ID="<your-client-id>"
GOOGLE_CLIENT_SECRET="<your-client-secret>"

# GitHub OAuth (optional — leave empty to disable)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### Database Setup

Push the Prisma schema to your database:

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── actions.ts              # Server actions (create/update/delete)
│   ├── page.tsx                # Dashboard
│   ├── auth/                   # Sign-in / sign-up pages
│   └── group/[groupId]/        # Group detail page + components
├── lib/
│   ├── calculations.ts         # Balance & settlement algorithm
│   └── prisma.ts               # Prisma client
└── auth.ts                     # NextAuth configuration
prisma/
└── schema.prisma               # Database schema
```

## Deployment

The app is designed for [Vercel](https://vercel.com) with Turso as the remote database.

1. Push to GitHub and import in Vercel
2. Set all environment variables (omit `NEXTAUTH_URL` — Vercel auto-detects it)
3. Add your Vercel deployment URL to Google Cloud Console under **Authorized redirect URIs**:
   ```
   https://<your-app>.vercel.app/api/auth/callback/google
   ```

## License

MIT
