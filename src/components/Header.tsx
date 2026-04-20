import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Enkel kyrktorns-logotyp som SVG
function KyrktornsLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Kyrktorns-silhuett */}
      <rect x="13" y="2" width="6" height="8" fill="#2D5016" rx="1" />
      <rect x="15" y="0" width="2" height="4" fill="#2D5016" rx="1" />
      <rect x="8" y="10" width="16" height="20" fill="#2D5016" rx="1" />
      <rect x="12" y="18" width="8" height="12" fill="#4A7C2E" rx="1" />
      <rect x="11" y="12" width="4" height="4" fill="#EBF2E5" rx="0.5" />
      <rect x="17" y="12" width="4" height="4" fill="#EBF2E5" rx="0.5" />
    </svg>
  );
}

interface ParticipantHeaderProps {
  displayName?: string | null;
  showBack?: boolean;
  backHref?: string;
}

export function ParticipantHeader({
  displayName,
  showBack = false,
  backHref = "/play",
}: ParticipantHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-linen-dark pt-safe">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-bark hover:bg-linen-dark hover:text-soil transition-colors focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
              aria-label="Tillbaka"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          )}
          <Link
            href="/play"
            className="flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none rounded-md"
          >
            <KyrktornsLogo size={28} />
            <span className="text-sm font-semibold text-forest-700">
              Tipspromenaden
            </span>
          </Link>
        </div>

        {displayName && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-forest-pale border-2 border-forest-200 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-xs font-bold text-forest-700">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 bg-forest-700 text-white pt-safe">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          <span className="text-lg font-bold">Admin</span>
          <span className="text-sm text-forest-300 ml-2 hidden sm:block">
            Tipspromenaden Kinnared
          </span>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-medium text-forest-200 hover:text-white hover:bg-forest-600 transition-colors focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
            aria-label="Logga ut"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:block">Logga ut</span>
          </button>
        </form>
      </div>
    </header>
  );
}
