"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate } from "@/lib/utils";
import AirlineLogo from "./AirlineLogo";

function emptyPassenger() {
  return {
    title: "Mr",
    firstName: "",
    lastName: "",
    dob: "",
    nationality: "",
    passportNo: "",
    passportIssue: "",
    passportExpiry: "",
  };
}

export default function BookingReviewForm({ flight }) {
  const router = useRouter();
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => {});
  }, []);

  const isRoundTrip = !!flight.returnDepartDate;
  const total = flight.price * passengers.length;
  const overLimit = remaining !== null && total > remaining;

  function updatePassenger(idx, field, value) {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addPassenger() {
    setPassengers((prev) => [...prev, emptyPassenger()]);
  }

  function removePassenger(idx) {
    setPassengers((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(action) {
    setError("");
    for (const p of passengers) {
      if (!p.firstName || !p.lastName || !p.dob || !p.nationality || !p.passportNo) {
        setError("Please fill all required traveller fields (marked *) before continuing.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: flight.id, passengers, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");
      router.push(`/booking/confirmation/${data.booking.id}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <h2 className="font-display font-semibold text-lg text-noori-ink mb-4">Booking Review</h2>

          <FlightLegSummary
            title={`${flight.originCode} to ${flight.destinationCode} • ${formatDate(flight.departDate)}`}
            flightNumber={flight.flightNumber}
            airlineName={flight.airlineName}
            airlineCode={flight.airlineCode}
            airlineLogo={flight.airlineLogo}
            depTime={flight.departTime}
            depCode={flight.originCode}
            depDate={flight.departDate}
            arrTime={flight.arriveTime}
            arrCode={flight.destinationCode}
            arrDate={flight.arriveDate}
            meal={flight.meal}
            baggage={flight.baggage}
            refundable={flight.refundable}
            cls={flight.class}
          />

          {isRoundTrip && (
            <div className="mt-6 pt-6 border-t border-black/5">
              <FlightLegSummary
                title={`${flight.returnOriginCode} to ${flight.returnDestinationCode} • ${formatDate(flight.returnDepartDate)}`}
                flightNumber={flight.flightNumber}
                airlineName={flight.airlineName}
                airlineCode={flight.airlineCode}
                airlineLogo={flight.airlineLogo}
                depTime={flight.returnDepartTime}
                depCode={flight.returnOriginCode}
                depDate={flight.returnDepartDate}
                arrTime={flight.returnArriveTime}
                arrCode={flight.returnDestinationCode}
                arrDate={flight.returnArriveDate}
                meal={flight.meal}
                baggage={flight.baggage}
                refundable={flight.refundable}
                cls={flight.class}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-lg text-noori-ink">Traveller Details</h2>
            <button
              type="button"
              onClick={addPassenger}
              className="text-sm border border-noori-primary text-noori-primary rounded-lg px-3 py-1.5 hover:bg-noori-primary-light"
            >
              + Adult
            </button>
          </div>
          <p className="text-xs text-noori-muted mb-5">
            <strong>Notice:</strong> Use all given names and surnames exactly as they appear on the passport/ID to
            avoid inconveniences at the airport.
          </p>

          <div className="space-y-6">
            {passengers.map((p, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-noori-ink">Adult {idx + 1}</div>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(idx)}
                      className="text-noori-danger"
                      aria-label="Remove passenger"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                  <Field label="Title*">
                    <select
                      value={p.title}
                      onChange={(e) => updatePassenger(idx, "title", e.target.value)}
                      className="input"
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                    </select>
                  </Field>
                  <Field label="First Name*">
                    <input value={p.firstName} onChange={(e) => updatePassenger(idx, "firstName", e.target.value)} placeholder="Given Names" className="input" />
                  </Field>
                  <Field label="Last Name*">
                    <input value={p.lastName} onChange={(e) => updatePassenger(idx, "lastName", e.target.value)} placeholder="Sur Name" className="input" />
                  </Field>
                  <Field label="Date Of Birth*">
                    <input type="date" value={p.dob} onChange={(e) => updatePassenger(idx, "dob", e.target.value)} className="input" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Field label="Nationality*">
                    <input value={p.nationality} onChange={(e) => updatePassenger(idx, "nationality", e.target.value)} placeholder="Select the Nationality" className="input" />
                  </Field>
                  <Field label="Passport No*">
                    <input value={p.passportNo} onChange={(e) => updatePassenger(idx, "passportNo", e.target.value)} placeholder="Enter Passport Number" className="input" />
                  </Field>
                  <Field label="Passport Date of Issue*">
                    <input type="date" value={p.passportIssue} onChange={(e) => updatePassenger(idx, "passportIssue", e.target.value)} className="input" />
                  </Field>
                  <Field label="Passport Expiry Date*">
                    <input type="date" value={p.passportExpiry} onChange={(e) => updatePassenger(idx, "passportExpiry", e.target.value)} className="input" />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-noori-danger mt-4">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-black/5">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-black/10 rounded-lg py-2.5 text-sm font-medium text-noori-ink hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || overLimit}
              onClick={() => submit("Hold")}
              className="flex-1 border border-noori-primary text-noori-primary rounded-lg py-2.5 text-sm font-medium hover:bg-noori-primary-light disabled:opacity-60"
            >
              Hold
            </button>
            <button
              type="button"
              disabled={submitting || overLimit}
              onClick={() => submit("Pay Now")}
              className="flex-1 bg-noori-primary hover:bg-noori-primary-dark text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
              title={overLimit ? "This booking exceeds your remaining booking limit" : undefined}
            >
              {submitting ? "Submitting..." : "Submit for Payment Approval"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 h-fit sticky top-20">
        <h3 className="font-display font-semibold text-noori-ink mb-4">Fare Summary</h3>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-noori-muted">Flight Fare</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-noori-ink">Adult x {passengers.length}</span>
          <span className="text-noori-ink">{formatMoney(flight.price, flight.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-noori-ink pt-3 border-t border-black/5">
          <span>Total</span>
          <span>{formatMoney(total, flight.currency)}</span>
        </div>

        {remaining !== null && (
          <div className={`mt-4 pt-4 border-t border-black/5 text-xs ${overLimit ? "text-noori-danger" : "text-noori-muted"}`}>
            Your remaining booking limit: <strong>{formatMoney(remaining)}</strong>
            {overLimit && (
              <p className="mt-1">This booking exceeds your limit. Contact your admin to raise it.</p>
            )}
          </div>
        )}
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
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-noori-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

function FlightLegSummary({ title, flightNumber, airlineName, airlineCode, airlineLogo, depTime, depCode, depDate, arrTime, arrCode, arrDate, meal, baggage, refundable, cls }) {
  return (
    <div>
      <div className="text-sm font-medium text-noori-ink mb-3">{title}</div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:w-40 shrink-0">
          <AirlineLogo name={airlineName} code={airlineCode} logoUrl={airlineLogo} size={36} />
          <div className="text-xs text-noori-muted">{flightNumber}</div>
        </div>
        <div className="flex items-center gap-6 flex-1">
          <div>
            <div className="text-lg font-semibold text-noori-ink">{depTime}</div>
            <div className="text-xs text-noori-muted">{depCode} • {formatDate(depDate)}</div>
          </div>
          <div className="flex-1 h-px bg-noori-primary/20 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--noori-primary)" className="absolute right-0 -top-1.5">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5Z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-noori-ink">{arrTime}</div>
            <div className="text-xs text-noori-muted">{arrCode} • {formatDate(arrDate)}</div>
          </div>
        </div>
        <div className="text-xs text-noori-muted sm:w-40 shrink-0 space-y-0.5">
          <div>Class: {cls}</div>
          <div>Meal: {meal}</div>
          <div>Baggage: {baggage}</div>
          <div className={refundable ? "text-noori-success" : "text-noori-danger"}>
            {refundable ? "Refundable" : "Non Refundable"}
          </div>
        </div>
      </div>
    </div>
  );
}
