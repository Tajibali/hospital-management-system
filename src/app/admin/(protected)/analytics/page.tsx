"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import { CalendarClock, CheckCircle2, XCircle, Clock } from "lucide-react";

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

const PIE_COLORS = ["#D9822B", "#2C8F7C", "#C4443C"];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setAnalytics);
  }, []);

  if (!analytics) {
    return <div className="text-sm text-slate-400">Loading analytics...</div>;
  }

  const pieData = [
    { name: "Pending", value: analytics.pendingTotal },
    { name: "Completed today", value: analytics.completedToday },
    { name: "Cancelled today", value: analytics.cancelledToday },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Analytics</h1>
        <p className="text-slate-500 text-sm">Trends across appointments, week over week and month over month.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total appointments" value={analytics.totalAppointments} icon={<CalendarClock size={20} />} />
        <StatCard label="Completed today" value={analytics.completedToday} icon={<CheckCircle2 size={20} />} accent="clinical" />
        <StatCard label="Cancelled today" value={analytics.cancelledToday} icon={<XCircle size={20} />} accent="rose" />
        <StatCard label="Pending" value={analytics.pendingTotal} icon={<Clock size={20} />} accent="amber" />
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Weekly trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={analytics.weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
            <Line type="monotone" dataKey="count" stroke="#2C8F7C" strokeWidth={2.5} dot={{ r: 4 }} name="Appointments" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Monthly trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
              <Bar dataKey="count" fill="#1F7264" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Today's status breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #D8F0EA", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
