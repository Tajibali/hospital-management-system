import Link from "next/link";

export default function DoctorLandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F8F7] px-6 py-16">
      <div className="w-full max-w-3xl rounded-card border border-clinical-100 bg-white p-8 shadow-card">
        <div className="text-center mb-8">
          <span className="inline-block text-xs tracking-[0.2em] uppercase text-clinical-600 font-medium mb-3">
            Doctor Portal
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
            Doctor Login & Signup
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Only doctors can use this section. Sign in to manage appointments, complete visits, and request leave.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/doctor/login"
            className="rounded-lg border border-clinical-200 bg-clinical-700 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-clinical-800"
          >
            Log in
          </Link>
          <Link
            href="/doctor/signup"
            className="rounded-lg border border-clinical-300 px-4 py-3 text-center text-sm font-medium text-clinical-700 transition-colors hover:bg-clinical-50"
          >
            Sign up
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-clinical-700">
            Back to main portal
          </Link>
        </div>
      </div>
    </main>
  );
}
