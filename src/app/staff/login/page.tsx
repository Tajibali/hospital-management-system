import AuthShell from "@/components/ui/AuthShell";
import LoginForm from "@/components/shared/LoginForm";

export default function StaffLoginPage() {
  return (
    <AuthShell
      title="Staff Login"
      subtitle="Sign in to view today's schedule and your leave status."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/staff/signup"
    >
      <LoginForm providerId="staff-login" redirectPath="/staff/dashboard" />
    </AuthShell>
  );
}
