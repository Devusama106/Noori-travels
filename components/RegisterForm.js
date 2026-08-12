"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const initial = { name: "", email: "", phone: "", address: "", password: "", confirm: "" };

export default function RegisterForm() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noori-sand px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-black/5 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-noori-success/10 text-noori-success flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold text-noori-ink mb-2">Request submitted</h1>
          <p className="text-sm text-noori-muted mb-6">
            Your registration has been sent to the Noori Travels admin for approval. You'll be able to
            sign in as soon as it's approved — this usually doesn't take long.
          </p>
          <Link
            href="/login"
            className="inline-block bg-noori-primary hover:bg-noori-primary-dark text-white font-medium rounded-lg px-5 py-2.5 text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-noori-sand px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 noori-motif pointer-events-none" />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-black/5 p-8 relative">
        <div className="flex justify-center mb-6">
          <Logo subtitle="Create an Agent Account" />
        </div>
        <h1 className="font-display text-xl font-semibold text-center text-noori-ink mb-1">
          Register your agency
        </h1>
        <p className="text-center text-sm text-noori-muted mb-6">
          Submit your details below — an admin will review and approve your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-noori-ink mb-1">Full Name / Agency Name*</label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
              placeholder="e.g. Ahmed Travel Agency"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-noori-ink mb-1">Email*</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-noori-ink mb-1">Phone Number*</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-noori-ink mb-1">Address*</label>
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary resize-none"
              placeholder="Office address, city"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-noori-ink mb-1">Password*</label>
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-noori-ink mb-1">Confirm Password*</label>
              <input
                required
                type="password"
                minLength={6}
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30 focus:border-noori-primary"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-noori-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-noori-primary hover:bg-noori-primary-dark text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <p className="text-center text-sm text-noori-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-noori-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
