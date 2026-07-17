import { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormField({ label, id, ...props }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-ink placeholder:text-slate-400 focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500 outline-none transition-colors"
      />
    </div>
  );
}
