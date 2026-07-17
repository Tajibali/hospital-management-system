import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const includeShape = {
  doctor: { select: { user: { select: { name: true } } } },
  staff: { select: { user: { select: { name: true } } } },
} as const;

/**
 * GET /api/leave?view=mine|doctors|staff
 * - "mine": the logged-in doctor/staff's own leave history
 * - "doctors": leave records raised by doctors (admin sees all statuses, others see approved only)
 * - "staff": leave records raised by staff (admin sees all statuses, others see approved only)
 * - no view param: full list (admin dashboard)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const view = req.nextUrl.searchParams.get("view");
  const isAdmin = session.user.role === "ADMIN";

  let where = {};

  if (view === "mine") {
    if (session.user.role === "DOCTOR") {
      where = { doctorId: session.user.doctorId };
    } else if (session.user.role === "STAFF") {
      where = { staffId: session.user.staffId };
    }
  } else if (view === "doctors") {
    where = { requesterType: "DOCTOR", ...(isAdmin ? {} : { status: "APPROVED" }) };
  } else if (view === "staff") {
    where = { requesterType: "STAFF", ...(isAdmin ? {} : { status: "APPROVED" }) };
  } else if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const leaves = await prisma.leave.findMany({
    where,
    include: includeShape,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ leaves });
}

const createSchema = z.object({
  date: z.string().min(1),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["DOCTOR", "STAFF"].includes(session.user.role)) {
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

    const leave = await prisma.leave.create({
      data: {
        requesterType: session.user.role === "DOCTOR" ? "DOCTOR" : "STAFF",
        doctorId: session.user.role === "DOCTOR" ? session.user.doctorId : undefined,
        staffId: session.user.role === "STAFF" ? session.user.staffId : undefined,
        date: new Date(data.date),
        reason: data.reason,
      },
      include: includeShape,
    });

    return NextResponse.json({ leave }, { status: 201 });
  } catch (err) {
    console.error("Create leave error:", err);
    return NextResponse.json({ error: "Failed to submit leave request" }, { status: 500 });
  }
}
