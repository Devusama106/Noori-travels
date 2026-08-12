import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const totalFlights = db.prepare("SELECT COUNT(*) c FROM flights").get().c;
  const totalBookings = db.prepare("SELECT COUNT(*) c FROM bookings").get().c;
  const ticketed = db.prepare("SELECT COUNT(*) c FROM bookings WHERE status = 'Ticketed'").get().c;
  const pendingApproval = db
    .prepare("SELECT COUNT(*) c FROM bookings WHERE paymentStatus = 'Awaiting Approval'")
    .get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(totalFare),0) s FROM bookings WHERE status != 'Cancelled'").get().s;
  const pendingDeposits = db.prepare("SELECT COUNT(*) c FROM deposits WHERE status = 'Pending'").get().c;
  const pendingRegistrations = db.prepare("SELECT COUNT(*) c FROM users WHERE status = 'PENDING'").get().c;

  const recentBookings = db
    .prepare(
      `SELECT b.*, f.originCode, f.destinationCode, f.departDate, u.name as agentName
       FROM bookings b JOIN flights f ON f.id = b.flightId JOIN users u ON u.id = b.userId
       ORDER BY b.createdAt DESC LIMIT 8`
    )
    .all();

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display text-2xl font-semibold text-noori-ink">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/users/new"
              className="border border-noori-primary text-noori-primary text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-noori-primary-light"
            >
              + Add User
            </Link>
            <Link
              href="/admin/flights/new"
              className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2.5"
            >
              + Add Flight / Package
            </Link>
          </div>
        </div>

        {pendingRegistrations > 0 && (
          <Link
            href="/admin/users"
            className="block bg-noori-gold-light border border-noori-gold/40 text-noori-gold rounded-xl px-4 py-3 text-sm font-medium mb-3 hover:bg-noori-gold-light/70"
          >
            {pendingRegistrations} new registration{pendingRegistrations > 1 ? "s" : ""} awaiting approval — review now →
          </Link>
        )}
        {pendingApproval > 0 && (
          <Link
            href="/admin/bookings"
            className="block bg-noori-warning/10 border border-noori-warning/30 text-noori-warning rounded-xl px-4 py-3 text-sm font-medium mb-3 hover:bg-noori-warning/15"
          >
            {pendingApproval} booking{pendingApproval > 1 ? "s" : ""} awaiting payment approval — review now →
          </Link>
        )}
        {pendingDeposits > 0 && (
          <Link
            href="/admin/deposits"
            className="block bg-noori-info/10 border border-noori-info/30 text-noori-info rounded-xl px-4 py-3 text-sm font-medium mb-6 hover:bg-noori-info/15"
          >
            {pendingDeposits} deposit{pendingDeposits > 1 ? "s" : ""} awaiting approval — review now →
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 mb-8">
          <StatCard label="Listed Flights" value={totalFlights} />
          <StatCard label="Total Bookings" value={totalBookings} />
          <StatCard label="Awaiting Approval" value={pendingApproval} />
          <StatCard label="Ticketed" value={ticketed} />
          <StatCard label="Revenue" value={formatMoney(revenue)} />
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-noori-ink">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-noori-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-noori-muted border-b border-black/5">
                  <th className="py-2 pr-4 font-medium">Booking Ref</th>
                  <th className="py-2 pr-4 font-medium">Agent</th>
                  <th className="py-2 pr-4 font-medium">Trip</th>
                  <th className="py-2 pr-4 font-medium">Travel Date</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-black/5 last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/booking/confirmation/${b.id}`} className="text-noori-primary hover:underline">
                        {b.bookingRef}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{b.agentName}</td>
                    <td className="py-3 pr-4">{b.originCode} to {b.destinationCode}</td>
                    <td className="py-3 pr-4">{formatDate(b.departDate)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
      <div className="text-sm text-noori-muted mb-1">{label}</div>
      <div className="font-display text-2xl font-bold text-noori-ink">{value}</div>
    </div>
  );
}
