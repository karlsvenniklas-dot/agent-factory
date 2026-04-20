import type { ReactNode, HTMLAttributes } from "react";

type CardVariant = "default" | "success" | "error" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white rounded-2xl shadow-card p-6 border border-linen-dark",
  success:
    "bg-forest-pale border-2 border-forest-400 rounded-2xl shadow-card p-6 animate-pop",
  error:
    "bg-brick-pale border-2 border-brick-400 rounded-2xl shadow-card p-6 animate-shake",
  interactive: [
    "bg-white rounded-2xl shadow-card p-6 border border-linen-dark",
    "cursor-pointer",
    "hover:shadow-card-hover hover:border-forest-200",
    "transition-all duration-200",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none",
  ].join(" "),
};

export function Card({
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[variantClasses[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
