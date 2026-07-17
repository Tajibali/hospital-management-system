"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

interface AttendanceRow {
  id: string;
  date: string;
  status: string;
  personType: "DOCTOR" | "STAFF";
  staff?: { user: { name: string } } | null;
  doctor?: { user: { name: string } } | null;
}

export default function AdminQrScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(false);

  async function loadAttendance() {
    const res = await fetch("/api/attendance");
    const data = await res.json();
    setAttendances(data.attendances ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAttendance();
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function startScanning() {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;

          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: decodedText }),
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error ?? "Could not mark attendance");
          } else if (data.alreadyMarked) {
            toast(data.message, { icon: "ℹ️" });
          } else {
            toast.success(data.message);
            loadAttendance();
          }

          setTimeout(() => {
            processingRef.current = false;
          }, 2500);
        },
        () => {
          // ignore per-frame scan failures
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Could not access the camera. Check browser permissions.");
      setScanning(false);
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">QR attendance scanner</h1>
        <p className="text-slate-500 text-sm">Scan a doctor's or staff member's QR code to mark them present for today.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden bg-slate-50 min-h-[280px]" />
          <div className="mt-4 flex gap-2">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-clinical-700 hover:bg-clinical-800 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
              >
                Start scanner
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 border border-rose-300 text-rose-500 hover:bg-rose-50 text-sm font-medium py-2.5 rounded-md transition-colors"
              >
                Stop scanner
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-clinical-100 p-6">
          <h3 className="font-display text-lg text-ink mb-4">Today's attendance</h3>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : attendances.length === 0 ? (
            <EmptyState message="No attendance marked yet today." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="py-2.5 font-medium text-ink">
                      {a.personType === "DOCTOR" ? `Dr. ${a.doctor?.user.name}` : a.staff?.user.name}
                    </td>
                    <td className="py-2.5 text-slate-500">{formatDateTime(a.date)}</td>
                    <td className="py-2.5 text-slate-500">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
