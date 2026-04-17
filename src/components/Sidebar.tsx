"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import {
  Zap,
  LayoutDashboard,
  Rss,
  Bookmark,
  Settings,
  Archive,
  Sun,
  Moon,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const mainLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Today's Briefing" },
    { href: "/dashboard/archive", icon: Archive, label: "Archive" },
  ];

  const manageLinks = [
    { href: "/dashboard/feeds", icon: Rss, label: "RSS Feeds" },
    { href: "/dashboard/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    normalizedPathname === href ||
    (href !== "/dashboard" && normalizedPathname.startsWith(`${href}/`));

  return (
    <>
      {open && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99, background: "var(--bg-overlay)" }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Zap size={18} />
            </div>
            <span className="sidebar-logo-text">Smart News</span>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Overview</div>
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={onClose}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="sidebar-section-title">Manage</div>
          {manageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={onClose}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="sidebar-link" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
