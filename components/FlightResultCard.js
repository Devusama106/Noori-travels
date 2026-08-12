import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import AirlineLogo from "./AirlineLogo";
import LiveFlightSelectButton from "./LiveFlightSelectButton";
import AddToCartButton from "./AddToCartButton";

function Leg({ label, dep, depTime, depCity, depCode, arr, arrTime, arrCity, arrCode, duration, stops }) {
  return (
    <div>
      {label && <div className="text-xs font-medium text-noori-muted mb-1.5">{label}</div>}
      <div className="flex items-center gap-4">
        <div className="text-right min-w-[54px]">
          <div className="text-lg font-semibold text-noori-ink">{depTime}</div>
          <div className="text-xs text-noori-muted">{depCity} ({depCode})</div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="text-[11px] text-noori-muted mb-1">
            {stops === 0 ? "NonStop" : `${stops} Stop`} ({duration})
          </div>
          <div className="w-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-noori-primary" />
            <span className="flex-1 h-px bg-noori-primary/30" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--noori-primary)">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5Z" />
            </svg>
          </div>
        </div>
        <div className="min-w-[54px]">
          <div className="text-lg font-semibold text-noori-ink">{arrTime}</div>
          <div className="text-xs text-noori-muted">{arrCity} ({arrCode})</div>
        </div>
      </div>
    </div>
  );
}

export default function FlightResultCard({ flight, isLive = false }) {
  const isRoundTrip = !!flight.returnDepartDate;
  const isPackage = flight.packageType === "Umrah Package";

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-5 relative">
      {isLive && (
        <span className="absolute -top-2 left-4 bg-noori-info text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </span>
      )}
      <div className="flex items-center gap-3 md:w-44 shrink-0">
        <AirlineLogo name={flight.airlineName} code={flight.airlineCode} logoUrl={flight.airlineLogo} size={40} />
        <div>
          <div className="text-sm font-medium text-noori-ink leading-tight">{flight.airlineName}</div>
          <div className="text-xs text-noori-muted">{flight.flightNumber}</div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <Leg
          depTime={flight.departTime}
          depCity={flight.originCity}
          depCode={flight.originCode}
          arrTime={flight.arriveTime}
          arrCity={flight.destinationCity}
          arrCode={flight.destinationCode}
          duration={flight.duration}
          stops={flight.stops}
        />
        {isRoundTrip && (
          <>
            <div className="border-t border-dashed border-black/10" />
            <Leg
              depTime={flight.returnDepartTime}
              depCity={flight.returnOriginCity}
              depCode={flight.returnOriginCode}
              arrTime={flight.returnArriveTime}
              arrCity={flight.returnDestinationCity}
              arrCode={flight.returnDestinationCode}
              duration={flight.returnDuration}
              stops={0}
            />
          </>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] px-2 py-0.5 rounded bg-noori-primary-light text-noori-primary-dark">
            {flight.baggage}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-noori-gold-light text-noori-gold">
            {flight.meal}
          </span>
          {!flight.refundable && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-noori-danger/10 text-noori-danger">
              Non Refundable
            </span>
          )}
        </div>
      </div>

      <div className="md:w-44 shrink-0 text-right">
        <div className="text-lg font-bold text-noori-ink">{formatMoney(flight.price, flight.currency)}</div>
        <div className="text-xs text-noori-muted mb-3">{isPackage ? "Umrah Package" : "Per Passenger"}</div>
        {isLive ? (
          <LiveFlightSelectButton offer={flight} />
        ) : (
          <Link
            href={`/booking/review?flightId=${flight.id}`}
            className="text-center inline-block w-full bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Select
          </Link>
        )}
        <div className="mt-2">
          {isLive ? <AddToCartButton offer={flight} /> : <AddToCartButton flightId={flight.id} />}
        </div>
      </div>
    </div>
  );
}
