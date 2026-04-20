"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    "inline-flex items-center justify-center gap-2",
    "min-h-[56px] px-8 rounded-xl",
    "bg-forest-600 text-white",
    "text-lg font-semibold",
    "shadow-button",
    "transition-all duration-150",
    "hover:bg-forest-700 hover:shadow-button-hover",
    "active:scale-95 active:shadow-none",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
  ].join(" "),

  secondary: [
    "inline-flex items-center justify-center gap-2",
    "min-h-[56px] px-8 rounded-xl",
    "bg-linen border-2 border-forest-600 text-forest-600",
    "text-lg font-semibold",
    "transition-all duration-150",
    "hover:bg-forest-pale hover:border-forest-700",
    "active:scale-95",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "inline-flex items-center justify-center gap-2",
    "min-h-[48px] px-6 rounded-lg",
    "text-forest-600 text-base font-medium",
    "underline underline-offset-2",
    "transition-all duration-150",
    "hover:text-forest-700 hover:bg-forest-pale",
    "active:scale-95",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none",
  ].join(" "),

  danger: [
    "inline-flex items-center justify-center gap-2",
    "min-h-[56px] px-8 rounded-xl",
    "bg-brick-600 text-white",
    "text-lg font-semibold",
    "transition-all duration-150",
    "hover:bg-brick-700",
    "active:scale-95",
    "focus-visible:ring-4 focus-visible:ring-brick-300 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),
};

export function Button({
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = variantClasses[variant];
  const width = fullWidth ? "w-full" : "";
  const combined = [base, width, className].filter(Boolean).join(" ");

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
      className={combined}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span>Laddar...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
