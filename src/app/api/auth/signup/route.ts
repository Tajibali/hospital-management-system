import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Admin accounts are never created through this public endpoint — the Admin
// authenticates purely via ADMIN_EMAIL/ADMIN_PASSWORD env vars and has no
// database record at all. Only Doctor and Staff can request an account here,
// and both start out PENDING until an Admin approves them from the Account
// Requests page.
const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  role: z.enum(["DOCTOR", "STAFF"]),
  specialization: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  photoUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = baseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.role === "DOCTOR") {
      if (!data.specialization || !data.availableDays || data.availableDays.length === 0) {
        return NextResponse.json(
          { error: "Specialization and at least one available day are required" },
          { status: 400 }
        );
      }
    }

    if (data.role === "STAFF") {
      if (data.experienceYears === undefined || data.experienceYears < 0) {
        return NextResponse.json(
          { error: "Years of experience is required" },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          phone: data.phone,
          role: data.role,
          status: "PENDING",
          photoUrl: data.photoUrl || null,
        },
      });

      if (data.role === "DOCTOR") {
        await tx.doctor.create({
          data: {
            userId: createdUser.id,
            specialization: data.specialization!,
            availableDays: data.availableDays!,
          },
        });
      }

      if (data.role === "STAFF") {
        await tx.staff.create({
          data: {
            userId: createdUser.id,
            experienceYears: data.experienceYears!,
          },
        });
      }

      return createdUser;
    });

    return NextResponse.json(
      {
        message:
          "Your request has been sent to the admin. You'll be able to log in once it's approved.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the account" },
      { status: 500 }
    );
  }
}
