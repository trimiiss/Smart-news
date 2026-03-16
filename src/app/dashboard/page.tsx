"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import {
  Newspaper,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface BriefingItem {
  title: string;
  summary: string;
  source: string;
  category: string;
  url?: string;
}

interface Briefing {
  id: string;
  date: string;
  content: BriefingItem[];
  created_at: string;
}

export default function DashboardPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  const fetchTodayBriefing = async () => {
    setLoading(true);
    // Use UTC date to match the API storage
    const today = new Date().toISOString().split("T")[0];
    console.log("Fetching briefing for date:", today);
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found in dashboard fetch");
      return;
    }

    const { data, error } = await supabase
      .from("briefings")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(); // maybeSingle is safer than single() which errors on 0 rows

    if (error) console.error("Error fetching briefing:", error);
    console.log("Briefing data found:", data ? "Yes" : "No", "Items:", data?.content?.length || 0);
    
    setBriefing(data);
    setLoading(false);
  };

  const generateBriefing = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-briefing", { method: "POST" });
      const result = await res.json();
      
      if (res.ok) {
        if (result.items === 0) {
          console.log("API Debug Info:", result.debug);
          alert("No articles found. Check your console (F12) for server debug info.");
        }
        await fetchTodayBriefing();
      } else {
        console.error("API Error Result:", result);
        alert(`Error: ${result.error || "Failed to generate briefing"}`);
      }
    } catch (err) {
      console.error("Failed to generate briefing:", err);
      alert("A network error occurred while generating your briefing.");
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
          <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 320, height: 36 }} />
        </div>
        <div className="briefing-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!briefing || !briefing.content || briefing.content.length === 0) {
    return (
      <div className="page-enter">
        <div className="briefing-header">
          <span className="briefing-date">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
          <h1 className="briefing-title">Your Daily Briefing</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Newspaper size={28} />
          </div>
          <h3 className="empty-state-title">No briefing yet today</h3>
          <p className="empty-state-text">
            Add some RSS feeds or bookmark articles, then generate your first AI-powered briefing.
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
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
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
          {generating ? (
            <span className="spinner" />
          ) : (
            <RefreshCw size={16} />
          )}
          Regenerate
        </button>
      </div>

      <div className="briefing-list">
        {briefing.content.map((item, idx) => (
          <article key={idx} className="briefing-card">
            <div className="briefing-card-header">
              <span className="briefing-card-source">{item.source || item.category}</span>
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
