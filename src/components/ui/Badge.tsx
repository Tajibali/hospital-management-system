import { STATUS_STYLES } from "@/lib/utils";

export default function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border border-slate-200"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
