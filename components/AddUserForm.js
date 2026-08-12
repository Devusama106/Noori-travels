"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "USER",
    bookingLimit: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      router.push("/admin/users");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-5 max-w-xl">
      <div>
        <label className="block text-xs font-medium text-noori-muted mb-1">Full Name*</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="input"
          placeholder="e.g. Ahmed Travel Agency"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-noori-muted mb-1">Email*</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="input"
          placeholder="agent@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-noori-muted mb-1">Password*</label>
        <input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="input"
          placeholder="At least 6 characters"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="input"
            placeholder="+92 300 1234567"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Address</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="input"
            placeholder="Office address, city"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Role*</label>
          <select value={form.role} onChange={(e) => set("role", e.target.value)} className="input">
            <option value="USER">User (Travel Agent)</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p className="text-xs text-noori-muted mt-1">
            {form.role === "ADMIN"
              ? "Full access: manage flights, users, and approve bookings."
              : "Can search flights and make bookings within their assigned limit."}
          </p>
        </div>

        {form.role === "USER" && (
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Booking Limit (PKR)</label>
            <input
              type="number"
              min="0"
              value={form.bookingLimit}
              onChange={(e) => set("bookingLimit", e.target.value)}
              className="input"
              placeholder="0 = unlimited"
            />
            <p className="text-xs text-noori-muted mt-1">
              Max total value of active bookings this user can hold at once.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-noori-danger">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-black/5">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="flex-1 border border-black/10 rounded-lg py-2.5 text-sm font-medium text-noori-ink hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-noori-primary hover:bg-noori-primary-dark text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create Account"}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(11,110,79,0.25);
          border-color: var(--noori-primary);
        }
      `}</style>
    </form>
  );
}
