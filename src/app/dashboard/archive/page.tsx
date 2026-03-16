"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import { Archive, ChevronRight, Newspaper } from "lucide-react";

interface BriefingSummary {
  id: string;
  date: string;
  content: { title: string }[];
  created_at: string;
}

export default function ArchivePage() {
  const [briefings, setBriefings] = useState<BriefingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBriefing, setSelectedBriefing] = useState<BriefingSummary | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBriefings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("briefings")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      setBriefings(data || []);
      setLoading(false);
    };
    fetchBriefings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="page-enter">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 24 }}>
          Briefing Archive
        </h1>
        <div className="archive-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  if (selectedBriefing) {
    const items = selectedBriefing.content || [];
    return (
      <div className="page-enter">
        <button
          className="btn btn-ghost"
          onClick={() => {
            setSelectedId(null);
            setSelectedBriefing(null);
          }}
          style={{ marginBottom: 16 }}
        >
          ← Back to Archive
        </button>
        <div className="briefing-header">
          <span className="briefing-date">
            {format(new Date(selectedBriefing.date), "EEEE, MMMM d, yyyy")}
          </span>
          <h1 className="briefing-title">Past Briefing</h1>
        </div>
        <div className="briefing-list">
          {items.map((item: any, idx: number) => (
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
                    Read original
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 24 }}>
        Briefing Archive
      </h1>

      {briefings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Archive size={28} />
          </div>
          <h3 className="empty-state-title">No past briefings</h3>
          <p className="empty-state-text">
            Your briefing history will appear here once you generate your first briefing.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 24 }}>
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="archive-list">
          {briefings.map((b) => (
            <button
              key={b.id}
              className="archive-item"
              style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)" }}
              onClick={() => {
                setSelectedId(b.id);
                setSelectedBriefing(b);
              }}
            >
              <Newspaper size={20} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
              <span className="archive-item-date">
                {format(new Date(b.date), "EEEE, MMM d, yyyy")}
              </span>
              <span className="archive-item-count">
                {Array.isArray(b.content) ? b.content.length : 0} articles
              </span>
              <ChevronRight
                size={16}
                style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
