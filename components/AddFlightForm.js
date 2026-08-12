"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AutocompleteInput from "./AutocompleteInput";
import AirlineLogo from "./AirlineLogo";

const initial = {
  airlineName: "",
  airlineCode: "",
  flightNumber: "",
  packageType: "Flight",
  originCity: "",
  originCode: "",
  destinationCity: "",
  destinationCode: "",
  departDate: "",
  departTime: "",
  arriveDate: "",
  arriveTime: "",
  duration: "",
  stops: 0,
  returnDepartDate: "",
  returnDepartTime: "",
  returnArriveDate: "",
  returnArriveTime: "",
  returnDuration: "",
  returnOriginCity: "",
  returnOriginCode: "",
  returnDestinationCity: "",
  returnDestinationCode: "",
  class: "Economy",
  meal: "No Meal",
  baggage: "20KG+7KG",
  refundable: false,
  price: "",
  currency: "PKR",
  supplier: "",
  seatsAvailable: 9,
};

export default function AddFlightForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [airlineOptions, setAirlineOptions] = useState([]);
  const [airlines, setAirlines] = useState([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => {
        setCityOptions(
          (d.cities || []).map((c) => ({ label: `${c.city} (${c.code})`, value: c.city, code: c.code }))
        );
      })
      .catch(() => {});
    fetch("/api/airlines")
      .then((r) => r.json())
      .then((d) => {
        setAirlines(d.airlines || []);
        setAirlineOptions((d.airlines || []).map((a) => ({ label: a.name, value: a.name, code: a.code })));
      })
      .catch(() => {});
  }, []);

  function pickAirline(value) {
    const match = airlineOptions.find((o) => o.value === value);
    set("airlineName", value);
    if (match?.code) set("airlineCode", match.code);
  }

  const selectedAirline = airlines.find((a) => a.name === form.airlineName);

  function pickCity(cityField, codeField, cityValue) {
    const match = cityOptions.find((o) => o.value === cityValue);
    set(cityField, cityValue);
    if (match) set(codeField, match.code);
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = { ...form };
    if (!isRoundTrip) {
      payload.returnDepartDate = null;
      payload.returnDepartTime = null;
      payload.returnArriveDate = null;
      payload.returnArriveTime = null;
      payload.returnDuration = null;
      payload.returnOriginCity = null;
      payload.returnOriginCode = null;
      payload.returnDestinationCity = null;
      payload.returnDestinationCode = null;
    } else {
      // Default return leg to the reverse route if not explicitly set
      payload.returnOriginCity = payload.returnOriginCity || form.destinationCity;
      payload.returnOriginCode = payload.returnOriginCode || form.destinationCode;
      payload.returnDestinationCity = payload.returnDestinationCity || form.originCity;
      payload.returnDestinationCode = payload.returnDestinationCode || form.originCode;
    }

    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add listing");

      // Make sure this airline exists in the logo registry so an admin can add a logo for it later
      fetch("/api/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.airlineName, code: form.airlineCode || null }),
      }).catch(() => {});

      router.push("/admin/flights");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-noori-ink">Airline &amp; Listing Type</h3>
          <Link href="/admin/airlines" className="text-xs text-noori-primary hover:underline">
            + Manage airline logos
          </Link>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <div className="pt-6">
            <AirlineLogo name={form.airlineName || "?"} code={form.airlineCode} logoUrl={selectedAirline?.logoUrl} size={40} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
            <F label="Airline Name*"><AutocompleteInput value={form.airlineName} onChange={pickAirline} options={airlineOptions} placeholder="e.g. PIA, AirSial" className="input" /></F>
            <F label="Airline Code"><input className="input" value={form.airlineCode} onChange={(e) => set("airlineCode", e.target.value)} placeholder="e.g. PK" /></F>
            <F label="Flight Number*"><input required className="input" value={form.flightNumber} onChange={(e) => set("flightNumber", e.target.value)} placeholder="e.g. PK-756" /></F>
            <F label="Listing Type">
              <select className="input" value={form.packageType} onChange={(e) => set("packageType", e.target.value)}>
                <option>Flight</option>
                <option>Umrah Package</option>
              </select>
            </F>
          </div>
        </div>
        {form.airlineName && !selectedAirline && (
          <p className="text-xs text-noori-warning">
            No logo set for "{form.airlineName}" yet — it will show initials until you{" "}
            <Link href="/admin/airlines" className="underline">add a logo</Link>.
          </p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-noori-ink mb-3">Outbound Leg</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <F label="Origin City*"><AutocompleteInput value={form.originCity} onChange={(v) => pickCity("originCity", "originCode", v)} options={cityOptions} placeholder="Islamabad" className="input" /></F>
          <F label="Origin Code*"><input required className="input" value={form.originCode} onChange={(e) => set("originCode", e.target.value)} placeholder="ISB" maxLength={4} /></F>
          <F label="Destination City*"><AutocompleteInput value={form.destinationCity} onChange={(v) => pickCity("destinationCity", "destinationCode", v)} options={cityOptions} placeholder="Jeddah" className="input" /></F>
          <F label="Destination Code*"><input required className="input" value={form.destinationCode} onChange={(e) => set("destinationCode", e.target.value)} placeholder="JED" maxLength={4} /></F>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <F label="Depart Date*"><input required type="date" className="input" value={form.departDate} onChange={(e) => set("departDate", e.target.value)} /></F>
          <F label="Depart Time*"><input required type="time" className="input" value={form.departTime} onChange={(e) => set("departTime", e.target.value)} /></F>
          <F label="Arrive Date*"><input required type="date" className="input" value={form.arriveDate} onChange={(e) => set("arriveDate", e.target.value)} /></F>
          <F label="Arrive Time*"><input required type="time" className="input" value={form.arriveTime} onChange={(e) => set("arriveTime", e.target.value)} /></F>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
          <F label="Duration*"><input required className="input" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 3h 25m" /></F>
          <F label="Stops">
            <select className="input" value={form.stops} onChange={(e) => set("stops", e.target.value)}>
              <option value={0}>NonStop</option>
              <option value={1}>1 Stop</option>
              <option value={2}>2 Stops</option>
            </select>
          </F>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-noori-ink">Return Leg</h3>
          <label className="flex items-center gap-2 text-sm text-noori-ink">
            <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="accent-noori-primary" />
            Round Trip
          </label>
        </div>
        {isRoundTrip && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
              <F label="Return Origin City"><AutocompleteInput value={form.returnOriginCity} onChange={(v) => pickCity("returnOriginCity", "returnOriginCode", v)} options={cityOptions} placeholder={form.destinationCity || "e.g. Jeddah"} className="input" /></F>
              <F label="Return Origin Code"><input className="input" value={form.returnOriginCode} onChange={(e) => set("returnOriginCode", e.target.value)} placeholder={form.destinationCode || "JED"} /></F>
              <F label="Return Destination City"><AutocompleteInput value={form.returnDestinationCity} onChange={(v) => pickCity("returnDestinationCity", "returnDestinationCode", v)} options={cityOptions} placeholder={form.originCity || "e.g. Islamabad"} className="input" /></F>
              <F label="Return Destination Code"><input className="input" value={form.returnDestinationCode} onChange={(e) => set("returnDestinationCode", e.target.value)} placeholder={form.originCode || "ISB"} /></F>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <F label="Return Depart Date"><input type="date" className="input" value={form.returnDepartDate} onChange={(e) => set("returnDepartDate", e.target.value)} /></F>
              <F label="Return Depart Time"><input type="time" className="input" value={form.returnDepartTime} onChange={(e) => set("returnDepartTime", e.target.value)} /></F>
              <F label="Return Arrive Date"><input type="date" className="input" value={form.returnArriveDate} onChange={(e) => set("returnArriveDate", e.target.value)} /></F>
              <F label="Return Arrive Time"><input type="time" className="input" value={form.returnArriveTime} onChange={(e) => set("returnArriveTime", e.target.value)} /></F>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <F label="Return Duration"><input className="input" value={form.returnDuration} onChange={(e) => set("returnDuration", e.target.value)} placeholder="e.g. 7h 0m" /></F>
            </div>
          </>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-noori-ink mb-3">Fare &amp; Service Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <F label="Class">
            <select className="input" value={form.class} onChange={(e) => set("class", e.target.value)}>
              <option>Economy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </F>
          <F label="Meal">
            <select className="input" value={form.meal} onChange={(e) => set("meal", e.target.value)}>
              <option>No Meal</option>
              <option>Meal Included</option>
            </select>
          </F>
          <F label="Baggage"><input className="input" value={form.baggage} onChange={(e) => set("baggage", e.target.value)} placeholder="20KG+7KG" /></F>
          <F label="Refundable">
            <select className="input" value={form.refundable ? "1" : "0"} onChange={(e) => set("refundable", e.target.value === "1")}>
              <option value="0">Non Refundable</option>
              <option value="1">Refundable</option>
            </select>
          </F>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <F label="Price*"><input required type="number" min="0" className="input" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="237500" /></F>
          <F label="Currency">
            <select className="input" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              <option>PKR</option>
              <option>USD</option>
              <option>GBP</option>
            </select>
          </F>
          <F label="Supplier"><input className="input" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="e.g. AirArabia" /></F>
          <F label="Seats Available"><input type="number" min="0" className="input" value={form.seatsAvailable} onChange={(e) => set("seatsAvailable", e.target.value)} /></F>
        </div>
      </section>

      {error && <p className="text-sm text-noori-danger">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-black/5">
        <button
          type="button"
          onClick={() => router.push("/admin/flights")}
          className="flex-1 border border-black/10 rounded-lg py-2.5 text-sm font-medium text-noori-ink hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-noori-primary hover:bg-noori-primary-dark text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Publishing..." : "Publish Listing"}
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
