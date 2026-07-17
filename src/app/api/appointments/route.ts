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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.user.role === "DOCTOR" && session.user.doctorId
      ? { doctorId: session.user.doctorId }
      : {};

  const appointments = await prisma.appointment.findMany({
    where,
    include: includeShape,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}

const createSchema = z.object({
  patientId: z.string().optional(),
  newPatient: z
    .object({
      name: z.string().min(2),
      phone: z.string().min(7),
      email: z.string().optional(),
    })
    .optional(),
  doctorId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (!data.patientId && !data.newPatient) {
      return NextResponse.json(
        { error: "Provide an existing patient or new patient details" },
        { status: 400 }
      );
    }

    let patientId = data.patientId;

    if (!patientId && data.newPatient) {
      const patient = await prisma.patient.create({
        data: {
          name: data.newPatient.name,
          phone: data.newPatient.phone,
          email: data.newPatient.email || null,
        },
      });
      patientId = patient.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientId!,
        doctorId: data.doctorId,
        date: new Date(data.date),
        time: data.time,
        reason: data.reason,
      },
      include: includeShape,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    console.error("Create appointment error:", err);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
