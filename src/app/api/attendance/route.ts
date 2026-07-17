import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    include: {
      staff: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ attendances });
}

const scanSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = scanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }
    const token = parsed.data.token;

    // A QR code could belong to either a staff member or a doctor — check both.
    const [staffMember, doctorMember] = await Promise.all([
      prisma.staff.findUnique({ where: { qrToken: token }, include: { user: { select: { name: true } } } }),
      prisma.doctor.findUnique({ where: { qrToken: token }, include: { user: { select: { name: true } } } }),
    ]);

    if (!staffMember && !doctorMember) {
      return NextResponse.json({ error: "QR code does not match any doctor or staff member" }, { status: 404 });
    }

    const personType = doctorMember ? "DOCTOR" : "STAFF";
    const personName = doctorMember ? doctorMember.user.name : staffMember!.user.name;
    const personId = doctorMember ? doctorMember.id : staffMember!.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyMarked = await prisma.attendance.findFirst({
      where: {
        ...(personType === "DOCTOR" ? { doctorId: personId } : { staffId: personId }),
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (alreadyMarked) {
      return NextResponse.json({
        message: `${personName} has already been marked present today`,
        alreadyMarked: true,
        name: personName,
      });
    }

    const nineAm = new Date();
    nineAm.setHours(9, 0, 0, 0);
    const status = new Date() > nineAm ? "LATE" : "PRESENT";

    await prisma.attendance.create({
      data: {
        personType,
        status,
        ...(personType === "DOCTOR" ? { doctorId: personId } : { staffId: personId }),
      },
    });

    return NextResponse.json({
      message: `Attendance marked for ${personType === "DOCTOR" ? "Dr. " : ""}${personName}`,
      name: personName,
      status,
    });
  } catch (err) {
    console.error("Attendance scan error:", err);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
