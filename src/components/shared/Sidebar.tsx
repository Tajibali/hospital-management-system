"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { classNames } from "@/lib/utils";
import { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export default function Sidebar({
  portalLabel,
  userName,
  items,
}: {
  portalLabel: string;
  userName: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#0F2620] text-clinical-50 flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-xs tracking-[0.2em] uppercase text-clinical-300 font-medium">
          OPD Mirpur Mathelo
        </span>
        <h2 className="font-display text-xl text-white mt-1">{portalLabel}</h2>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-clinical-700 text-white font-medium"
                  : "text-clinical-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-clinical-100/60 mb-2 truncate">Signed in as {userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left text-sm text-clinical-100/80 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
