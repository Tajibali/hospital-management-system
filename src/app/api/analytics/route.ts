import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "STAFF"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalAppointments,
    completedToday,
    cancelledToday,
    pendingTotal,
    totalDoctors,
    totalStaff,
    allAppointments,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: { status: "COMPLETED", date: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.appointment.count({
      where: { status: "CANCELLED", date: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.doctor.count(),
    prisma.staff.count(),
    prisma.appointment.findMany({ select: { date: true, status: true } }),
  ]);

  // Weekly trend: last 7 days
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekly: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);
    const count = allAppointments.filter((a) => {
      const ad = new Date(a.date);
      return ad >= d && ad <= dEnd;
    }).length;
    weekly.push({ day: dayLabels[d.getDay()], count });
  }

  // Monthly trend: last 6 months
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthly: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const count = allAppointments.filter((a) => {
      const ad = new Date(a.date);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length;
    monthly.push({ month: monthLabels[d.getMonth()], count });
  }

  return NextResponse.json({
    totalAppointments,
    completedToday,
    cancelledToday,
    pendingTotal,
    totalDoctors,
    totalStaff,
    weekly,
    monthly,
  });
}
