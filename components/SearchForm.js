"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AutocompleteInput from "./AutocompleteInput";

const TABS = ["One Way / Round Trip", "Multi-city", "Group Booking", "Umrah Packages", "Special Offers"];

export default function SearchForm({ compact = false }) {
  const router = useRouter();
  const [tab, setTab] = useState("Umrah Packages");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => {
        setCityOptions(
          (d.cities || []).map((c) => ({ label: `${c.city} (${c.code})`, value: c.city, code: c.code }))
        );
      })
      .catch(() => {});
  }, []);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cls, setCls] = useState("Economy");
  const [direct, setDirect] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (originCode) params.set("originCode", originCode);
    if (destinationCode) params.set("destinationCode", destinationCode);
    if (departDate) params.set("date", departDate);
    if (returnDate) params.set("returnDate", returnDate);
    if (passengers) params.set("adults", passengers);
    if (tab === "Umrah Packages") params.set("packageType", "Umrah Package");
    if (direct) params.set("direct", "1");
    router.push(`/flights/search?${params.toString()}`);
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-black/5 ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors relative ${
              tab === t
                ? "bg-noori-primary text-white border-noori-primary"
                : "bg-white text-noori-ink border-black/10 hover:border-noori-primary/40"
            }`}
          >
            {t === "Umrah Packages" && (
              <span className="absolute -top-2 -right-2 bg-noori-gold text-white text-[9px] px-1.5 py-0.5 rounded-full rotate-6">
                New
              </span>
            )}
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Flying From</label>
          <AutocompleteInput
            value={origin}
            onChange={setOrigin}
            onSelect={(o) => setOriginCode(o.code || "")}
            options={cityOptions}
            placeholder="City or airport"
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Flying To</label>
          <AutocompleteInput
            value={destination}
            onChange={setDestination}
            onSelect={(o) => setDestinationCode(o.code || "")}
            options={cityOptions}
            placeholder="City or airport"
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Depart</label>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Return</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Passengers</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-noori-muted mb-1">Class</label>
          <select
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
          >
            <option>Economy</option>
            <option>Business</option>
            <option>First</option>
          </select>
        </div>

        <div className="md:col-span-5 flex items-center gap-2 text-sm text-noori-ink">
          <input
            id="direct"
            type="checkbox"
            checked={direct}
            onChange={(e) => setDirect(e.target.checked)}
            className="accent-noori-primary"
          />
          <label htmlFor="direct">Direct Flight Only</label>
        </div>
        <div className="md:col-span-1 flex items-end">
          <button
            type="submit"
            className="w-full bg-noori-primary hover:bg-noori-primary-dark text-white font-medium rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
