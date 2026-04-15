"use client";

import { useEffect, useState } from "react";
import { Briefcase, Check, MessageCircle, Save, Sparkles, Text } from "lucide-react";
import InlineNotice from "@/components/InlineNotice";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  voice: string;
  summary_length: string;
  briefing_time: string;
  topics: string[];
  display_name: string;
}

const VOICE_OPTIONS = [
  {
    value: "casual",
    icon: MessageCircle,
    label: "Casual",
    desc: "Friendly and conversational",
  },
  {
    value: "professional",
    icon: Briefcase,
    label: "Professional",
    desc: "Clear and formal",
  },
  {
    value: "witty",
    icon: Sparkles,
    label: "Witty",
    desc: "Fun with personality",
  },
  {
    value: "tldr",
    icon: Text,
    label: "TL;DR",
    desc: "Ultra-concise bullets",
  },
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
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError("We could not load your settings right now.");
          return;
        }

        if (data) {
          setProfile({
            voice: data.voice || "professional",
            summary_length: data.summary_length || "medium",
            briefing_time: data.briefing_time || "08:00",
            topics: data.topics || [],
            display_name: data.display_name || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your session expired. Please sign in again.");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          voice: profile.voice,
          summary_length: profile.summary_length,
          briefing_time: profile.briefing_time,
          topics: profile.topics,
          display_name: profile.display_name,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setProfile((previous) => ({
      ...previous,
      topics: previous.topics.includes(topic)
        ? previous.topics.filter((entry) => entry !== topic)
        : [...previous.topics, topic],
    }));
  };

  if (loading) {
    return (
      <div className="page-enter">
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
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

      {error && (
        <div style={{ marginBottom: 24 }}>
          <InlineNotice tone="error" message={error} />
        </div>
      )}

      {!error && saved && (
        <div style={{ marginBottom: 24 }}>
          <InlineNotice tone="success" message="Your settings were saved." />
        </div>
      )}

      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <p className="settings-section-desc">
          Your display name and personal info.
        </p>
        <div className="form-group" style={{ maxWidth: 360 }}>
          <label className="form-label">Display Name</label>
          <input
            type="text"
            className="form-input"
            value={profile.display_name}
            onChange={(event) =>
              setProfile({ ...profile, display_name: event.target.value })
            }
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Summarization Voice</h2>
        <p className="settings-section-desc">
          Choose how your AI briefing should sound.
        </p>
        <div className="settings-grid">
          {VOICE_OPTIONS.map((voiceOption) => {
            const Icon = voiceOption.icon;

            return (
              <button
                key={voiceOption.value}
                type="button"
                className={`voice-option ${
                  profile.voice === voiceOption.value ? "selected" : ""
                }`}
                onClick={() =>
                  setProfile({ ...profile, voice: voiceOption.value })
                }
              >
                <div className="voice-option-icon">
                  <Icon size={24} />
                </div>
                <div className="voice-option-label">{voiceOption.label}</div>
                <div className="voice-option-desc">{voiceOption.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

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
            onChange={(event) =>
              setProfile({
                ...profile,
                summary_length: ["short", "medium", "long"][
                  parseInt(event.target.value, 10)
                ],
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
            onChange={(event) =>
              setProfile({ ...profile, briefing_time: event.target.value })
            }
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Topics of Interest</h2>
        <p className="settings-section-desc">
          Select topics you&apos;re most interested in. This helps prioritize your
          briefing.
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
