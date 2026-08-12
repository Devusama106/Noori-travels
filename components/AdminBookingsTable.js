"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import ApprovalControl from "./ApprovalControl";
import { formatDate, formatMoney } from "@/lib/utils";

export default function AdminBookingsTable({ bookings }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter((b) =>
      [b.bookingRef, b.pnr, b.agentName, b.agentEmail, b.originCode, b.destinationCode, b.status, b.paymentStatus]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [q, bookings]);

  return (
    <>
      <div className="relative mb-4 max-w-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-noori-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by ref, agent, route, or status..."
          className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-noori-muted bg-noori-sand">
                <th className="py-3 px-4 font-medium">Booking Ref</th>
                <th className="py-3 px-4 font-medium">Agent</th>
                <th className="py-3 px-4 font-medium">Trip</th>
                <th className="py-3 px-4 font-medium">Travel Date</th>
                <th className="py-3 px-4 font-medium">Fare</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-black/5">
                  <td className="py-3 px-4">
                    <Link href={`/booking/confirmation/${b.id}`} className="text-noori-primary hover:underline">
                      {b.bookingRef}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div>{b.agentName}</div>
                    <div className="text-xs text-noori-muted">{b.agentEmail}</div>
                  </td>
                  <td className="py-3 px-4">{b.originCode} to {b.destinationCode}</td>
                  <td className="py-3 px-4">{formatDate(b.departDate)}</td>
                  <td className="py-3 px-4">{formatMoney(b.totalFare)}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  <td className="py-3 px-4"><StatusBadge status={b.paymentStatus} /></td>
                  <td className="py-3 px-4">
                    <ApprovalControl bookingId={b.id} paymentStatus={b.paymentStatus} currentStatus={b.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-noori-muted">
                    {bookings.length === 0 ? "No bookings yet." : `No bookings match "${q}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
