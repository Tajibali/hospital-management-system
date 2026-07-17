import Link from "next/link";
import { Clock } from "lucide-react";

export default function DoctorPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F8F7] px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Clock size={26} />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">Request sent</h1>
        <p className="text-slate-500 text-sm mb-8">
          Your doctor account request has been sent to the hospital admin. Once approved, you'll
          be able to log in with the email and password you just set.
        </p>
        <Link
          href="/doctor/login"
          className="inline-block bg-clinical-700 hover:bg-clinical-800 text-white text-sm font-medium py-2.5 px-6 rounded-md transition-colors"
        >
          Go to login
        </Link>
        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href="/" className="hover:underline">
            &larr; Back to portal selection
          </Link>
        </p>
      </div>
    </main>
  );
}
