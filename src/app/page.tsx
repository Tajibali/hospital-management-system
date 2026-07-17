import Link from "next/link";

const portals = [
  {
    role: "Admin",
    description: "Manage doctors, staff, patients, appointments, leave and analytics.",
    href: "/admin/login",
    signupHref: null,
  },
  {
    role: "Doctor",
    description: "View your appointments, mark them complete, and request leave.",
    href: "/doctor",
    signupHref: "/doctor",
  },
  {
    role: "Staff",
    description: "Check today's schedule, doctor availability, and your leave status.",
    href: "/staff",
    signupHref: "/staff",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[#F6F8F7]">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-4">
          <span className="inline-block text-xs tracking-[0.2em] uppercase text-clinical-600 font-medium mb-3">
            Hospital Operations Platform
          </span>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">
            OPD Mirpur Mathelo
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            One system, three portals. Doctors and staff can request an account below — admin
            accounts are created directly by the hospital administrator.
          </p>
        </div>

        {/* ECG signature line */}
        <svg
          viewBox="0 0 400 40"
          className="w-full max-w-md mx-auto h-10 mb-12 text-clinical-400"
          fill="none"
        >
          <path
            d="M0 20 H140 L155 20 L165 4 L178 36 L190 20 L205 20 L215 12 L222 28 L230 20 H400"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <div
              key={portal.role}
              className="bg-white rounded-card shadow-card border border-clinical-100 p-7 flex flex-col"
            >
              <h2 className="font-display text-2xl text-ink mb-2">{portal.role} Portal</h2>
              <p className="text-sm text-slate-500 mb-6 flex-1">{portal.description}</p>
              <div className="flex gap-2">
                <Link
                  href={portal.href}
                  className="flex-1 text-center bg-clinical-700 hover:bg-clinical-800 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
                >
                  Log in
                </Link>
                {portal.signupHref && (
                  <Link
                    href={portal.signupHref}
                    className="flex-1 text-center border border-clinical-300 hover:bg-clinical-50 text-clinical-700 text-sm font-medium py-2.5 rounded-md transition-colors"
                  >
                    Sign up
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
