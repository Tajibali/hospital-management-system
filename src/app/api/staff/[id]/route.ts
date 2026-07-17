import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  experienceYears: z.number().min(0).optional(),
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

    const staffMember = await prisma.staff.findUnique({ where: { id: params.id } });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.name || data.phone || data.photoUrl !== undefined) {
        await tx.user.update({
          where: { id: staffMember.userId },
          data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
          },
        });
      }
      return tx.staff.update({
        where: { id: params.id },
        data: {
          ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } } },
      });
    });

    return NextResponse.json({ staff: updated });
  } catch (err) {
    console.error("Update staff error:", err);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const staffMember = await prisma.staff.findUnique({ where: { id: params.id } });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }
    await prisma.user.delete({ where: { id: staffMember.userId } });
    return NextResponse.json({ message: "Staff member removed" });
  } catch (err) {
    console.error("Delete staff error:", err);
    return NextResponse.json({ error: "Failed to remove staff member" }, { status: 500 });
  }
}
