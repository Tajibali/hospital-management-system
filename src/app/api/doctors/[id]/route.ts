import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  specialization: z.string().min(2).optional(),
  availableDays: z.array(z.string()).optional(),
  photoUrl: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.name || data.phone || data.photoUrl !== undefined) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
          },
        });
      }
      return tx.doctor.update({
        where: { id: params.id },
        data: {
          ...(data.specialization ? { specialization: data.specialization } : {}),
          ...(data.availableDays ? { availableDays: data.availableDays } : {}),
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } } },
      });
    });

    return NextResponse.json({ doctor: updated });
  } catch (err) {
    console.error("Update doctor error:", err);
    return NextResponse.json({ error: "Failed to update doctor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    // Deleting the user cascades to the doctor profile
    await prisma.user.delete({ where: { id: doctor.userId } });
    return NextResponse.json({ message: "Doctor removed" });
  } catch (err) {
    console.error("Delete doctor error:", err);
    return NextResponse.json({ error: "Failed to remove doctor" }, { status: 500 });
  }
}
