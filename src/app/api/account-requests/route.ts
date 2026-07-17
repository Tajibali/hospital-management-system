import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const [pendingDoctors, pendingStaff] = await Promise.all([
    prisma.doctor.findMany({
      where: { user: { status: "PENDING" } },
      include: { user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.staff.findMany({
      where: { user: { status: "PENDING" } },
      include: { user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ pendingDoctors, pendingStaff });
}
