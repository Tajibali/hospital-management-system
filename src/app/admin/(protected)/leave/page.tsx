"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { LeaveRecord } from "@/types";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaves() {
    const res = await fetch("/api/leave");
    const data = await res.json();
    setLeaves(data.leaves ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update leave request");
      return;
    }
    toast.success(`Leave request ${status.toLowerCase()}`);
    loadLeaves();
  }

  const pending = leaves.filter((l) => l.status === "PENDING");
  const decided = leaves.filter((l) => l.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Leave requests</h1>
        <p className="text-slate-500 text-sm">Approve or reject leave requests from doctors and staff.</p>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Pending requests</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : pending.length === 0 ? (
          <EmptyState message="No pending leave requests." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium text-right">Decision</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {l.doctor?.user.name ?? l.staff?.user.name}
                  </td>
                  <td className="py-3 text-slate-500">{l.requesterType === "DOCTOR" ? "Doctor" : "Staff"}</td>
                  <td className="py-3 text-slate-500">{formatDate(l.date)}</td>
                  <td className="py-3 text-slate-500">{l.reason}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDecision(l.id, "APPROVED")}
                        className="text-xs px-3 py-1.5 rounded-md bg-clinical-700 hover:bg-clinical-800 text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(l.id, "REJECTED")}
                        className="text-xs px-3 py-1.5 rounded-md border border-rose-300 text-rose-500 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">History</h3>
        {decided.length === 0 ? (
          <EmptyState message="No decisions made yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {decided.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {l.doctor?.user.name ?? l.staff?.user.name}
                  </td>
                  <td className="py-3 text-slate-500">{l.requesterType === "DOCTOR" ? "Doctor" : "Staff"}</td>
                  <td className="py-3 text-slate-500">{formatDate(l.date)}</td>
                  <td className="py-3 text-slate-500">{l.reason}</td>
                  <td className="py-3 text-right">
                    <Badge status={l.status} />
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
