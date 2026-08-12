"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import EditUserControls from "./EditUserControls";
import PendingUserActions from "./PendingUserActions";
import StatusBadge from "./StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";

export default function AdminUsersTable({ users, currentUserId }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.address].filter(Boolean).some((f) => f.toLowerCase().includes(term))
    );
  }, [q, users]);

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
          placeholder="Search by name, email, or phone..."
          className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-noori-muted bg-noori-sand">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Booking Limit Usage</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium">Ledger</th>
                <th className="py-3 px-4 font-medium">Role / Limit / Access</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={`border-t border-black/5 ${u.status === "PENDING" ? "bg-noori-warning/5" : ""}`}>
                  <td className="py-3 px-4 font-medium text-noori-ink">
                    {u.name}
                    {String(u.id) === String(currentUserId) && (
                      <span className="ml-2 text-[10px] text-noori-muted">(you)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-noori-muted">
                    <div>{u.email}</div>
                    {u.phone && <div className="text-xs">{u.phone}</div>}
                    {u.address && (
                      <div className="text-xs truncate max-w-[180px]" title={u.address}>
                        {u.address}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="py-3 px-4">
                    {u.role === "USER" ? (
                      u.bookingLimit > 0 ? (
                        <div>
                          <div className="text-noori-ink">
                            {formatMoney(u.usedLimit)} / {formatMoney(u.bookingLimit)}
                          </div>
                          <div className="w-32 h-1.5 bg-black/5 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${u.usedLimit >= u.bookingLimit ? "bg-noori-danger" : "bg-noori-primary"}`}
                              style={{ width: `${Math.min((u.usedLimit / u.bookingLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-noori-muted">Unlimited</span>
                      )
                    ) : (
                      <span className="text-noori-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-noori-muted">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4">
                    {u.role === "USER" && (
                      <Link href={`/admin/deposits?userId=${u.id}`} className="text-noori-primary text-xs font-medium hover:underline">
                        View Ledger
                      </Link>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {u.status === "ACTIVE" ? <EditUserControls user={u} /> : <PendingUserActions userId={u.id} />}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-noori-muted">
                    No users match "{q}".
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
