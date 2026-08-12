"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MODES = ["Bank Transfer", "Cheque", "Cash", "Online Payment"];

export default function DepositForm() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    mode: "",
    beneficiaryAccountId: "",
    agentBankName: "",
    agentAccountNumber: "",
    amount: "",
    paymentDate: "",
    documentReference: "",
    additionalInfo: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/beneficiary-accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []))
      .catch(() => {});
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) {
      setError("Attachment must be under 7MB.");
      return;
    }
    setError("");
    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => setAttachment(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.mode || !form.beneficiaryAccountId || !form.agentBankName || !form.agentAccountNumber || !form.amount || !form.paymentDate) {
      setError("Please fill all required fields marked *.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attachment, attachmentName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit deposit");
      setForm({
        mode: "",
        beneficiaryAccountId: "",
        agentBankName: "",
        agentAccountNumber: "",
        amount: "",
        paymentDate: "",
        documentReference: "",
        additionalInfo: "",
      });
      setAttachment(null);
      setAttachmentName("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
      <h2 className="font-display font-semibold text-lg text-noori-ink mb-4">New Deposit</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <F label="Mode of Payment*">
          <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className="input">
            <option value="">Select Method</option>
            {MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </F>
        <F label="Beneficiary Account*">
          <select value={form.beneficiaryAccountId} onChange={(e) => set("beneficiaryAccountId", e.target.value)} className="input">
            <option value="">Select Account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.bankName} - {a.accountNumber}
              </option>
            ))}
          </select>
        </F>
        <F label="Your Bank Name*">
          <input value={form.agentBankName} onChange={(e) => set("agentBankName", e.target.value)} className="input" placeholder="e.g. HBL" />
        </F>
        <F label="Your Account No*">
          <input value={form.agentAccountNumber} onChange={(e) => set("agentAccountNumber", e.target.value)} className="input" placeholder="Account number" />
        </F>
        <F label="Amount*">
          <input type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className="input" placeholder="0" />
        </F>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <F label="Payment Date*">
          <input type="date" value={form.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} className="input" />
        </F>
        <F label="Document Reference">
          <input value={form.documentReference} onChange={(e) => set("documentReference", e.target.value)} className="input" placeholder="Transaction / slip #" />
        </F>
        <F label="Attachment (pdf, jpg, png — max 7MB)">
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="text-sm" />
        </F>
      </div>

      <F label="Additional Information">
        <input value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)} className="input" placeholder="Optional notes" />
      </F>

      <div className="mt-4 bg-noori-sand rounded-lg p-4 text-xs text-noori-muted space-y-1">
        <p>• Payments after banking hours will be processed the next working day.</p>
        <p>• Attach a proper payment slip including reference, sender, and beneficiary bank details to avoid delays.</p>
        <p>• Please ensure to transfer payments only from your registered travel agency bank account.</p>
      </div>

      {error && <p className="text-sm text-noori-danger mt-3">{error}</p>}

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Submitting..." : "Add Deposit"}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(11,110,79,0.25);
          border-color: var(--noori-primary);
        }
      `}</style>
    </form>
  );
}

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-noori-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
