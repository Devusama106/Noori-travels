"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AirlineLogo from "./AirlineLogo";

export default function AddAirlineForm({ existing = [] }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [mode, setMode] = useState("upload"); // "upload" | "url"
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setError("Please choose an image under 500KB (a small square logo works best).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Airline name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code: code.trim() || null, logoUrl: logoUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save airline");
      setName("");
      setCode("");
      setLogoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
      <h3 className="font-display font-semibold text-noori-ink">Add / Update Airline Logo</h3>

      <div className="flex items-center gap-4">
        <AirlineLogo name={name || "?"} code={code} logoUrl={logoUrl} size={56} />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Airline Name*</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              list="existing-airlines"
              placeholder="e.g. PIA, AirSial"
              className="input"
            />
            <datalist id="existing-airlines">
              {existing.map((a) => (
                <option key={a.id} value={a.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Airline Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PK, PF"
              className="input"
              maxLength={4}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs px-3 py-1.5 rounded-full border ${mode === "upload" ? "bg-noori-primary text-white border-noori-primary" : "border-black/10 text-noori-ink"}`}
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-xs px-3 py-1.5 rounded-full border ${mode === "url" ? "bg-noori-primary text-white border-noori-primary" : "border-black/10 text-noori-ink"}`}
          >
            Paste Image URL
          </button>
        </div>

        {mode === "upload" ? (
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="text-sm" />
            <p className="text-xs text-noori-muted mt-1">PNG/JPG, square logo, under 500KB works best.</p>
          </div>
        ) : (
          <input
            value={logoUrl.startsWith("data:") ? "" : logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="input"
          />
        )}
      </div>

      {error && <p className="text-sm text-noori-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-5 py-2.5 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Airline"}
      </button>

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
