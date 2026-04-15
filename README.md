# Smart News

Smart News is a personalized AI news briefing app built with Next.js and Supabase. Users can sign in, save RSS feeds and article bookmarks, and generate a daily briefing that summarizes the most relevant content in a chosen voice.

## What it does

- Authenticates users with Supabase
- Lets users manage RSS feeds and manual article bookmarks
- Generates AI summaries from feed items and saved bookmarks
- Stores daily briefings and keeps a simple archive for past digests
- Lets users customize voice, summary length, topics, and briefing time

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Environment variables

Create a `.env` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Optional:

```env
GROQ_API_KEY=your_groq_ai_key
```

