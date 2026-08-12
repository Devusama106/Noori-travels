"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingUserActions({ userId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(status) {
    if (status === "REJECTED" && !confirm("Reject this registration request?")) return;
    setBusy(true);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => decide("ACTIVE")}
        disabled={busy}
        className="text-xs font-medium bg-noori-success text-white rounded-lg px-3 py-1.5 hover:bg-noori-success/90 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        onClick={() => decide("REJECTED")}
        disabled={busy}
        className="text-xs font-medium bg-noori-danger/10 text-noori-danger rounded-lg px-3 py-1.5 hover:bg-noori-danger/20 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
