import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
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

    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "Account request not found" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Admin accounts cannot be modified here" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: { status: parsed.data.status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return NextResponse.json({
      user: updated,
      message:
        parsed.data.status === "APPROVED"
          ? `${updated.name} can now log in.`
          : `${updated.name}'s request was rejected.`,
    });
  } catch (err) {
    console.error("Account request update error:", err);
    return NextResponse.json({ error: "Failed to update account request" }, { status: 500 });
  }
}
