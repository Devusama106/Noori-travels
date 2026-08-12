import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";
import AdminFlightsTable from "@/components/AdminFlightsTable";
import { isAmadeusConfigured } from "@/lib/amadeus";

export default async function AdminFlightsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const flights = db
    .prepare(
      `SELECT f.*, a.logoUrl as airlineLogo FROM flights f
       LEFT JOIN airlines a ON a.name = f.airlineName
       ORDER BY f.departDate ASC`
    )
    .all();

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-noori-ink">Manage Flights &amp; Packages</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/airlines"
              className="border border-noori-primary text-noori-primary text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-noori-primary-light"
            >
              Airline Logos
            </Link>
            <Link
              href="/admin/flights/new"
              className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2.5"
            >
              + Add Flight / Package
            </Link>
          </div>
        </div>

        {isAmadeusConfigured() ? (
          <div className="bg-noori-success/10 border border-noori-success/20 text-noori-success text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-noori-success" />
            Live flight search is <strong>on</strong> — agents also see real-time results from real
            airlines (via Amadeus) alongside your listings when they search.
          </div>
        ) : (
          <div className="bg-noori-sand border border-black/5 text-sm rounded-xl px-4 py-3 mb-6 text-noori-muted">
            <strong className="text-noori-ink">Live flight search is off.</strong> Agents currently only
            see the flights you add manually here. To also show real-time results from real airlines
            (PIA, Emirates, etc.), get a free key at{" "}
            <a href="https://developers.amadeus.com" target="_blank" rel="noreferrer" className="text-noori-primary hover:underline">
              developers.amadeus.com
            </a>{" "}
            and add it to <code className="bg-black/5 px-1 rounded">.env.local</code> as{" "}
            <code className="bg-black/5 px-1 rounded">AMADEUS_CLIENT_ID</code> /{" "}
            <code className="bg-black/5 px-1 rounded">AMADEUS_CLIENT_SECRET</code>, then restart the app.
            See the README for details.
          </div>
        )}

        <AdminFlightsTable flights={flights} />
      </main>
    </div>
  );
}
