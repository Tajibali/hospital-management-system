"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, Clock, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, isDateToday } from "@/lib/utils";
import { AppointmentRecord, LeaveRecord } from "@/types";

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [staffLeaves, setStaffLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [aRes, lRes] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/leave?view=staff"),
    ]);
    const aData = await aRes.json();
    const lData = await lRes.json();
    setAppointments(aData.appointments ?? []);
    setStaffLeaves((lData.leaves ?? []).filter((l: LeaveRecord) => l.status === "APPROVED"));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
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
    loadData();
  }

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === "PENDING").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const todaysAppointments = appointments.filter((a) => isDateToday(a.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">My dashboard</h1>
        <p className="text-slate-500 text-sm">Today's schedule and your appointment activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total appointments" value={total} icon={<CalendarClock size={20} />} />
        <StatCard label="Pending" value={pending} icon={<Clock size={20} />} accent="amber" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={20} />} accent="clinical" />
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Today's appointments</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : todaysAppointments.length === 0 ? (
          <EmptyState message="No appointments scheduled for today." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments.map((appt) => (
                <tr key={appt.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {appt.patient.name}
                    <div className="text-xs text-slate-400 font-normal">{appt.patient.phone}</div>
                  </td>
                  <td className="py-3 text-slate-500">{appt.time}</td>
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

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Staff currently on leave</h3>
        {staffLeaves.length === 0 ? (
          <EmptyState message="No staff members are on leave right now." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {staffLeaves.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-2.5 font-medium text-ink">{l.staff?.user.name}</td>
                  <td className="py-2.5 text-slate-500">{formatDate(l.date)}</td>
                  <td className="py-2.5 text-slate-500">{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
