"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, XCircle, Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, isDateToday } from "@/lib/utils";
import { AppointmentRecord, DoctorWithUser, LeaveRecord } from "@/types";

export default function StaffDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [doctorLeaves, setDoctorLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [aRes, dRes, lRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/doctors"),
        fetch("/api/leave?view=doctors"),
      ]);
      const [aData, dData, lData] = await Promise.all([aRes.json(), dRes.json(), lRes.json()]);
      setAppointments(aData.appointments ?? []);
      setDoctors(dData.doctors ?? []);
      setDoctorLeaves((lData.leaves ?? []).filter((l: LeaveRecord) => l.status === "APPROVED"));
      setLoading(false);
    }
    load();
  }, []);

  const todaysAppointments = appointments.filter((a) => isDateToday(a.date));
  const completedToday = todaysAppointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledToday = todaysAppointments.filter((a) => a.status === "CANCELLED").length;

  // Build an hourly distribution of today's appointments for the "today only" chart
  const hourlyMap = new Map<string, number>();
  todaysAppointments.forEach((a) => {
    const hour = a.time.split(":")[0]?.padStart(2, "0") ?? "00";
    const label = `${hour}:00`;
    hourlyMap.set(label, (hourlyMap.get(label) ?? 0) + 1);
  });
  const hourlyData = Array.from(hourlyMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Today's overview</h1>
        <p className="text-slate-500 text-sm">{formatDate(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's appointments" value={todaysAppointments.length} icon={<CalendarClock size={20} />} />
        <StatCard label="Completed today" value={completedToday} icon={<CheckCircle2 size={20} />} accent="clinical" />
        <StatCard label="Cancelled today" value={cancelledToday} icon={<XCircle size={20} />} accent="rose" />
        <StatCard label="Total doctors" value={doctors.length} icon={<Stethoscope size={20} />} />
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Today's appointments by hour</h3>
        {hourlyData.length === 0 ? (
          <EmptyState message="No appointments scheduled for today." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#EFF9F7" }} contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
              <Bar dataKey="count" fill="#2C8F7C" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Doctors currently on leave</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : doctorLeaves.length === 0 ? (
          <EmptyState message="No doctors are on leave right now." />
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
              {doctorLeaves.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-2.5 font-medium text-ink">{l.doctor?.user.name}</td>
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
