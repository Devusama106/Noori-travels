import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Header from "@/components/Header";
import AddFlightForm from "@/components/AddFlightForm";

export default async function NewFlightPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-noori-ink mb-1">Add Flight / Umrah Package</h1>
        <p className="text-sm text-noori-muted mb-6">
          This listing and all its details (route, times, price, filters) will appear instantly on the user search page.
        </p>
        <AddFlightForm />
      </main>
    </div>
  );
}
