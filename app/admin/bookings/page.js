import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";
import AdminBookingsTable from "@/components/AdminBookingsTable";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const bookings = db
    .prepare(
      `SELECT b.*, f.originCode, f.destinationCode, f.departDate, u.name as agentName, u.email as agentEmail
       FROM bookings b JOIN flights f ON f.id = b.flightId JOIN users u ON u.id = b.userId
       ORDER BY b.createdAt DESC`
    )
    .all();

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-noori-ink mb-6">All Bookings</h1>
        <AdminBookingsTable bookings={bookings} />
      </main>
    </div>
  );
}
