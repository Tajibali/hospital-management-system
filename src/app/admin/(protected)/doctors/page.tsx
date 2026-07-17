"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import QRCodeLib from "qrcode";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import EmptyState from "@/components/ui/EmptyState";
import PhotoUpload from "@/components/ui/PhotoUpload";
import IDCardModal from "@/components/shared/IDCardModal";
import { DoctorWithUser, WEEK_DAYS } from "@/types";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardQrDataUrl, setCardQrDataUrl] = useState("");
  const [cardDoctor, setCardDoctor] = useState<DoctorWithUser | null>(null);
  const [editing, setEditing] = useState<DoctorWithUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  async function loadDoctors() {
    const res = await fetch("/api/doctors");
    const data = await res.json();
    setDoctors(data.doctors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  function openAddModal() {
    setEditing(null);
    setName("");
    setEmail("");
    setPhone("");
    setPhotoUrl(null);
    setSpecialization("");
    setAvailableDays([]);
    setModalOpen(true);
  }

  function openEditModal(doctor: DoctorWithUser) {
    setEditing(doctor);
    setName(doctor.user.name);
    setEmail(doctor.user.email);
    setPhone(doctor.user.phone ?? "");
    setPhotoUrl(doctor.user.photoUrl ?? null);
    setSpecialization(doctor.specialization);
    setAvailableDays(doctor.availableDays);
    setModalOpen(true);
  }

  function toggleDay(day: string) {
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function openIdCard(doctor: DoctorWithUser) {
    const dataUrl = await QRCodeLib.toDataURL(doctor.qrToken, {
      width: 260,
      margin: 1,
      color: { dark: "#123B34" },
    });
    setCardQrDataUrl(dataUrl);
    setCardDoctor(doctor);
    setCardModalOpen(true);
  }

  async function handleSubmit() {
    if (!name || !phone || !specialization || availableDays.length === 0 || (!editing && !email)) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);

    if (editing) {
      const res = await fetch(`/api/doctors/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, specialization, availableDays, photoUrl }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update doctor");
        return;
      }
      toast.success("Doctor updated");
    } else {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, specialization, availableDays, photoUrl }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add doctor");
        return;
      }
      toast.success(`Doctor added. Temporary password: ${data.tempPassword}`, { duration: 8000 });
    }

    setModalOpen(false);
    loadDoctors();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this doctor? This cannot be undone.")) return;
    const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to remove doctor");
      return;
    }
    toast.success("Doctor removed");
    loadDoctors();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Doctors</h1>
          <p className="text-slate-500 text-sm">Manage specialists and their weekly availability.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} /> Add doctor
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : doctors.length === 0 ? (
          <EmptyState message="No doctors added yet. Click 'Add doctor' to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Specialization</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Available days</th>
                <th className="pb-3 font-medium">ID card</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{doctor.user.name}</td>
                  <td className="py-3 text-slate-600">{doctor.specialization}</td>
                  <td className="py-3 text-slate-500">
                    <div>{doctor.user.email}</div>
                    <div className="text-xs">{doctor.user.phone}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableDays.map((d) => (
                        <span key={d} className="text-xs bg-clinical-50 text-clinical-700 px-2 py-0.5 rounded-full">
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => openIdCard(doctor)}
                      className="flex items-center gap-1.5 text-xs text-clinical-700 hover:underline"
                    >
                      <QrCode size={14} /> View ID card
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(doctor)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-clinical-50 text-clinical-700"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit doctor" : "Add doctor"}>
        <div>
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
          <FormField label="Full name" id="d-name" value={name} onChange={(e) => setName(e.target.value)} required />
          {!editing && (
            <FormField
              label="Email address"
              id="d-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <FormField label="Phone number" id="d-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <FormField
            label="Specialization"
            id="d-spec"
            placeholder="e.g. Neurologist, Cardiologist"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Available days</label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    availableDays.includes(day)
                      ? "bg-clinical-700 text-white border-clinical-700"
                      : "border-slate-200 text-slate-600 hover:border-clinical-300"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} loading={submitting} className="w-full mt-2">
            {editing ? "Save changes" : "Add doctor"}
          </Button>
        </div>
      </Modal>

      <IDCardModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        name={cardDoctor ? `Dr. ${cardDoctor.user.name}` : ""}
        subtitle={cardDoctor?.specialization ?? ""}
        photoUrl={cardDoctor?.user.photoUrl ?? null}
        qrDataUrl={cardQrDataUrl}
      />
    </div>
  );
}
