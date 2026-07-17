"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { AppointmentRecord } from "@/types";

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "CANCELLED">("ALL");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Appointment schedule</h1>
          <p className="text-slate-500 text-sm">All appointments across every doctor.</p>
        </div>
        <div className="flex gap-2">
          {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? "bg-clinical-700 text-white border-clinical-700"
                  : "border-slate-200 text-slate-600 hover:border-clinical-300"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState message="No appointments found for this filter." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Date &amp; time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr key={appt.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {appt.patient.name}
                    <div className="text-xs text-slate-400 font-normal">{appt.patient.phone}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    Dr. {appt.doctor.user.name}
                    <div className="text-xs text-slate-400">{appt.doctor.specialization}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(appt.date)} &middot; {appt.time}
                  </td>
                  <td className="py-3">
                    <Badge status={appt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
