# Smart News — Demo Plan
**Prezantimi Final | Programimi i Avancuar**
**Kohëzgjatja:** 5–7 minuta

---

## 1. Çka është projekti dhe kujt i shërben

**Smart News** është një aplikacion i personalizuar i lajmeve me AI, i ndërtuar me **Next.js 16**, **Supabase** dhe **Groq (Llama 3.3-70B)**.

**Përdoruesit e synuar:**
- Njerëz që duan të qëndrojnë të informuar por nuk kanë kohë të lexojnë dhjetëra artikuj çdo ditë.
- Profesionistë dhe studentë që preferojnë një digest të përditshëm, të personalizuar dhe të shpejtë.

**Vlera kryesore:**
> Ti zgjedh burimet (RSS feeds + bookmarks), AI i lexon për ty dhe të jep një briefing ditor në tonin që ti preferon — profesional, casual, witty, ose ultra-concise (TL;DR).

---

## 2. Flow kryesor i demos (hap pas hapi)

| # | Hapi | Kohë |
|---|------|------|
| 1 | Hap landing page — shpjego propozimin e vlerës dhe features kryesore | ~30 sek |
| 2 | Sign in me llogari demo | ~20 sek |
| 3 | Dashboard — trego briefing-un e sotëm të gjeneruar paraprakisht | ~45 sek |
| 4 | RSS Feeds — shto ose trego feed-et e shtuar (`/dashboard/feeds`) | ~45 sek |
| 5 | Bookmarks — shto një URL dhe shpjego si integrohet në briefing | ~30 sek |
| 6 | Settings — trego opsionet e voice dhe summary length | ~20 sek |
| 7 | Kliko "Generate Briefing" live — prit AI response nga Groq | ~60 sek |
| 8 | Trego rezultatin — karta me titull, summary, source, link origjinal | ~30 sek |
| 9 | Archive — trego se briefing-et ruhen për çdo ditë | ~20 sek |
| **Total** | | **~5:30 min** |

---

## 3. Pjesët teknike që do t'i shpjegoj shkurt

### Stack
- **Next.js 16** (App Router, Server Components, API Routes)
- **Supabase** — autentifikim (Supabase Auth), bazë të dhënash (PostgreSQL me RLS), storage i briefing-eve
- **Groq AI SDK** — model `llama-3.3-70b-versatile` për gjenerim të shpejtë
- **Vercel AI SDK** (`ai` package) — abstrakcion mbi modele të ndryshme AI

### Vendime arkitekturore
- **`POST /api/generate-briefing`** — endpoint i vetëm server-side që:
  1. Merr feeds + bookmarks nga Supabase për userin autentikuar
  2. Parsifikon RSS feeds me `rss-parser`
  3. Ndërton prompt me `VOICE_PROMPTS` dhe `LENGTH_INSTRUCTIONS`
  4. Dërgon te Groq, parsifikon JSON response
  5. Bën `upsert` në tabelën `briefings` (një briefing për user/ditë)
- **Row Level Security (RLS)** — çdo user sheh vetëm të dhënat e veta
- **Fallback i sigurt** — nëse AI dështon, `buildFallbackBriefing()` gjeneron preview nga raw content
- **Theme system** — dark/light mode me CSS variables, pa framework të jashtëm

---

## 4. Çfarë kam kontrolluar para demos

- [x] Aplikacioni hapet dhe ngarkon normalisht në `localhost:3000`
- [x] Sign up dhe sign in funksionojnë (Supabase Auth)
- [x] RSS feeds mund të shtohen dhe fshihen
- [x] Bookmarks mund të shtohen dhe fshihen
- [x] "Generate Briefing" kthen rezultat real nga Groq API
- [x] Briefing-i shfaqet si karta me titull, summary, source, kategori dhe link
- [x] Archive shfaq briefing-et e ditëve të kaluara
- [x] Settings ruajnë preferencat (voice, summary length) në Supabase
- [x] Dark/Light mode ndryshon pa reload
- [x] Mobile responsive — sidebar funksionon në ekrane të vogla
- [x] `.env` ka të gjitha variablat e nevojshëm (Supabase + Groq)
- [x] `git push` i fundit është i ri dhe stable

---

## 5. Plani B — nëse live demo dështon

### Skenar 1: Groq API nuk përgjigjet (rate limit ose outage)
- **Zgjidhje:** Briefing-i i gjeneruar paraprakisht (sot ose dje) është i ruajtur në Supabase dhe shfaqet automatikisht në dashboard pa nevojë për API call.
- Trego briefing-un ekzistues dhe shpjego: *"Sistemi ka fallback të integruar — nëse AI dështon, përdor përmbajtjen e ruajtur."*

### Skenar 2: RSS feed nuk parsifikohet
- **Zgjidhje:** Bookmarks funksionojnë pa RSS. Demo-ja vazhdon me bookmark flow.
- Kam të paktën 2–3 bookmarks të shtuar paraprakisht me note.

### Skenar 3: Supabase nuk përgjigjet / CORS error
- **Zgjidhje:** Trego screenshots të plota të aplikacionit (dashboard, briefing, settings) të kapura paraprakisht.
- Shpjego arkitekturën nga kodi (`route.ts`, `briefings.ts`) direkt nga VS Code.

### Skenar 4: Interneti nuk funksionon
- **Zgjidhje:** Trego kodin burimor dhe shpjego logjikën pa ekzekutim live.
- Trego `README.md` dhe `docs/demo-plan.md` si dëshmi të organizimit dhe gatishmërisë.

---

## 6. Live URL

> Aplikacioni ekzekutohet lokalisht: **`http://localhost:3000`**
> Komanda për startim: `npm run dev` (nga direktoria e projektit)

*(Nëse projekti është i deploy-uar në Vercel, URL-ja shtohet këtu)*

---

## 7. Struktura e projektit (për referencë gjatë shpjegimit)

```
smart-news/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Auth pages
│   │   ├── signup/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Today's Briefing
│   │   │   ├── archive/          # Past briefings
│   │   │   ├── feeds/            # RSS Feed manager
│   │   │   ├── bookmarks/        # Bookmarks
│   │   │   └── settings/         # User preferences
│   │   └── api/
│   │       └── generate-briefing/
│   │           └── route.ts      # Core AI endpoint
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation
│   │   ├── ThemeProvider.tsx     # Dark/light mode
│   │   └── InlineNotice.tsx      # Status messages
│   └── lib/
│       ├── briefings.ts          # Types, prompts, parsers
│       └── supabase/             # Client & server helpers
├── docs/
│   └── demo-plan.md              # Ky dokument
└── README.md
```
