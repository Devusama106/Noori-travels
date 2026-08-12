"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AirlineLogo from "./AirlineLogo";
import { formatMoney, formatDate } from "@/lib/utils";
import { notifyCartUpdated } from "./CartIcon";

export default function CartItemCard({ item }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const isRoundTrip = !!item.returnDepartDate;
  const isPackage = item.packageType === "Umrah Package";

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/cart/${item.cartItemId}`, { method: "DELETE" });
    notifyCartUpdated();
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-5">
      <div className="flex items-center gap-3 md:w-48 shrink-0">
        <AirlineLogo name={item.airlineName} code={item.airlineCode} logoUrl={item.airlineLogo} size={40} />
        <div>
          <div className="text-sm font-medium text-noori-ink leading-tight">{item.airlineName}</div>
          <div className="text-xs text-noori-muted">{item.flightNumber}</div>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <div className="text-sm text-noori-ink">
          <span className="font-semibold">{item.originCode}</span> → <span className="font-semibold">{item.destinationCode}</span>
          <span className="text-noori-muted"> · {formatDate(item.departDate)} · {item.departTime} → {item.arriveTime}</span>
        </div>
        {isRoundTrip && (
          <div className="text-sm text-noori-ink">
            <span className="font-semibold">{item.returnOriginCode}</span> → <span className="font-semibold">{item.returnDestinationCode}</span>
            <span className="text-noori-muted"> · {formatDate(item.returnDepartDate)} · {item.returnDepartTime} → {item.returnArriveTime}</span>
          </div>
        )}
        <div className="text-xs text-noori-muted">{isPackage ? "Umrah Package" : "Flight"} · {item.class}</div>
      </div>

      <div className="md:w-44 shrink-0 text-right space-y-2">
        <div className="text-lg font-bold text-noori-ink">{formatMoney(item.price, item.currency)}</div>
        <Link
          href={`/booking/review?flightId=${item.id}`}
          className="text-center block w-full bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Book This Flight
        </Link>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="block w-full text-sm font-medium text-noori-danger border border-noori-danger/30 rounded-lg px-4 py-2 hover:bg-noori-danger/5 disabled:opacity-60"
        >
          {removing ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
