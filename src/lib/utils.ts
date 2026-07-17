import { format, isToday, isSameWeek, isSameMonth } from "date-fns";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function isDateToday(date: string | Date): boolean {
  return isToday(new Date(date));
}

export function isDateThisWeek(date: string | Date): boolean {
  return isSameWeek(new Date(date), new Date(), { weekStartsOn: 1 });
}

export function isDateThisMonth(date: string | Date): boolean {
  return isSameMonth(new Date(date), new Date());
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  COMPLETED: "bg-clinical-500/10 text-clinical-700 border border-clinical-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
  APPROVED: "bg-clinical-500/10 text-clinical-700 border border-clinical-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
};
