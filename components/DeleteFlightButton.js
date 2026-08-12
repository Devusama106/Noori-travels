"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteFlightButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this listing? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/flights/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-noori-danger text-xs font-medium hover:underline disabled:opacity-60"
    >
      {busy ? "Removing..." : "Remove"}
    </button>
  );
}
