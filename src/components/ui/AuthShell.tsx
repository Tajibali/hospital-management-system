import Link from "next/link";
import { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F8F7] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-xs tracking-[0.2em] uppercase text-clinical-600 font-medium">
            OPD Mirpur Mathelo
          </Link>
          <h1 className="font-display text-3xl text-ink mt-2">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-7">
          {children}
        </div>
        {footerText && footerLinkText && footerLinkHref && (
          <p className="text-center text-sm text-slate-500 mt-5">
            {footerText}{" "}
            <Link href={footerLinkHref} className="text-clinical-700 font-medium hover:underline">
              {footerLinkText}
            </Link>
          </p>
        )}
        <p className="text-center text-xs text-slate-400 mt-3">
          <Link href="/" className="hover:underline">
            &larr; Back to portal selection
          </Link>
        </p>
      </div>
    </main>
  );
}
