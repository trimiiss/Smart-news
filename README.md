# Smart News

Smart News is an AI-powered news aggregator and summarizer built with Next.js. It curates content from various RSS feeds and provides concise, AI-generated news briefings.

## Features

- **RSS Feed Parsing:** Automatically fetches and parses news from various feeds.
- **AI-Powered Summaries:** Uses advanced AI models via Groq and Google Gemini to generate readable news briefings.
- **Authentication & Database:** Integrated with Supabase for robust authentication and database management.
- **Modern UI:** Built with React, Next.js, and styled for a responsive and clean user experience. Icons provided by Lucide React.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/docs), [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai), Groq
- **RSS Parsing:** `rss-parser`

## Getting Started

First, make sure you have your environment variables set up. Create a `.env.local` file with the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
