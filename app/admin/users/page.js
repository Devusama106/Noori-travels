import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import db, { getUsedLimit } from "@/lib/db";
import Header from "@/components/Header";
import AdminUsersTable from "@/components/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = db
    .prepare("SELECT * FROM users ORDER BY (status = 'PENDING') DESC, createdAt DESC")
    .all()
    .map((u) => ({ ...u, usedLimit: u.role === "USER" ? getUsedLimit(u.id) : 0 }));

  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-noori-ink">Users &amp; Access</h1>
          <Link
            href="/admin/users/new"
            className="bg-noori-primary hover:bg-noori-primary-dark text-white text-sm font-medium rounded-lg px-4 py-2.5"
          >
            + Add User
          </Link>
        </div>

        {pendingCount > 0 && (
          <div className="bg-noori-warning/10 border border-noori-warning/30 text-noori-warning rounded-xl px-4 py-3 text-sm font-medium mb-6">
            {pendingCount} registration request{pendingCount > 1 ? "s" : ""} awaiting approval — review below.
          </div>
        )}

        <AdminUsersTable users={users} currentUserId={session.user.id} />
      </main>
    </div>
  );
}
