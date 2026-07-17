"use client";

import { useRef } from "react";
import { UserRound, Upload, X } from "lucide-react";

export default function PhotoUpload({
  value,
  onChange,
  label = "Photo (optional)",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-clinical-50 border border-clinical-200 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={26} className="text-clinical-300" />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs border border-clinical-300 hover:bg-clinical-50 text-clinical-700 font-medium py-2 px-3 rounded-md transition-colors"
        >
          <Upload size={14} /> {value ? "Change photo" : "Upload photo"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline"
          >
            <X size={14} /> Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
