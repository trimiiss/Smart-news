"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Plus, Trash2, Link2, X } from "lucide-react";

interface BookmarkItem {
  id: string;
  url: string;
  note: string;
  processed: boolean;
  created_at: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [formNote, setFormNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const fetchBookmarks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      url: formUrl,
      note: formNote,
    });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setFormUrl("");
    setFormNote("");
    setShowForm(false);
    setSaving(false);
    fetchBookmarks();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks();
  };

  if (loading) {
    return (
      <div className="page-enter">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 24 }}>
          Bookmarks
        </h1>
        <div className="feed-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Bookmarks</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Bookmark"}
        </button>
      </div>

      {showForm && (
        <form
          className="card"
          style={{ marginBottom: 24, padding: "var(--space-6)" }}
          onSubmit={handleAdd}
        >
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Article URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/interesting-article"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Note (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Why is this article interesting?"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              rows={2}
            />
          </div>
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? <span className="spinner" /> : "Save Bookmark"}
          </button>
        </form>
      )}

      {bookmarks.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Bookmark size={28} />
          </div>
          <h3 className="empty-state-title">No bookmarks saved</h3>
          <p className="empty-state-text">
            Save individual article URLs to include them in your next AI-generated briefing.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} /> Save Your First Bookmark
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="bookmark-item">
              <Link2
                size={18}
                style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 2 }}
              />
              <div className="bookmark-item-info">
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bookmark-item-url"
                >
                  {bm.url}
                </a>
                {bm.note && <p className="bookmark-item-note">{bm.note}</p>}
              </div>
              {bm.processed && <span className="badge badge-success">Processed</span>}
              <button
                className="btn btn-danger btn-icon"
                onClick={() => handleDelete(bm.id)}
                aria-label="Delete bookmark"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
