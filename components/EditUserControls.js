"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditUserControls({ user }) {
  const router = useRouter();
  const [limit, setLimit] = useState(user.bookingLimit || 0);
  const [role, setRole] = useState(user.role);
  const [locked, setLocked] = useState(!!user.accountLocked);
  const [busy, setBusy] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function save(patch) {
    setBusy(true);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Remove ${user.name}'s account? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not delete this user.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        disabled={busy}
        onChange={(e) => {
          setRole(e.target.value);
          save({ role: e.target.value });
        }}
        className="text-xs border border-black/10 rounded-lg px-2 py-1.5"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      {role === "USER" && (
        <input
          type="number"
          min="0"
          value={limit}
          disabled={busy}
          onChange={(e) => setLimit(e.target.value)}
          onBlur={() => save({ bookingLimit: limit })}
          className="text-xs border border-black/10 rounded-lg px-2 py-1.5 w-28"
          title="Booking limit (PKR), 0 = unlimited"
        />
      )}

      <button
        onClick={() => {
          setLocked((v) => !v);
          save({ accountLocked: !locked });
        }}
        disabled={busy}
        className={`text-xs font-medium rounded-lg px-2.5 py-1.5 ${
          locked ? "bg-noori-danger/10 text-noori-danger" : "bg-noori-success/10 text-noori-success"
        }`}
      >
        {locked ? "Locked" : "Active"}
      </button>

      <button
        onClick={handleDelete}
        disabled={busy}
        className="text-xs text-noori-danger hover:underline"
      >
        Remove
      </button>

      {savedFlash && <span className="text-xs text-noori-success">Saved</span>}
    </div>
  );
}
