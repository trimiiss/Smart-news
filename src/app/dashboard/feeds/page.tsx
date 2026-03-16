"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Rss,
  Plus,
  Pencil,
  Trash2,
  X,
  Globe,
} from "lucide-react";

interface Feed {
  id: string;
  url: string;
  title: string;
  category: string;
  status: string;
  last_fetched: string | null;
}

const CATEGORIES = [
  "General",
  "Tech",
  "Finance",
  "World News",
  "Science",
  "Sports",
  "Entertainment",
  "Health",
  "Business",
  "Politics",
];

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const fetchFeeds = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("feeds")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setFeeds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingFeed(null);
    setFormUrl("");
    setFormTitle("");
    setFormCategory("General");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (feed: Feed) => {
    setEditingFeed(feed);
    setFormUrl(feed.url);
    setFormTitle(feed.title);
    setFormCategory(feed.category);
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingFeed) {
      const { error: err } = await supabase
        .from("feeds")
        .update({
          url: formUrl,
          title: formTitle,
          category: formCategory,
        })
        .eq("id", editingFeed.id);

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("feeds").insert({
        user_id: user.id,
        url: formUrl,
        title: formTitle || formUrl,
        category: formCategory,
      });

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    setShowModal(false);
    setSaving(false);
    fetchFeeds();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feed?")) return;
    await supabase.from("feeds").delete().eq("id", id);
    fetchFeeds();
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "active":
        return "active";
      case "error":
        return "error";
      default:
        return "pending";
    }
  };

  if (loading) {
    return (
      <div className="page-enter">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 24 }}>
          RSS Feeds
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
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>RSS Feeds</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Feed
        </button>
      </div>

      {feeds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Rss size={28} />
          </div>
          <h3 className="empty-state-title">No feeds yet</h3>
          <p className="empty-state-text">
            Add RSS feed URLs to start curating your personalized daily briefing.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={openAddModal}>
            <Plus size={16} /> Add Your First Feed
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {feeds.map((feed) => (
            <div key={feed.id} className="feed-item">
              <span className={`status-dot ${statusClass(feed.status)}`} />
              <Globe size={18} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
              <div className="feed-item-info">
                <div className="feed-item-title">{feed.title || feed.url}</div>
                <div className="feed-item-url">{feed.url}</div>
              </div>
              <span className="badge badge-primary">{feed.category}</span>
              <div className="feed-item-actions">
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => openEditModal(feed)}
                  aria-label="Edit feed"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(feed.id)}
                  aria-label="Delete feed"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="modal-title">
                {editingFeed ? "Edit Feed" : "Add New Feed"}
              </h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Feed URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/rss.xml"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Title (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="My Feed Name"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <span className="spinner" /> : editingFeed ? "Save Changes" : "Add Feed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
