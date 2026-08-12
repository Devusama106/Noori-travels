"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "./Logo";
import CartIcon from "./CartIcon";
import NotificationBell from "./NotificationBell";
import NavDrawer from "./NavDrawer";
import { formatMoney } from "@/lib/utils";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="bg-white border-b border-black/5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle menu"
            className="text-noori-primary-dark p-1 -ml-1"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
            <Logo />
          </Link>
        </div>

        {session?.user && (
          <div className="flex items-center gap-3 sm:gap-5">
            {!isAdmin && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[11px] text-noori-muted">
                  {session.user.accountLocked ? "Account locked" : "Booking Limit"}
                </span>
                <span
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    session.user.accountLocked ? "text-noori-danger" : "text-noori-primary"
                  }`}
                >
                  {session.user.accountLocked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3Z" />
                    </svg>
                  )}
                  {session.user.bookingLimit > 0 ? formatMoney(session.user.bookingLimit) : "Unlimited"}
                </span>
              </div>
            )}

            {isAdmin ? (
              <Link href="/dashboard" className="hidden sm:block text-sm text-noori-primary-dark hover:underline">
                View User Site
              </Link>
            ) : (
              <Link href="/admin/login" className="hidden sm:block text-sm text-noori-primary-dark hover:underline">
                Admin Login
              </Link>
            )}

            {!isAdmin && <CartIcon />}

            <NotificationBell />

            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-noori-primary-light text-noori-primary-dark font-semibold flex items-center justify-center border border-noori-primary/20">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-black/5 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-black/5">
                  <div className="text-sm font-medium text-noori-ink">{session.user.name}</div>
                  <div className="text-xs text-noori-muted truncate">{session.user.email}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2 text-sm text-noori-danger hover:bg-noori-danger/5"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} isAdmin={isAdmin} session={session} />
    </header>
  );
}
