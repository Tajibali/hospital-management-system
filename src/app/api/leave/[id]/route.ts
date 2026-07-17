import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

const includeShape = {
  doctor: { select: { user: { select: { name: true } } } },
  staff: { select: { user: { select: { name: true } } } },
} as const;

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

    const leave = await prisma.leave.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: includeShape,
    });

    return NextResponse.json({ leave });
  } catch (err) {
    console.error("Update leave error:", err);
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
