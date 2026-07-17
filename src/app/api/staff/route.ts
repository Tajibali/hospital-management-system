import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, randomPassword } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "STAFF", "DOCTOR"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const staff = await prisma.staff.findMany({
    where: { user: { status: "APPROVED" } },
    include: { user: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ staff });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  experienceYears: z.number().min(0),
  photoUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

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

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const tempPassword = randomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const staffMember = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone,
          password: hashedPassword,
          role: "STAFF",
          status: "APPROVED",
          photoUrl: data.photoUrl || null,
        },
      });
      return tx.staff.create({
        data: {
          userId: user.id,
          experienceYears: data.experienceYears,
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } } },
      });
    });

    return NextResponse.json(
      {
        staff: staffMember,
        tempPassword,
        message: "Staff added. A QR code has been generated for attendance.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create staff error:", err);
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }
}
