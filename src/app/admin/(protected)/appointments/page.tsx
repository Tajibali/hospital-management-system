"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { AppointmentRecord, DoctorWithUser, PatientRecord, AppointmentStatus } from "@/types";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [patientMode, setPatientMode] = useState<"existing" | "new">("new");
  const [patientId, setPatientId] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  async function loadAll() {
    const [aRes, dRes, pRes] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/doctors"),
      fetch("/api/patients"),
    ]);
    const [aData, dData, pData] = await Promise.all([aRes.json(), dRes.json(), pRes.json()]);
    setAppointments(aData.appointments ?? []);
    setDoctors(dData.doctors ?? []);
    setPatients(pData.patients ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openAddModal() {
    setPatientMode("new");
    setPatientId("");
    setNewPatientName("");
    setNewPatientPhone("");
    setDoctorId("");
    setDate("");
    setTime("");
    setReason("");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!doctorId || !date || !time) {
      toast.error("Doctor, date and time are required");
      return;
    }
    if (patientMode === "existing" && !patientId) {
      toast.error("Select a patient");
      return;
    }
    if (patientMode === "new" && (!newPatientName || !newPatientPhone)) {
      toast.error("Enter new patient name and phone");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patientMode === "existing" ? patientId : undefined,
        newPatient:
          patientMode === "new" ? { name: newPatientName, phone: newPatientPhone } : undefined,
        doctorId,
        date,
        time,
        reason: reason || undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to book appointment");
      return;
    }

    toast.success("Appointment booked");
    setModalOpen(false);
    loadAll();
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update appointment");
      return;
    }
    toast.success(`Appointment marked ${status.toLowerCase()}`);
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this appointment?")) return;
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete appointment");
      return;
    }
    toast.success("Appointment deleted");
    loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Appointments</h1>
          <p className="text-slate-500 text-sm">Book, update, and manage every appointment.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} /> Book appointment
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : appointments.length === 0 ? (
          <EmptyState message="No appointments booked yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Date &amp; time</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">
                    {appt.patient.name}
                    <div className="text-xs text-slate-400 font-normal">{appt.patient.phone}</div>
                  </td>
                  <td className="py-3 text-slate-600">
                    {appt.doctor.user.name}
                    <div className="text-xs text-slate-400">{appt.doctor.specialization}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(appt.date)} &middot; {appt.time}
                  </td>
                  <td className="py-3">
                    <Badge status={appt.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end items-center gap-2">
                      {appt.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(appt.id, "COMPLETED")}
                            className="text-xs text-clinical-700 hover:underline"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(appt.id, "CANCELLED")}
                            className="text-xs text-rose-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(appt.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-rose-50 text-rose-500"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book appointment">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPatientMode("new")}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  patientMode === "new" ? "bg-clinical-700 text-white border-clinical-700" : "border-slate-200 text-slate-600"
                }`}
              >
                New patient
              </button>
              <button
                type="button"
                onClick={() => setPatientMode("existing")}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  patientMode === "existing" ? "bg-clinical-700 text-white border-clinical-700" : "border-slate-200 text-slate-600"
                }`}
              >
                Existing patient
              </button>
            </div>

            {patientMode === "new" ? (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Patient name" id="new-p-name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
                <FormField label="Phone" id="new-p-phone" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} />
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 bg-white text-sm outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              >
                <option value="">Select a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 bg-white text-sm outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" id="a-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <FormField label="Time" id="a-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <FormField label="Reason (optional)" id="a-reason" value={reason} onChange={(e) => setReason(e.target.value)} />

          <Button onClick={handleSubmit} loading={submitting} className="w-full mt-2">
            Book appointment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
