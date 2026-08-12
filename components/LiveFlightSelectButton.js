"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LiveFlightSelectButton({ offer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/flights/import-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not import this flight");
      router.push(`/booking/review?flightId=${data.flightId}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-center inline-block w-full bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
      >
        {loading ? "Loading..." : "Select"}
      </button>
      {error && <p className="text-xs text-noori-danger mt-1.5">{error}</p>}
    </div>
  );
}
