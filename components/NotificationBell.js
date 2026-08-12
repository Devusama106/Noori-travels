"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso + "Z").getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso + "Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef(null);

  const load = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.notifications || []);
        setUnread(d.unread || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // light polling so approvals/etc show up without a refresh
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  async function handleClickItem(n) {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: 1 } : i)));
      setUnread((u) => Math.max(u - 1, 0));
    }
    setOpen(false);
    if (n.link) {
      router.push(n.link);
      router.refresh();
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) => prev.map((i) => ({ ...i, read: 1 })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={handleOpen} className="relative text-noori-muted hover:text-noori-primary" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-noori-danger text-white text-[10px] font-semibold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-black/5 z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <span className="text-sm font-semibold text-noori-ink">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-noori-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-noori-muted">You're all caught up.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-black/5 last:border-0 hover:bg-noori-primary-light/50 transition-colors ${
                    !n.read ? "bg-noori-primary-light/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-noori-primary mt-1.5 shrink-0" />}
                    <div className={n.read ? "pl-3.5" : ""}>
                      <div className="text-sm font-medium text-noori-ink">{n.title}</div>
                      {n.message && <div className="text-xs text-noori-muted mt-0.5">{n.message}</div>}
                      <div className="text-[11px] text-noori-muted mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
