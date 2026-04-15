"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  ExternalLink,
  Newspaper,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import InlineNotice from "@/components/InlineNotice";
import { createClient } from "@/lib/supabase/client";
import type { StoredBriefing } from "@/lib/briefings";

interface GenerateBriefingResponse {
  error?: string;
  message?: string;
  items?: number;
}

interface StatusMessage {
  tone: "error" | "success";
  text: string;
}

export default function DashboardPage() {
  const [briefing, setBriefing] = useState<StoredBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const supabase = createClient();

  const fetchTodayBriefing = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBriefing(null);
        setStatusMessage({
          tone: "error",
          text: "Your session expired. Please sign in again to load your briefing.",
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("briefings")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (error) {
        console.error("Error fetching briefing:", error);
        setStatusMessage({
          tone: "error",
          text: "We could not load today's briefing right now. Please try again.",
        });
        return;
      }

      setBriefing(data);
    } finally {
      setLoading(false);
    }
  };

  const generateBriefing = async () => {
    setGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/generate-briefing", { method: "POST" });
      const result: GenerateBriefingResponse = await response.json();

      if (!response.ok) {
        setStatusMessage({
          tone: "error",
          text: result.error || "Failed to generate your briefing.",
        });
        return;
      }

      if (!result.items) {
        setStatusMessage({
          tone: "error",
          text: "No articles were available yet. Add RSS feeds or new bookmarks and try again.",
        });
        return;
      }

      setStatusMessage({
        tone: "success",
        text:
          result.message ||
          `Your briefing is ready with ${result.items} summarized articles.`,
      });

      await fetchTodayBriefing();
    } catch (error) {
      console.error("Failed to generate briefing:", error);
      setStatusMessage({
        tone: "error",
        text: "A network error occurred while generating your briefing.",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchTodayBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="briefing-header">
          <div
            className="skeleton"
            style={{ width: 140, height: 16, marginBottom: 8 }}
          />
          <div className="skeleton" style={{ width: 320, height: 36 }} />
        </div>
        <div className="briefing-list">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="skeleton"
              style={{ height: 160, borderRadius: 14 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!briefing || !briefing.content || briefing.content.length === 0) {
    return (
      <div className="page-enter">
        <div className="briefing-header">
          <span className="briefing-date">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
          <h1 className="briefing-title">Your Daily Briefing</h1>
        </div>

        {statusMessage && (
          <div style={{ marginBottom: 24 }}>
            <InlineNotice
              tone={statusMessage.tone}
              message={statusMessage.text}
            />
          </div>
        )}

        <div className="empty-state">
          <div className="empty-state-icon">
            <Newspaper size={28} />
          </div>
          <h3 className="empty-state-title">No briefing yet today</h3>
          <p className="empty-state-text">
            Add some RSS feeds or bookmark articles, then generate your first
            AI-powered briefing.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 24 }}
            onClick={generateBriefing}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Briefing
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div
        className="briefing-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span className="briefing-date">
            {format(new Date(briefing.date), "EEEE, MMMM d, yyyy")}
          </span>
          <h1 className="briefing-title">Your Daily Briefing</h1>
        </div>
        <button
          className="btn btn-secondary"
          onClick={generateBriefing}
          disabled={generating}
        >
          {generating ? <span className="spinner" /> : <RefreshCw size={16} />}
          Regenerate
        </button>
      </div>

      {statusMessage && (
        <div style={{ marginBottom: 24 }}>
          <InlineNotice tone={statusMessage.tone} message={statusMessage.text} />
        </div>
      )}

      <div className="briefing-list">
        {briefing.content.map((item, index) => (
          <article key={`${item.title}-${index}`} className="briefing-card">
            <div className="briefing-card-header">
              <span className="briefing-card-source">
                {item.source || item.category}
              </span>
              <span className="badge badge-primary">{item.category}</span>
            </div>
            <h2 className="briefing-card-title">{item.title}</h2>
            <p className="briefing-card-summary">{item.summary}</p>
            {item.url && (
              <div className="briefing-card-footer">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="briefing-card-link"
                >
                  Read original <ExternalLink size={14} />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
