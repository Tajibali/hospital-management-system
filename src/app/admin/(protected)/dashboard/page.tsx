"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  UserCog,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { LeaveRecord } from "@/types";

interface Analytics {
  totalAppointments: number;
  completedToday: number;
  cancelledToday: number;
  pendingTotal: number;
  totalDoctors: number;
  totalStaff: number;
  weekly: { day: string; count: number }[];
  monthly: { month: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [doctorLeaves, setDoctorLeaves] = useState<LeaveRecord[]>([]);
  const [staffLeaves, setStaffLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [analyticsRes, doctorLeaveRes, staffLeaveRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/leave?view=doctors"),
        fetch("/api/leave?view=staff"),
      ]);
      const analyticsData = await analyticsRes.json();
      const doctorLeaveData = await doctorLeaveRes.json();
      const staffLeaveData = await staffLeaveRes.json();

      setAnalytics(analyticsData);
      setDoctorLeaves((doctorLeaveData.leaves ?? []).filter((l: LeaveRecord) => l.status === "APPROVED"));
      setStaffLeaves((staffLeaveData.leaves ?? []).filter((l: LeaveRecord) => l.status === "APPROVED"));
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !analytics) {
    return <div className="text-sm text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Overview</h1>
        <p className="text-slate-500 text-sm">A snapshot of today's hospital activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total appointments" value={analytics.totalAppointments} icon={<CalendarClock size={20} />} />
        <StatCard label="Completed today" value={analytics.completedToday} icon={<CheckCircle2 size={20} />} accent="clinical" />
        <StatCard label="Cancelled today" value={analytics.cancelledToday} icon={<XCircle size={20} />} accent="rose" />
        <StatCard label="Pending" value={analytics.pendingTotal} icon={<Clock size={20} />} accent="amber" />
        <StatCard label="Total doctors" value={analytics.totalDoctors} icon={<Stethoscope size={20} />} />
        <StatCard label="Total staff" value={analytics.totalStaff} icon={<UserCog size={20} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Weekly appointments</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#EFF9F7" }} contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
              <Bar dataKey="count" fill="#2C8F7C" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Monthly appointments</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#EFF9F7" }} contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
              <Bar dataKey="count" fill="#1F7264" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Doctors currently on leave</h3>
          {doctorLeaves.length === 0 ? (
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
    </div>
  );
}
