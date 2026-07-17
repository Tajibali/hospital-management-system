import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserCog,
  CalendarClock,
  ClipboardList,
  QrCode,
  BarChart3,
  UserCheck,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const items = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={17} /> },
    { label: "Account Requests", href: "/admin/account-requests", icon: <UserCheck size={17} /> },
    { label: "Patients", href: "/admin/patients", icon: <Users size={17} /> },
    { label: "Doctors", href: "/admin/doctors", icon: <Stethoscope size={17} /> },
    { label: "Staff", href: "/admin/staff", icon: <UserCog size={17} /> },
    { label: "Appointments", href: "/admin/appointments", icon: <CalendarClock size={17} /> },
    { label: "Leave Requests", href: "/admin/leave", icon: <ClipboardList size={17} /> },
    { label: "QR Scanner", href: "/admin/qr-scanner", icon: <QrCode size={17} /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={17} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      <Sidebar portalLabel="Admin Portal" userName={session.user.name ?? "Admin"} items={items} />
      <div className="flex-1 min-w-0 p-8">{children}</div>
    </div>
  );
}
