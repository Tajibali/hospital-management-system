"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { PatientRecord } from "@/types";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  async function loadPatients() {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data.patients ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  function openAddModal() {
    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setAge("");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!name || !phone) {
      toast.error("Name and phone number are required");
      return;
    }
    setSubmitting(true);

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email: email || undefined,
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to add patient");
      return;
    }

    toast.success("Patient added");
    setModalOpen(false);
    loadPatients();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Patients</h1>
          <p className="text-slate-500 text-sm">All patient records on file.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} /> Add patient
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : patients.length === 0 ? (
          <EmptyState message="No patients added yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Gender</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">Added on</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{patient.name}</td>
                  <td className="py-3 text-slate-500">
                    <div>{patient.phone}</div>
                    {patient.email && <div className="text-xs">{patient.email}</div>}
                  </td>
                  <td className="py-3 text-slate-600">{patient.gender ?? "—"}</td>
                  <td className="py-3 text-slate-600">{patient.age ?? "—"}</td>
                  <td className="py-3 text-slate-500">{formatDate(patient.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add patient">
        <div>
          <FormField label="Full name" id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormField label="Phone number" id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <FormField label="Email (optional)" id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormField label="Gender (optional)" id="p-gender" value={gender} onChange={(e) => setGender(e.target.value)} />
          <FormField label="Age (optional)" id="p-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
          <Button onClick={handleSubmit} loading={submitting} className="w-full mt-2">
            Add patient
          </Button>
        </div>
      </Modal>
    </div>
  );
}
