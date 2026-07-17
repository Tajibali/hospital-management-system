import { ReactNode } from "react";
import { classNames } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  icon,
  accent = "clinical",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "clinical" | "amber" | "rose";
}) {
  const accentStyles = {
    clinical: "bg-clinical-50 text-clinical-700",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="bg-white rounded-card shadow-card border border-clinical-100 p-5 flex items-center gap-4">
      <div className={classNames("h-11 w-11 rounded-lg flex items-center justify-center shrink-0", accentStyles[accent])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display text-ink leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}
