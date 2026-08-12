"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

// Messages we deliberately throw from authorize() for pending/rejected accounts —
// NextAuth's credentials provider surfaces the thrown Error's message directly.
const KNOWN_MESSAGES = [
  "Your registration is still awaiting admin approval. You'll be able to sign in once it's approved.",
  "Your registration request was not approved. Please contact the admin for details.",
];

export default function LoginForm({ role, redirectTo, demoEmail, demoPassword, heading }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(KNOWN_MESSAGES.includes(res.error) ? res.error : "Invalid email or password.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noori-sand px-4 relative overflow-hidden">
      <div className="absolute inset-0 noori-motif pointer-events-none" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-black/5 p-8 relative">
        <div className="flex justify-center mb-6">
          <Logo subtitle={role === "ADMIN" ? "Admin Panel" : "Booking Portal"} />
        </div>
        <h1 className="font-display text-xl font-semibold text-center text-noori-ink mb-1">
          {heading}
        </h1>
        <p className="text-center text-sm text-noori-muted mb-6">
          Sign in to continue to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-noori-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-noori-ink">Password</label>
              <Link href="/forgot-password" className="text-xs text-noori-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-noori-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-noori-primary hover:bg-noori-primary-dark text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {role !== "ADMIN" && (
          <p className="text-center text-sm text-noori-muted mt-4">
            New agency?{" "}
            <Link href="/register" className="text-noori-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
