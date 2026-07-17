import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "STAFF", "DOCTOR"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients });
}

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.string().optional(),
  age: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole(["ADMIN", "STAFF"]);
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

    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        gender: data.gender || null,
        age: data.age,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (err) {
    console.error("Create patient error:", err);
    return NextResponse.json({ error: "Failed to add patient" }, { status: 500 });
  }
}
