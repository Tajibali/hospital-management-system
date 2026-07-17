"use client";

import { useRef } from "react";
import { Download, Printer, UserRound } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function IDCardModal({
  open,
  onClose,
  name,
  subtitle,
  photoUrl,
  qrDataUrl,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  subtitle: string;
  photoUrl: string | null;
  qrDataUrl: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, "_")}_ID_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Modal open={open} onClose={onClose} title="Hospital ID Card">
      <div className="flex flex-col items-center">
        <div
          ref={cardRef}
          className="id-card-print w-72 rounded-xl border-2 border-clinical-700 overflow-hidden bg-white"
        >
          <div className="bg-clinical-700 text-white text-center py-3 px-3">
            <p className="text-[10px] tracking-[0.15em] uppercase opacity-80">Hospital ID Card</p>
            <p className="font-display text-base leading-tight mt-0.5">OPD Mirpur Mathelo</p>
          </div>
          <div className="flex flex-col items-center px-5 py-5">
            <div className="h-20 w-20 rounded-full border-2 border-clinical-200 overflow-hidden bg-clinical-50 flex items-center justify-center mb-3 shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <UserRound size={30} className="text-clinical-300" />
              )}
            </div>
            <p className="font-display text-lg text-ink text-center leading-tight">{name}</p>
            <p className="text-xs text-clinical-600 text-center mb-4">{subtitle}</p>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR code" className="h-28 w-28" />
            )}
            <p className="text-[10px] text-slate-400 mt-2 tracking-wide">SCAN FOR ATTENDANCE</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5 no-print">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 text-xs border border-clinical-300 hover:bg-clinical-50 text-clinical-700 font-medium py-2 px-3 rounded-md transition-colors"
          >
            <Download size={14} /> Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs bg-clinical-700 hover:bg-clinical-800 text-white font-medium py-2 px-3 rounded-md transition-colors"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </Modal>
  );
}
