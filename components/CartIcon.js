"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCount(d.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("cart:updated", refresh);
    return () => window.removeEventListener("cart:updated", refresh);
  }, [refresh]);

  return (
    <Link href="/cart" className="relative text-noori-muted hover:text-noori-primary" aria-label="Cart">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 4h2l1.6 9.6a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L20 8H6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-noori-gold text-white text-[10px] font-semibold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-0.5">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

// Call this from anywhere after adding/removing a cart item so every CartIcon on screen updates.
export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart:updated"));
}
