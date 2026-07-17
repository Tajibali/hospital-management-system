import { DefaultSession } from "next-auth";
import { Role } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      doctorId?: string;
      staffId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    doctorId?: string;
    staffId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    doctorId?: string;
    staffId?: string;
  }
}
