"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { LeaveRecord } from "@/types";

export default function DoctorLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  async function loadLeaves() {
    const res = await fetch("/api/leave?view=mine");
    const data = await res.json();
    setLeaves(data.leaves ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleSubmit() {
    if (!date || !reason) {
      toast.error("Date and reason are required");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to submit leave request");
      return;
    }

    toast.success("Leave request sent to admin");
    setModalOpen(false);
    setDate("");
    setReason("");
    loadLeaves();
  }

  const latestApproved = leaves.find((l) => l.status === "APPROVED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Leave</h1>
          <p className="text-slate-500 text-sm">Request time off and track your approval status.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Request leave
        </Button>
      </div>

      {latestApproved && (
        <div className="bg-clinical-50 border border-clinical-200 rounded-card p-4 text-sm text-clinical-800">
          Your leave for <strong>{formatDate(latestApproved.date)}</strong> has been{" "}
          <strong>granted</strong> by the admin.
        </div>
      )}

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        <h3 className="font-display text-lg text-ink mb-4">Your leave requests</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : leaves.length === 0 ? (
          <EmptyState message="You haven't requested any leave yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Requested on</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{formatDate(l.date)}</td>
                  <td className="py-3 text-slate-500">{l.reason}</td>
                  <td className="py-3 text-slate-500">{formatDate(l.createdAt)}</td>
                  <td className="py-3 text-right">
                    <Badge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request leave">
        <div>
          <FormField label="Date" id="l-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <div className="mb-4">
            <label htmlFor="l-reason" className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason
            </label>
            <textarea
              id="l-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-ink placeholder:text-slate-400 focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500 outline-none transition-colors"
              placeholder="Briefly describe your reason for leave"
            />
          </div>
          <Button onClick={handleSubmit} loading={submitting} className="w-full mt-2">
            Send request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
