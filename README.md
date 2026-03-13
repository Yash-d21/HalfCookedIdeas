# Half Cooked Ideas 💡

The internet's repository for unpolished, raw, and potentially brilliant startup concepts. No pitch decks. No business plans. Just ideas.

## Features

- **Submit Ideas:** Drop your unfinished thoughts and startup concepts.
- **Vote & Validate:** The community votes on ideas ("I'd use this" vs "I wouldn't").
- **Idea Feed:** Explore trending, newest, and controversial ideas from around the web.
- **Admin Moderation:** A built-in admin queue for approving and rejecting submitted ideas to ensure quality.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend:** Node.js, Express (Deployed as Vercel Serverless Functions)
- **Database:** Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js installed
- A Supabase project

### 1. Local Setup

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project and add your Supabase connection strings, as well as an Admin Secret for the moderation dashboard:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ADMIN_SECRET=your_custom_admin_password
```

### 3. Database Setup (Supabase)

You will need to run the following SQL to set up the tables in your Supabase project:

```sql
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  votes_use INTEGER DEFAULT 0,
  votes_not_use INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- use, not_use
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_votes_idea_ip ON votes(idea_id, ip_hash);
```

### 4. Run Locally

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Deployment

The application is configured to be seamlessly deployed to **Vercel**. 

1. Push your code to a GitHub repository.
2. Sign in to Vercel and **Import Project**.
3. Select your GitHub repository.
4. Add the **Environment Variables** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_SECRET`) in the Vercel dashboard.
5. Click **Deploy**.

Vercel will automatically build the React single-page app and deploy `/api/index.ts` as a serverless backend.
