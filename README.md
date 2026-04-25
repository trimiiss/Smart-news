# Smart News

Smart News is a personalized AI news briefing app built with **Next.js 16**, **Supabase**, and **Groq (Llama 3.3-70B)**. Users sign in, subscribe to RSS feeds, bookmark articles, and generate a daily AI-powered briefing in the voice they choose — professional, casual, witty, or TL;DR.

## Features

- **Supabase Auth** — secure sign up / sign in with session management
- **RSS Feed Manager** — subscribe to any RSS feed, organized by category
- **Smart Bookmarks** — save article URLs with optional notes; included in next briefing
- **AI Briefing Generation** — Groq Llama 3.3-70B summarizes up to 20 articles into a personalized daily digest
- **Voice & Length Customization** — choose between Casual, Professional, Witty, or TL;DR styles; Short, Medium, or Long summaries
- **Daily Archive** — every generated briefing is stored in Supabase and accessible from the Archive page
- **Dark / Light Mode** — theme toggle with CSS variables, persisted across sessions
- **Responsive Design** — collapsible sidebar works on mobile and desktop
- **Row Level Security** — each user's feeds, bookmarks, and briefings are fully private

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| AI | Groq API via Vercel AI SDK (`ai` + `@ai-sdk/groq`) |
| RSS Parsing | `rss-parser` |
| Styling | Vanilla CSS with custom design tokens |
| Language | TypeScript |

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd smart-news
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq (required for AI briefing generation)
GROQ_API_KEY=your_groq_api_key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smart-news/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Auth — sign in
│   │   ├── signup/                # Auth — sign up
│   │   ├── auth/                  # Supabase auth callback
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Today's Briefing
│   │   │   ├── archive/           # Past briefings
│   │   │   ├── feeds/             # RSS feed manager
│   │   │   ├── bookmarks/         # Article bookmarks
│   │   │   └── settings/          # Voice & length preferences
│   │   └── api/
│   │       └── generate-briefing/
│   │           └── route.ts       # Core AI generation endpoint
│   ├── components/
│   │   ├── Sidebar.tsx            # Navigation with dark/light toggle
│   │   ├── ThemeProvider.tsx      # Theme context
│   │   └── InlineNotice.tsx       # Inline status/error messages
│   └── lib/
│       ├── briefings.ts           # Types, voice prompts, parsers
│       └── supabase/              # Supabase client & server helpers
├── docs/
│   └── demo-plan.md               # Final demo presentation plan
├── .env                           # Environment variables (not committed)
└── README.md
```

## How the Briefing Works

1. User clicks **Generate Briefing**
2. `POST /api/generate-briefing` fires server-side
3. The API fetches the user's RSS feeds (via `rss-parser`) and unprocessed bookmarks from Supabase
4. Up to 20 articles are assembled and sent to Groq with a voice + length prompt
5. Groq returns a JSON array of `{ title, summary, source, category, url }` objects
6. The briefing is upserted into the `briefings` table (one per user per day)
7. Bookmarks are marked as `processed`
8. The dashboard re-fetches and renders the briefing as cards

If the AI response cannot be parsed, `buildFallbackBriefing()` extracts raw content snippets as a safe fallback.

## Demo

See [`docs/demo-plan.md`](docs/demo-plan.md) for the full 5–7 minute presentation plan including flow, technical talking points, pre-demo checklist, and Plan B fallbacks.
