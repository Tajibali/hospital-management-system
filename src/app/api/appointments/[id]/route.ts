import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const includeShape = {
  patient: { select: { id: true, name: true, phone: true } },
  doctor: {
    select: {
      id: true,
      specialization: true,
      user: { select: { name: true } },
    },
  },
} as const;

const updateSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  doctorId: z.string().optional(),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Doctors may only update the status of their own appointments
    if (session.user.role === "DOCTOR") {
      if (appointment.doctorId !== session.user.doctorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (!data.status || Object.keys(data).length > 1) {
        return NextResponse.json(
          { error: "Doctors can only update appointment status" },
          { status: 403 }
        );
      }
    } else if (!["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.time ? { time: data.time } : {}),
        ...(data.doctorId ? { doctorId: data.doctorId } : {}),
        ...(data.reason !== undefined ? { reason: data.reason } : {}),
      },
      include: includeShape,
    });

    return NextResponse.json({ appointment: updated });
  } catch (err) {
    console.error("Update appointment error:", err);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.appointment.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("Delete appointment error:", err);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
