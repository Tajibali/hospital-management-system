"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import EmptyState from "@/components/ui/EmptyState";
import PhotoUpload from "@/components/ui/PhotoUpload";
import IDCardModal from "@/components/shared/IDCardModal";
import { StaffWithUser } from "@/types";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardQrDataUrl, setCardQrDataUrl] = useState("");
  const [cardStaff, setCardStaff] = useState<StaffWithUser | null>(null);
  const [editing, setEditing] = useState<StaffWithUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState("");

  async function loadStaff() {
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaff(data.staff ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  function openAddModal() {
    setEditing(null);
    setName("");
    setEmail("");
    setPhone("");
    setPhotoUrl(null);
    setExperienceYears("");
    setModalOpen(true);
  }

  function openEditModal(member: StaffWithUser) {
    setEditing(member);
    setName(member.user.name);
    setEmail(member.user.email);
    setPhone(member.user.phone ?? "");
    setPhotoUrl(member.user.photoUrl ?? null);
    setExperienceYears(String(member.experienceYears));
    setModalOpen(true);
  }

  async function openIdCard(member: StaffWithUser) {
    const dataUrl = await QRCode.toDataURL(member.qrToken, { width: 260, margin: 1, color: { dark: "#123B34" } });
    setCardQrDataUrl(dataUrl);
    setCardStaff(member);
    setCardModalOpen(true);
  }

  async function handleSubmit() {
    if (!name || !phone || experienceYears === "" || (!editing && !email)) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);

    if (editing) {
      const res = await fetch(`/api/staff/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, experienceYears: Number(experienceYears), photoUrl }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update staff member");
        return;
      }
      toast.success("Staff member updated");
    } else {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, experienceYears: Number(experienceYears), photoUrl }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add staff member");
        return;
      }
      toast.success(`Staff added. Temporary password: ${data.tempPassword}`, { duration: 8000 });
    }

    setModalOpen(false);
    loadStaff();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this staff member? This cannot be undone.")) return;
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to remove staff member");
      return;
    }
    toast.success("Staff member removed");
    loadStaff();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Staff</h1>
          <p className="text-slate-500 text-sm">Manage front-line staff and their attendance QR codes.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} /> Add staff
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : staff.length === 0 ? (
          <EmptyState message="No staff added yet. Click 'Add staff' to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Experience</th>
                <th className="pb-3 font-medium">ID card</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-ink">{member.user.name}</td>
                  <td className="py-3 text-slate-500">
                    <div>{member.user.email}</div>
                    <div className="text-xs">{member.user.phone}</div>
                  </td>
                  <td className="py-3 text-slate-600">{member.experienceYears} yrs</td>
                  <td className="py-3">
                    <button
                      onClick={() => openIdCard(member)}
                      className="flex items-center gap-1.5 text-xs text-clinical-700 hover:underline"
                    >
                      <QrCode size={14} /> View ID card
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-clinical-50 text-clinical-700"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit staff member" : "Add staff"}>
        <div>
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
          <FormField label="Full name" id="s-name" value={name} onChange={(e) => setName(e.target.value)} required />
          {!editing && (
            <FormField
              label="Email address"
              id="s-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <FormField label="Phone number" id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <FormField
            label="Years of experience"
            id="s-exp"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
          />
          <Button onClick={handleSubmit} loading={submitting} className="w-full mt-2">
            {editing ? "Save changes" : "Add staff"}
          </Button>
        </div>
      </Modal>

      <IDCardModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        name={cardStaff?.user.name ?? ""}
        subtitle={cardStaff ? `Staff · ${cardStaff.experienceYears} yrs experience` : ""}
        photoUrl={cardStaff?.user.photoUrl ?? null}
        qrDataUrl={cardQrDataUrl}
      />
    </div>
  );
}
