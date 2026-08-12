"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { formatDate, formatMoney, downloadCSV } from "@/lib/utils";

export default function DepositsTable({ deposits, mode = "user" }) {
  const router = useRouter();
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    return deposits.filter((d) => {
      if (status !== "All" && d.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        const haystack = [
          d.beneficiaryBankName,
          d.agentBankName,
          d.depositRef,
          d.documentReference,
          d.userName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });
  }, [deposits, status, search]);

  function toRow(d) {
    return {
      "Deposit Ref": d.depositRef,
      "Payment Date": formatDate(d.paymentDate),
      ...(mode === "admin" ? { User: d.userName, Email: d.userEmail } : {}),
      "Mode": d.mode,
      "Beneficiary Bank": d.beneficiaryBankName,
      "Beneficiary Account": d.beneficiaryAccountNumber,
      "Agent Bank": d.agentBankName,
      "Agent Account": d.agentAccountNumber,
      "Amount": d.amount,
      "Document Reference": d.documentReference || "",
      "Status": d.status,
      "Submitted On": formatDate(d.createdAt),
    };
  }

  function downloadLedger() {
    downloadCSV(filtered.map(toRow), `deposit-ledger-${new Date().toISOString().slice(0, 10)}`);
  }

  function downloadSingle(d) {
    if (d.attachment) {
      const a = document.createElement("a");
      a.href = d.attachment;
      a.download = d.attachmentName || `${d.depositRef}-slip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      downloadCSV([toRow(d)], `${d.depositRef}`);
    }
  }

  function viewAttachment(d) {
    if (!d.attachment) return;
    const win = window.open();
    if (d.attachment.startsWith("data:application/pdf")) {
      win.document.write(
        `<iframe src="${d.attachment}" style="border:0;width:100%;height:100%;"></iframe>`
      );
    } else {
      win.document.write(`<img src="${d.attachment}" style="max-width:100%;" />`);
    }
  }

  async function updateStatus(id, newStatus) {
    setBusyId(id);
    await fetch(`/api/deposits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/5">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Pending", "Approved", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                status === s ? "bg-noori-primary text-white border-noori-primary" : "border-black/10 text-noori-ink"
              }`}
            >
              {s}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bank, ref, user..."
            className="text-sm border border-black/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          />
        </div>
        <button
          onClick={downloadLedger}
          disabled={!filtered.length}
          className="text-xs font-medium bg-noori-primary-light text-noori-primary-dark rounded-lg px-3 py-1.5 hover:bg-noori-primary/20 disabled:opacity-50"
        >
          ⬇ Download Ledger (CSV)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-noori-muted bg-noori-sand">
              <th className="py-3 px-4 font-medium">Ref</th>
              <th className="py-3 px-4 font-medium">Payment Date</th>
              {mode === "admin" && <th className="py-3 px-4 font-medium">User</th>}
              <th className="py-3 px-4 font-medium">Beneficiary Account</th>
              <th className="py-3 px-4 font-medium">Agent Account</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-black/5">
                <td className="py-3 px-4 text-noori-ink font-medium">{d.depositRef}</td>
                <td className="py-3 px-4">{formatDate(d.paymentDate)}</td>
                {mode === "admin" && (
                  <td className="py-3 px-4">
                    <div className="text-noori-ink">{d.userName}</div>
                    <div className="text-xs text-noori-muted">{d.userEmail}</div>
                  </td>
                )}
                <td className="py-3 px-4">
                  {d.beneficiaryBankName} - {d.beneficiaryAccountNumber}
                </td>
                <td className="py-3 px-4">
                  {d.agentBankName} - {d.agentAccountNumber}
                </td>
                <td className="py-3 px-4 font-medium">{formatMoney(d.amount)}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {d.attachment && (
                      <button onClick={() => viewAttachment(d)} title="View slip" className="text-noori-muted hover:text-noori-primary">
                        <EyeIcon />
                      </button>
                    )}
                    <button onClick={() => downloadSingle(d)} title="Download" className="text-noori-muted hover:text-noori-primary">
                      <DownloadIcon />
                    </button>
                    {mode === "admin" && d.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(d.id, "Approved")}
                          disabled={busyId === d.id}
                          className="text-xs font-medium bg-noori-success/10 text-noori-success rounded-lg px-2.5 py-1 hover:bg-noori-success/20 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(d.id, "Rejected")}
                          disabled={busyId === d.id}
                          className="text-xs font-medium bg-noori-danger/10 text-noori-danger rounded-lg px-2.5 py-1 hover:bg-noori-danger/20 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={mode === "admin" ? 8 : 7} className="py-10 text-center text-noori-muted">
                  No deposits match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
