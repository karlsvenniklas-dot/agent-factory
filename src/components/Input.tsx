import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
  hideLabel?: boolean;
}

export function Input({
  label,
  helpText,
  error,
  hideLabel = false,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const descId = helpText || error ? `${inputId}-desc` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={hideLabel ? "sr-only" : "text-base font-semibold text-soil"}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={descId}
        aria-invalid={error ? true : undefined}
        className={[
          "w-full min-h-[56px] px-4 rounded-xl",
          "bg-white border-2 border-sand text-soil text-lg",
          "placeholder:text-bark/60",
          "transition-colors duration-150",
          "hover:border-forest-300",
          "focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200",
          "disabled:bg-linen-dark disabled:cursor-not-allowed",
          error ? "border-brick-600 ring-2 ring-brick-200" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {(helpText || error) && (
        <p
          id={descId}
          className={
            error ? "text-sm text-brick-700 font-medium" : "text-sm text-bark"
          }
        >
          {error ?? helpText}
        </p>
      )}
    </div>
  );
}
