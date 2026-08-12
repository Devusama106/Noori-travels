import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";
import DepositsTable from "@/components/DepositsTable";
import { formatMoney } from "@/lib/utils";

export default async function AdminDepositsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const userIdFilter = sp?.userId || "";

  let query = `
    SELECT d.*, b.bankName as beneficiaryBankName, b.accountNumber as beneficiaryAccountNumber,
           u.name as userName, u.email as userEmail
    FROM deposits d
    LEFT JOIN beneficiary_accounts b ON b.id = d.beneficiaryAccountId
    JOIN users u ON u.id = d.userId
    WHERE 1=1`;
  const params = [];
  if (userIdFilter) {
    query += " AND d.userId = ?";
    params.push(userIdFilter);
  }
  query += " ORDER BY d.createdAt DESC";

  const deposits = db.prepare(query).all(...params);
  const users = db.prepare("SELECT id, name, email FROM users WHERE role = 'USER' ORDER BY name ASC").all();

  const pendingTotal = db
    .prepare("SELECT COALESCE(SUM(amount),0) s FROM deposits WHERE status = 'Pending'")
    .get().s;
  const approvedTotal = db
    .prepare("SELECT COALESCE(SUM(amount),0) s FROM deposits WHERE status = 'Approved'")
    .get().s;

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <h1 className="font-display text-2xl font-semibold text-noori-ink">Deposits</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
            <div className="text-sm text-noori-muted mb-1">Awaiting Approval</div>
            <div className="font-display text-2xl font-bold text-noori-warning">{formatMoney(pendingTotal)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
            <div className="text-sm text-noori-muted mb-1">Total Approved</div>
            <div className="font-display text-2xl font-bold text-noori-success">{formatMoney(approvedTotal)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
            <label className="block text-sm text-noori-muted mb-1">View Ledger For</label>
            <form method="GET" className="flex gap-2">
              <select
                name="userId"
                defaultValue={userIdFilter}
                className="flex-1 border border-black/10 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="text-sm bg-noori-primary text-white rounded-lg px-3 py-2 hover:bg-noori-primary-dark"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <DepositsTable deposits={deposits} mode="admin" />
      </main>
    </div>
  );
}
