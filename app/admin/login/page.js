import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <LoginForm
      role="ADMIN"
      redirectTo="/admin/dashboard"
      heading="Admin Sign In"
      demoEmail="admin@noori.travel"
      demoPassword="Admin@123"
    />
  );
}
