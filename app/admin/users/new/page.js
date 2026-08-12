import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Header from "@/components/Header";
import AddUserForm from "@/components/AddUserForm";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-noori-sand">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-noori-ink mb-1">Add User</h1>
        <p className="text-sm text-noori-muted mb-6">
          Create a login for a travel agent (User) or another Admin. Users can only book up to their
          assigned limit.
        </p>
        <AddUserForm />
      </main>
    </div>
  );
}
