import AuthShell from "@/components/ui/AuthShell";
import LoginForm from "@/components/shared/LoginForm";

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin Login"
      subtitle="Sign in to manage the entire hospital operation."
    >
      <LoginForm providerId="admin-login" redirectPath="/admin/dashboard" />
    </AuthShell>
  );
}
