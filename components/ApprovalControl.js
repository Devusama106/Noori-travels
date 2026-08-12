"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingStatusControl from "./BookingStatusControl";

export default function ApprovalControl({ bookingId, paymentStatus, currentStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle(action) {
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  if (paymentStatus === "Awaiting Approval") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handle("approve")}
          disabled={busy}
          className="text-xs font-medium bg-noori-success/10 text-noori-success rounded-lg px-3 py-1.5 hover:bg-noori-success/20 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={busy}
          className="text-xs font-medium bg-noori-danger/10 text-noori-danger rounded-lg px-3 py-1.5 hover:bg-noori-danger/20 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    );
  }

  return <BookingStatusControl bookingId={bookingId} currentStatus={currentStatus} />;
}
