import AuthShell from "@/components/ui/AuthShell";
import LoginForm from "@/components/shared/LoginForm";

export default function DoctorLoginPage() {
  return (
    <AuthShell
      title="Doctor Login"
      subtitle="Sign in to view and manage your appointments."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/doctor/signup"
    >
      <LoginForm providerId="doctor-login" redirectPath="/doctor/dashboard" />
    </AuthShell>
  );
}
