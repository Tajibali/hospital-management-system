"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";

export default function LoginForm({
  providerId,
  redirectPath,
}: {
  providerId: "admin-login" | "doctor-login" | "staff-login";
  redirectPath: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(providerId, {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Logged in successfully");
    router.push(redirectPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email address"
        id="email"
        type="email"
        placeholder="you@hospital.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" loading={loading} className="w-full mt-2">
        {loading ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}
