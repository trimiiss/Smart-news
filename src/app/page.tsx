import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Clock,
  Rss,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 50%), var(--bg-primary)",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, var(--color-primary), #8b5cf6)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Zap size={20} />
          </div>
          <span
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Smart News
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" className="btn btn-ghost">
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <div
          className="badge badge-primary"
          style={{
            padding: "6px 16px",
            fontSize: "var(--text-sm)",
            marginBottom: 24,
          }}
        >
          <Sparkles size={14} /> AI-Powered News Curation
        </div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 20,
            background:
              "linear-gradient(135deg, var(--text-primary) 0%, var(--color-primary) 50%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The internet, summarized
          <br />
          just for you
        </h1>
        <p
          style={{
            fontSize: "var(--text-lg)",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 auto 36px",
          }}
        >
          Subscribe to RSS feeds, bookmark articles, and let AI create a
          personalized daily briefing in your favorite voice: casual,
          professional, witty, or ultra-concise.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/signup" className="btn btn-primary btn-lg">
            <Sparkles size={18} /> Start Free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      <section
        style={{
          padding: "60px 24px 80px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: <Rss size={24} />,
              title: "RSS Feed Manager",
              desc: "Subscribe to any RSS feed and organize them by category. Tech, finance, and world news all in one place.",
            },
            {
              icon: <BookOpen size={24} />,
              title: "Smart Bookmarks",
              desc: "Save individual article URLs and include them in your next AI briefing automatically.",
            },
            {
              icon: <Sparkles size={24} />,
              title: "AI Summarization",
              desc: "Generate your briefing in the voice you want, from professional to witty.",
            },
            {
              icon: <Clock size={24} />,
              title: "Daily Schedule",
              desc: "Set your preferred briefing time and check a fresh personalized digest every morning.",
            },
            {
              icon: <Shield size={24} />,
              title: "Private & Secure",
              desc: "Built on Supabase with row-level security so your feeds and briefings stay private.",
            },
            {
              icon: <Zap size={24} />,
              title: "Blazing Fast",
              desc: "Built with Next.js and modern AI tooling for quick updates and smooth browsing.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "32px 24px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "var(--text-sm)",
          color: "var(--text-tertiary)",
        }}
      >
        Built with Next.js, Supabase, and the Vercel AI SDK.
      </footer>
    </div>
  );
}
