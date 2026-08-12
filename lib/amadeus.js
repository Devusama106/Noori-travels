// Live flight search via the Amadeus Self-Service "Flight Offers Search" API.
// Docs: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
//
// Requires a free Amadeus for Developers account (test environment). Add these to .env.local:
//   AMADEUS_CLIENT_ID=...
//   AMADEUS_CLIENT_SECRET=...
//   AMADEUS_BASE_URL=https://test.api.amadeus.com   (switch to the production host once you have
//                                                      a production key from Amadeus)
//
// IMPORTANT: the test environment returns real schedule/price shapes but a limited, cached dataset —
// it is for development only, not for selling real tickets. Actually ticketing a passenger still
// requires Amadeus production access + a signed agreement with an airline consolidator (see their
// Flight Create Orders API docs). This integration is for *live search* only: once an agent picks a
// live result here, it's imported into our own `flights` table and goes through the normal
// Hold / Submit-for-Approval / admin-approves booking flow — your team still tickets it for real
// through your own GDS/consolidator, exactly like a manually-entered flight.

const BASE_URL = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

let cachedToken = null;
let cachedTokenExpiry = 0;

export function isAmadeusConfigured() {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Amadeus auth failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a little early so we never use a token in its last few seconds of life
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// Parses an ISO-8601 duration like "PT3H25M" into "3h 25m"
function humanDuration(iso) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] || "0";
  const min = m[2] || "0";
  return `${h}h ${min}m`;
}

function splitDateTime(isoDateTime) {
  // e.g. "2026-09-20T06:40:00" -> { date: "2026-09-20", time: "06:40" }
  const [date, timePart] = (isoDateTime || "").split("T");
  const time = (timePart || "").slice(0, 5);
  return { date, time };
}

const CABIN_LABELS = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

// Normalizes a single Amadeus flight-offer into the same shape as a row in our `flights` table,
// so it can be inserted directly and reused by all the existing booking/search UI.
function normalizeOffer(offer, dictionaries) {
  const itineraries = offer.itineraries || [];
  const out = itineraries.map((itin) => {
    const segments = itin.segments || [];
    const first = segments[0];
    const last = segments[segments.length - 1];
    const dep = splitDateTime(first?.departure?.at);
    const arr = splitDateTime(last?.arrival?.at);
    const carrierCode = first?.carrierNumber ? first.carrierNumber : first?.carrierCode;
    const airlineName = dictionaries?.carriers?.[first?.carrierCode] || first?.carrierCode || "Unknown Airline";
    return {
      airlineCode: first?.carrierCode || "",
      airlineName,
      flightNumber: `${first?.carrierCode || ""}-${first?.number || ""}`,
      originCity: first?.departure?.iataCode || "",
      originCode: first?.departure?.iataCode || "",
      destinationCity: last?.arrival?.iataCode || "",
      destinationCode: last?.arrival?.iataCode || "",
      departDate: dep.date,
      departTime: dep.time,
      arriveDate: arr.date,
      arriveTime: arr.time,
      duration: humanDuration(itin.duration),
      stops: Math.max(segments.length - 1, 0),
    };
  });

  const outbound = out[0] || {};
  const inbound = out[1] || null;

  const travelerPricing = offer.travelerPricings?.[0];
  const cabin = travelerPricing?.fareDetailsBySegment?.[0]?.cabin;
  const bags = travelerPricing?.fareDetailsBySegment?.[0]?.includedCheckedBags;
  const baggage = bags?.weight ? `${bags.weight}${bags.weightUnit || "KG"}` : bags?.quantity ? `${bags.quantity} bag(s)` : "See fare rules";

  return {
    externalOfferId: offer.id,
    source: "AMADEUS",
    airlineName: outbound.airlineName,
    airlineCode: outbound.airlineCode,
    flightNumber: outbound.flightNumber,
    packageType: "Flight",
    originCity: outbound.originCity,
    originCode: outbound.originCode,
    destinationCity: outbound.destinationCity,
    destinationCode: outbound.destinationCode,
    departDate: outbound.departDate,
    departTime: outbound.departTime,
    arriveDate: outbound.arriveDate,
    arriveTime: outbound.arriveTime,
    duration: outbound.duration,
    stops: outbound.stops,
    returnDepartDate: inbound?.departDate || null,
    returnDepartTime: inbound?.departTime || null,
    returnArriveDate: inbound?.arriveDate || null,
    returnArriveTime: inbound?.arriveTime || null,
    returnDuration: inbound?.duration || null,
    returnOriginCity: inbound?.originCity || null,
    returnOriginCode: inbound?.originCode || null,
    returnDestinationCity: inbound?.destinationCity || null,
    returnDestinationCode: inbound?.destinationCode || null,
    class: CABIN_LABELS[cabin] || "Economy",
    meal: "See fare rules",
    baggage,
    refundable: 0,
    price: Math.round(Number(offer.price?.total || 0)),
    currency: offer.price?.currency || "PKR",
    supplier: "Amadeus (Live)",
    seatsAvailable: offer.numberOfBookableSeats || 9,
  };
}

/**
 * Live flight search. Returns [] (never throws) if Amadeus isn't configured or the call fails,
 * so the rest of the search page keeps working off our own database either way.
 */
export async function searchLiveFlights({ originCode, destinationCode, departDate, returnDate, adults = 1 }) {
  if (!isAmadeusConfigured() || !originCode || !destinationCode || !departDate) return [];

  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      originLocationCode: originCode.toUpperCase(),
      destinationLocationCode: destinationCode.toUpperCase(),
      departureDate: departDate,
      adults: String(adults),
      max: "10",
      currencyCode: "PKR",
    });
    if (returnDate) params.set("returnDate", returnDate);

    const res = await fetch(`${BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Amadeus flight search failed:", res.status, await res.text().catch(() => ""));
      return [];
    }

    const json = await res.json();
    const offers = json.data || [];
    return offers.map((o) => normalizeOffer(o, json.dictionaries));
  } catch (err) {
    console.error("Amadeus live search error:", err.message);
    return [];
  }
}
