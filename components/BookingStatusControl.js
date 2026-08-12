"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = ["Pending", "Confirmed", "Ticketed", "Cancelled"];

export default function BookingStatusControl({ bookingId, currentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="text-xs border border-black/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
