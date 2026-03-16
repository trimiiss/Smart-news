"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Check } from "lucide-react";

interface Profile {
  voice: string;
  summary_length: string;
  briefing_time: string;
  topics: string[];
  display_name: string;
}

const VOICE_OPTIONS = [
  { value: "casual", icon: "😎", label: "Casual", desc: "Friendly and conversational" },
  { value: "professional", icon: "💼", label: "Professional", desc: "Clear and formal" },
  { value: "witty", icon: "🎭", label: "Witty", desc: "Fun with personality" },
  { value: "tldr", icon: "⚡", label: "TL;DR", desc: "Ultra-concise bullets" },
];

const TOPIC_OPTIONS = [
  "Technology",
  "Finance",
  "World News",
  "Science",
  "Sports",
  "Entertainment",
  "Health",
  "Business",
  "Politics",
  "AI & ML",
  "Startups",
  "Climate",
];

const LENGTH_LABELS: Record<string, string> = {
  short: "Short (1-2 sentences)",
  medium: "Medium (3-4 sentences)",
  long: "Long (full paragraph)",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    voice: "professional",
    summary_length: "medium",
    briefing_time: "08:00",
    topics: [],
    display_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          voice: data.voice || "professional",
          summary_length: data.summary_length || "medium",
          briefing_time: data.briefing_time || "08:00",
          topics: data.topics || [],
          display_name: data.display_name || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        voice: profile.voice,
        summary_length: profile.summary_length,
        briefing_time: profile.briefing_time,
        topics: profile.topics,
        display_name: profile.display_name,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleTopic = (topic: string) => {
    setProfile((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  if (loading) {
    return (
      <div className="page-enter">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 24 }}>
          Settings
        </h1>
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Settings</h1>
        <button
          className={`btn ${saved ? "btn-secondary" : "btn-primary"}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span className="spinner" />
          ) : saved ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Display Name */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <p className="settings-section-desc">Your display name and personal info.</p>
        <div className="form-group" style={{ maxWidth: 360 }}>
          <label className="form-label">Display Name</label>
          <input
            type="text"
            className="form-input"
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          />
        </div>
      </div>

      {/* Voice */}
      <div className="settings-section">
        <h2 className="settings-section-title">Summarization Voice</h2>
        <p className="settings-section-desc">
          Choose how your AI briefing should sound.
        </p>
        <div className="settings-grid">
          {VOICE_OPTIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              className={`voice-option ${profile.voice === v.value ? "selected" : ""}`}
              onClick={() => setProfile({ ...profile, voice: v.value })}
            >
              <div className="voice-option-icon">{v.icon}</div>
              <div className="voice-option-label">{v.label}</div>
              <div className="voice-option-desc">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Length */}
      <div className="settings-section">
        <h2 className="settings-section-title">Summary Length</h2>
        <p className="settings-section-desc">
          How long each article summary should be.
        </p>
        <div style={{ maxWidth: 360 }}>
          <input
            type="range"
            className="range-slider"
            min={0}
            max={2}
            value={["short", "medium", "long"].indexOf(profile.summary_length)}
            onChange={(e) =>
              setProfile({
                ...profile,
                summary_length: ["short", "medium", "long"][parseInt(e.target.value)],
              })
            }
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--text-xs)",
              color: "var(--text-tertiary)",
              marginTop: 8,
            }}
          >
            <span>Short</span>
            <span>Medium</span>
            <span>Long</span>
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
          >
            {LENGTH_LABELS[profile.summary_length]}
          </p>
        </div>
      </div>

      {/* Briefing Time */}
      <div className="settings-section">
        <h2 className="settings-section-title">Briefing Time</h2>
        <p className="settings-section-desc">
          When should your daily briefing be generated?
        </p>
        <div className="form-group" style={{ maxWidth: 200 }}>
          <input
            type="time"
            className="form-input"
            value={profile.briefing_time}
            onChange={(e) => setProfile({ ...profile, briefing_time: e.target.value })}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="settings-section">
        <h2 className="settings-section-title">Topics of Interest</h2>
        <p className="settings-section-desc">
          Select topics you&apos;re most interested in. This helps prioritize your briefing.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TOPIC_OPTIONS.map((topic) => (
            <button
              key={topic}
              type="button"
              className={`badge ${
                profile.topics.includes(topic) ? "badge-primary" : ""
              }`}
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                fontSize: "var(--text-sm)",
                border: profile.topics.includes(topic)
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--border-color)",
                background: profile.topics.includes(topic)
                  ? "var(--color-primary-light)"
                  : "var(--bg-card)",
                color: profile.topics.includes(topic)
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
                transition: "all var(--transition-fast)",
              }}
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
