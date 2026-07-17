"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { DoctorWithUser, StaffWithUser } from "@/types";

export default function AccountRequestsPage() {
  const [pendingDoctors, setPendingDoctors] = useState<DoctorWithUser[]>([]);
  const [pendingStaff, setPendingStaff] = useState<StaffWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/account-requests");
    const data = await res.json();
    setPendingDoctors(data.pendingDoctors ?? []);
    setPendingStaff(data.pendingStaff ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(userId: string, status: "APPROVED" | "REJECTED") {
    setActingOn(userId);
    const res = await fetch(`/api/account-requests/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setActingOn(null);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to update request");
      return;
    }

    toast.success(data.message ?? "Updated");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Account requests</h1>
        <p className="text-slate-500 text-sm">
          Doctors and staff who signed up are listed here until you approve or reject them.
        </p>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Pending doctor requests</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : pendingDoctors.length === 0 ? (
          <EmptyState message="No pending doctor requests." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Specialization</th>
                <th className="pb-3 font-medium">Available days</th>
                <th className="pb-3 font-medium">Requested</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingDoctors.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{d.user.name}</td>
                  <td className="py-3 text-slate-500">{d.user.email}</td>
                  <td className="py-3 text-slate-500">{d.user.phone}</td>
                  <td className="py-3 text-slate-500">{d.specialization}</td>
                  <td className="py-3 text-slate-500">{d.availableDays.join(", ")}</td>
                  <td className="py-3 text-slate-500">{formatDate(d.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="primary"
                        loading={actingOn === d.userId}
                        onClick={() => handleDecision(d.userId, "APPROVED")}
                        className="!py-1.5 !px-3"
                      >
                        <Check size={14} /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        loading={actingOn === d.userId}
                        onClick={() => handleDecision(d.userId, "REJECTED")}
                        className="!py-1.5 !px-3"
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Pending staff requests</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : pendingStaff.length === 0 ? (
          <EmptyState message="No pending staff requests." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Experience</th>
                <th className="pb-3 font-medium">Requested</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingStaff.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{s.user.name}</td>
                  <td className="py-3 text-slate-500">{s.user.email}</td>
                  <td className="py-3 text-slate-500">{s.user.phone}</td>
                  <td className="py-3 text-slate-500">{s.experienceYears} yrs</td>
                  <td className="py-3 text-slate-500">{formatDate(s.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="primary"
                        loading={actingOn === s.userId}
                        onClick={() => handleDecision(s.userId, "APPROVED")}
                        className="!py-1.5 !px-3"
                      >
                        <Check size={14} /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        loading={actingOn === s.userId}
                        onClick={() => handleDecision(s.userId, "REJECTED")}
                        className="!py-1.5 !px-3"
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
