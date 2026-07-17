import { ButtonHTMLAttributes } from "react";
import { classNames } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  loading,
  variant = "primary",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-clinical-700 hover:bg-clinical-800 text-white",
    secondary: "border border-clinical-300 hover:bg-clinical-50 text-clinical-700",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
  };

  return (
    <button
      className={classNames(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
