"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset password");
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noori-sand px-4 relative overflow-hidden">
      <div className="absolute inset-0 noori-motif pointer-events-none" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-black/5 p-8 relative">
        <div className="flex justify-center mb-6">
          <Logo subtitle="Reset Password" />
        </div>

        {!token ? (
          <div className="text-center">
            <p className="text-sm text-noori-danger mb-4">This reset link is missing its token.</p>
            <Link href="/forgot-password" className="text-sm text-noori-primary font-medium hover:underline">
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-noori-success/10 text-noori-success flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-semibold text-noori-ink mb-2">Password updated</h1>
            <p className="text-sm text-noori-muted">Taking you to Sign In...</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-xl font-semibold text-center text-noori-ink mb-1">Set a new password</h1>
            <p className="text-center text-sm text-noori-muted mb-6">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-noori-ink mb-1">New Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-noori-ink mb-1">Confirm Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                  placeholder="Re-enter password"
                />
              </div>
              {error && <p className="text-sm text-noori-danger">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-noori-primary hover:bg-noori-primary-dark text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
