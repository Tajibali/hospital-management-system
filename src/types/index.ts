export type Role = "ADMIN" | "DOCTOR" | "STAFF";

export type AppointmentStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RequesterType = "DOCTOR" | "STAFF";

export interface DoctorWithUser {
  id: string;
  userId: string;
  specialization: string;
  availableDays: string[];
  qrToken: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photoUrl: string | null;
  };
}

export interface StaffWithUser {
  id: string;
  userId: string;
  experienceYears: number;
  qrToken: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photoUrl: string | null;
  };
}

export interface PatientRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  gender: string | null;
  age: number | null;
  createdAt: string | Date;
}

export interface AppointmentRecord {
  id: string;
  date: string | Date;
  time: string;
  reason: string | null;
  status: AppointmentStatus;
  patient: { id: string; name: string; phone: string };
  doctor: {
    id: string;
    specialization: string;
    user: { name: string };
  };
}

export interface LeaveRecord {
  id: string;
  requesterType: RequesterType;
  date: string | Date;
  reason: string;
  status: LeaveStatus;
  createdAt: string | Date;
  doctor?: { user: { name: string } } | null;
  staff?: { user: { name: string } } | null;
}

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
