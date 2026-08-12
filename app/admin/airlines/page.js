import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";
import AddAirlineForm from "@/components/AddAirlineForm";
import AirlineLogo from "@/components/AirlineLogo";
import DeleteAirlineButton from "@/components/DeleteAirlineButton";

export default async function AdminAirlinesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const airlines = db.prepare("SELECT * FROM airlines ORDER BY name ASC").all();

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-noori-ink mb-1">Airline Logos</h1>
          <p className="text-sm text-noori-muted">
            Set a logo per airline once — it will automatically show up on every flight, search result,
            and booking that uses that airline name.
          </p>
        </div>

        <AddAirlineForm existing={airlines} />

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-noori-muted bg-noori-sand">
                  <th className="py-3 px-4 font-medium">Logo</th>
                  <th className="py-3 px-4 font-medium">Airline</th>
                  <th className="py-3 px-4 font-medium">Code</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {airlines.map((a) => (
                  <tr key={a.id} className="border-t border-black/5">
                    <td className="py-3 px-4">
                      <AirlineLogo name={a.name} code={a.code} logoUrl={a.logoUrl} size={36} />
                    </td>
                    <td className="py-3 px-4 font-medium text-noori-ink">{a.name}</td>
                    <td className="py-3 px-4 text-noori-muted">{a.code || "—"}</td>
                    <td className="py-3 px-4">
                      <DeleteAirlineButton id={a.id} />
                    </td>
                  </tr>
                ))}
                {airlines.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-noori-muted">
                      No airlines yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
