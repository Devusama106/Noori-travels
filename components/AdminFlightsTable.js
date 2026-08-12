"use client";

import { useState, useMemo } from "react";
import { formatDate, formatMoney } from "@/lib/utils";
import DeleteFlightButton from "./DeleteFlightButton";
import AirlineLogo from "./AirlineLogo";

export default function AdminFlightsTable({ flights }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return flights;
    return flights.filter((f) =>
      [f.airlineName, f.flightNumber, f.originCity, f.originCode, f.destinationCity, f.destinationCode, f.packageType]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [q, flights]);

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
          placeholder="Search by airline, route, or flight number..."
          className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-noori-primary/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-noori-muted bg-noori-sand">
                <th className="py-3 px-4 font-medium">Airline / Flight</th>
                <th className="py-3 px-4 font-medium">Route</th>
                <th className="py-3 px-4 font-medium">Depart</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Seats</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-t border-black/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <AirlineLogo name={f.airlineName} code={f.airlineCode} logoUrl={f.airlineLogo} size={28} />
                      <div>
                        <div className="font-medium text-noori-ink">{f.airlineName}</div>
                        <div className="text-xs text-noori-muted">{f.flightNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {f.originCode} → {f.destinationCode}
                    {f.returnDepartDate ? ` → ${f.originCode}` : ""}
                  </td>
                  <td className="py-3 px-4">{formatDate(f.departDate)} {f.departTime}</td>
                  <td className="py-3 px-4">{f.packageType}</td>
                  <td className="py-3 px-4">{formatMoney(f.price, f.currency)}</td>
                  <td className="py-3 px-4">{f.seatsAvailable}</td>
                  <td className="py-3 px-4">
                    <DeleteFlightButton id={f.id} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-noori-muted">
                    {flights.length === 0 ? "No flights listed yet." : `No flights match "${q}".`}
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
