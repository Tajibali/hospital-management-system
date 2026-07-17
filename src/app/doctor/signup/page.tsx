import AuthShell from "@/components/ui/AuthShell";
import SignupForm from "@/components/shared/SignupForm";

export default function DoctorSignupPage() {
  return (
    <AuthShell
      title="Create Doctor Account"
      subtitle="Add your specialization and weekly availability."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkHref="/doctor/login"
    >
      <SignupForm role="DOCTOR" pendingPath="/doctor/pending" />
    </AuthShell>
  );
}
