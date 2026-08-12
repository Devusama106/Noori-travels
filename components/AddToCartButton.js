"use client";

import { useState } from "react";
import { notifyCartUpdated } from "./CartIcon";

export default function AddToCartButton({ flightId, offer }) {
  const [state, setState] = useState("idle"); // idle | saving | added
  const [error, setError] = useState("");

  async function handleClick() {
    if (state === "saving" || state === "added") return;
    setState("saving");
    setError("");
    try {
      let id = flightId;
      if (!id && offer) {
        const importRes = await fetch("/api/flights/import-live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offer),
        });
        const importData = await importRes.json();
        if (!importRes.ok) throw new Error(importData.error || "Could not import this flight");
        id = importData.flightId;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not add to cart");
      }
      notifyCartUpdated();
      setState("added");
      setTimeout(() => setState("idle"), 1800);
    } catch (e) {
      setError(e.message);
      setState("idle");
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "saving"}
        className={`w-full flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg px-4 py-2 border transition-colors ${
          state === "added"
            ? "bg-noori-success/10 text-noori-success border-noori-success/30"
            : "border-noori-primary text-noori-primary hover:bg-noori-primary-light"
        }`}
      >
        {state === "added" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added to Cart
          </>
        ) : state === "saving" ? (
          "Adding..."
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
            Add to Cart
          </>
        )}
      </button>
      {error && <p className="text-xs text-noori-danger mt-1">{error}</p>}
    </div>
  );
}
