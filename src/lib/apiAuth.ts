import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types";

export async function requireRole(allowed: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !allowed.includes(session.user.role)) {
    return { session: null, error: "Unauthorized" as const };
  }
  return { session, error: null };
}

export function randomPassword(): string {
  return Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10);
}
