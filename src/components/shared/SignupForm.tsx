"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { WEEK_DAYS } from "@/types";

export default function SignupForm({
  role,
  pendingPath,
}: {
  role: "DOCTOR" | "STAFF" | "ADMIN";
  pendingPath: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleDay(day: string) {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (role === "DOCTOR" && (!specialization || availableDays.length === 0)) {
      toast.error("Please add specialization and at least one available day");
      return;
    }

    if (role === "STAFF" && experienceYears === "") {
      toast.error("Please add years of experience");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role,
        specialization: role === "DOCTOR" ? specialization : undefined,
        availableDays: role === "DOCTOR" ? availableDays : undefined,
        experienceYears: role === "STAFF" ? Number(experienceYears) : undefined,
        photoUrl: photoUrl || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success("Request sent to admin for approval");
    router.push(pendingPath);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
      <FormField
        label="Full name"
        id="name"
        placeholder="Dr. Ayesha Khan"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        label="Phone number"
        id="phone"
        type="tel"
        placeholder="03xx-xxxxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      {role === "DOCTOR" && (
        <>
          <FormField
            label="Specialization"
            id="specialization"
            placeholder="e.g. Neurologist, Cardiologist"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Available days
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${availableDays.includes(day)
                      ? "bg-clinical-700 text-white border-clinical-700"
                      : "border-slate-200 text-slate-600 hover:border-clinical-300"
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {role === "STAFF" && (
        <FormField
          label="Years of experience"
          id="experienceYears"
          type="number"
          min={0}
          placeholder="e.g. 3"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          required
        />
      )}

      <FormField
        label="Password"
        id="password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      <Button type="submit" loading={loading} className="w-full mt-2">
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
