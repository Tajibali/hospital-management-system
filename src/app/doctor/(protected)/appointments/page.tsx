"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { AppointmentRecord } from "@/types";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAppointments() {
    const res = await fetch("/api/appointments");
    const data = await res.json();
    setAppointments(data.appointments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function updateStatus(id: string, status: "COMPLETED" | "CANCELLED") {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update appointment");
      return;
    }
    toast.success(`Appointment marked ${status.toLowerCase()}`);
    loadAppointments();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">My appointments</h1>
        <p className="text-slate-500 text-sm">All appointments booked with you, past and upcoming.</p>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : appointments.length === 0 ? (
          <EmptyState message="No appointments booked with you yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Date &amp; time</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {appt.patient.name}
                    <div className="text-xs text-slate-400 font-normal">{appt.patient.phone}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(appt.date)} &middot; {appt.time}
                  </td>
                  <td className="py-3 text-slate-500">{appt.reason ?? "—"}</td>
                  <td className="py-3">
                    <Badge status={appt.status} />
                  </td>
                  <td className="py-3">
                    {appt.status === "PENDING" && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => updateStatus(appt.id, "COMPLETED")}
                          className="text-xs text-clinical-700 hover:underline"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, "CANCELLED")}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
