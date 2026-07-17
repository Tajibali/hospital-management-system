import AuthShell from "@/components/ui/AuthShell";
import SignupForm from "@/components/shared/SignupForm";

export default function StaffSignupPage() {
  return (
    <AuthShell
      title="Create Staff Account"
      subtitle="Add your details to join the hospital's front-line team."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkHref="/staff/login"
    >
      <SignupForm role="STAFF" pendingPath="/staff/pending" />
    </AuthShell>
  );
}
