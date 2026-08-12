"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.user);
        setLoading(false);
      });
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address: profile.address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes");
      setProfile(data.user);
      setProfileSaved(true);
      router.refresh();
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      setProfileError(e.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (pw.next !== pw.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password");
      setPw({ current: "", next: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (e) {
      setPwError(e.message);
    } finally {
      setSavingPw(false);
    }
  }

  if (loading || !profile) {
    return <div className="text-sm text-noori-muted">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-noori-ink">Account Details</h2>

        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Full Name / Agency Name*</label>
          <input
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Email</label>
          <input value={profile.email} disabled className="input bg-black/5 text-noori-muted" />
          <p className="text-xs text-noori-muted mt-1">Contact an admin if you need your email changed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="input"
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Address</label>
            <input
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="input"
              placeholder="Office address, city"
            />
          </div>
        </div>

        {profileError && <p className="text-sm text-noori-danger">{profileError}</p>}

        <button
          type="submit"
          disabled={savingProfile}
          className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-5 py-2.5 disabled:opacity-60"
        >
          {savingProfile ? "Saving..." : profileSaved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-noori-ink">Change Password</h2>

        <div>
          <label className="block text-xs font-medium text-noori-muted mb-1">Current Password*</label>
          <input
            required
            type="password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            className="input"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">New Password*</label>
            <input
              required
              type="password"
              minLength={6}
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-noori-muted mb-1">Confirm New Password*</label>
            <input
              required
              type="password"
              minLength={6}
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="input"
            />
          </div>
        </div>

        {pwError && <p className="text-sm text-noori-danger">{pwError}</p>}

        <button
          type="submit"
          disabled={savingPw}
          className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-5 py-2.5 disabled:opacity-60"
        >
          {savingPw ? "Updating..." : pwSaved ? "Password Updated ✓" : "Update Password"}
        </button>
      </form>

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
    </div>
  );
}
