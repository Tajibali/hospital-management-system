import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/shared/Sidebar";
import { LayoutDashboard, CalendarClock, ClipboardList } from "lucide-react";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const items = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard size={17} /> },
    { label: "My Appointments", href: "/doctor/appointments", icon: <CalendarClock size={17} /> },
    { label: "Leave", href: "/doctor/leave", icon: <ClipboardList size={17} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      <Sidebar portalLabel="Doctor Portal" userName={session.user.name ?? "Doctor"} items={items} />
      <div className="flex-1 min-w-0 p-8">{children}</div>
    </div>
  );
}
