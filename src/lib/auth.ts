import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeAdmin(credentials);
      },
    }),
    CredentialsProvider({
      id: "doctor-login",
      name: "Doctor Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeByRole(credentials, "DOCTOR");
      },
    }),
    CredentialsProvider({
      id: "staff-login",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeByRole(credentials, "STAFF");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.doctorId = user.doctorId;
        token.staffId = user.staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.doctorId = token.doctorId;
        session.user.staffId = token.staffId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * The Admin account is NOT stored in the database at all — on purpose.
 * The single admin email/password live only in environment variables
 * (ADMIN_EMAIL / ADMIN_PASSWORD), set in .env / .env.local (and in Vercel's
 * Environment Variables for production). This function never queries Mongo.
 */
async function authorizeAdmin(
  credentials: Record<"email" | "password", string> | undefined
) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Admin credentials are not configured on the server. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment."
    );
  }

  const submittedEmail = credentials.email.toLowerCase().trim();

  if (submittedEmail !== adminEmail || credentials.password !== adminPassword) {
    throw new Error("Incorrect email or password");
  }

  return {
    id: "admin-account",
    name: "Hospital Admin",
    email: adminEmail,
    role: "ADMIN" as const,
  };
}

async function authorizeByRole(
  credentials: Record<"email" | "password", string> | undefined,
  role: "DOCTOR" | "STAFF"
) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase().trim() },
    include: { doctor: true, staff: true },
  });

  if (!user) {
    throw new Error("No account found with this email");
  }

  if (user.role !== role) {
    throw new Error(`This email is not registered as ${role.toLowerCase()}`);
  }

  const isValid = await bcrypt.compare(credentials.password, user.password);
  if (!isValid) {
    throw new Error("Incorrect password");
  }

  if (user.status === "PENDING") {
    throw new Error(
      "Your account is awaiting admin approval. You'll be able to log in once approved."
    );
  }

  if (user.status === "REJECTED") {
    throw new Error("Your signup request was rejected by the admin. Contact the hospital admin for details.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    doctorId: user.doctor?.id,
    staffId: user.staff?.id,
  };
}
