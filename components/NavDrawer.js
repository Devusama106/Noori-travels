"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import Logo from "./Logo";

const ICONS = {
  home: <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  cart: <><path d="M3 4h2l1.6 9.6a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L20 8H6" /><circle cx="9" cy="20" r="1.2" fill="currentColor" /><circle cx="17" cy="20" r="1.2" fill="currentColor" /></>,
  ticket: <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z" />,
  wallet: <><path d="M3 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1h-1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" /><circle cx="17" cy="12" r="1" fill="currentColor" /></>,
  plane: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5Z" fill="currentColor" stroke="none" />,
  planePlus: <><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5Z" fill="currentColor" stroke="none" /></>,
  logo2: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 4v2" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M17 14c2.8.3 5 2.5 5 6" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 21v-4h6v4M9 8h1M14 8h1M9 12h1M14 12h1" /></>,
  shield: <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />,
  profile: <><circle cx="12" cy="8" r="3.2" /><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" /></>,
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {ICONS[name]}
    </svg>
  );
}

function NavLink({ href, icon, children, onClose, active }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
        active
          ? "bg-noori-primary text-white font-medium shadow-sm"
          : "text-noori-ink hover:bg-noori-primary-light"
      }`}
    >
      <Icon name={icon} />
      {children}
    </Link>
  );
}

function Section({ label }) {
  return (
    <div className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-[0.14em] text-noori-muted uppercase">
      {label}
    </div>
  );
}

export default function NavDrawer({ open, onClose, isAdmin, session }) {
  const pathname = usePathname();
  const is = (p) => pathname === p;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-black/5 shrink-0">
          <Logo subtitle={isAdmin ? "Admin Panel" : "Booking Portal"} />
          <button onClick={onClose} aria-label="Close menu" className="text-noori-muted p-1 hover:text-noori-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {isAdmin ? (
            <>
              <Section label="Overview" />
              <NavLink href="/admin/dashboard" icon="home" onClose={onClose} active={is("/admin/dashboard")}>Dashboard</NavLink>

              <Section label="Flights & Packages" />
              <NavLink href="/admin/flights" icon="plane" onClose={onClose} active={is("/admin/flights")}>Manage Flights</NavLink>
              <NavLink href="/admin/flights/new" icon="planePlus" onClose={onClose} active={is("/admin/flights/new")}>Add Flight / Package</NavLink>
              <NavLink href="/admin/airlines" icon="logo2" onClose={onClose} active={is("/admin/airlines")}>Airline Logos</NavLink>

              <Section label="Operations" />
              <NavLink href="/admin/bookings" icon="ticket" onClose={onClose} active={is("/admin/bookings")}>All Bookings</NavLink>
              <NavLink href="/admin/deposits" icon="wallet" onClose={onClose} active={is("/admin/deposits")}>Deposits</NavLink>

              <Section label="Accounts" />
              <NavLink href="/admin/users" icon="users" onClose={onClose} active={is("/admin/users")}>Users &amp; Access</NavLink>
            </>
          ) : (
            <>
              <Section label="Menu" />
              <NavLink href="/dashboard" icon="home" onClose={onClose} active={is("/dashboard")}>Home</NavLink>
              <NavLink href="/flights/search" icon="search" onClose={onClose} active={is("/flights/search")}>Search Flights</NavLink>
              <NavLink href="/cart" icon="cart" onClose={onClose} active={is("/cart")}>My Cart</NavLink>
              <NavLink href="/bookings" icon="ticket" onClose={onClose} active={is("/bookings")}>My Bookings</NavLink>
              <NavLink href="/deposits" icon="wallet" onClose={onClose} active={is("/deposits")}>Deposits</NavLink>
            </>
          )}
        </nav>

        {session?.user && (
          <div className="border-t border-black/5 p-4 shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-noori-primary-light text-noori-primary-dark font-semibold flex items-center justify-center border border-noori-primary/20 shrink-0">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-noori-ink truncate">{session.user.name}</div>
                <div className="text-xs text-noori-muted truncate">{session.user.email}</div>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-noori-ink py-1.5"
            >
              <Icon name="profile" /> My Profile
            </Link>

            {isAdmin ? (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-noori-primary-dark py-1.5"
              >
                <Icon name="shield" /> View User Site
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-noori-primary-dark py-1.5"
              >
                <Icon name="shield" /> Admin Login
              </Link>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left text-sm text-noori-danger font-medium mt-1 py-1.5"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
