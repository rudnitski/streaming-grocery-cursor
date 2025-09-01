"use client";
import React from "react";

interface ItemConfirmationCardProps {
  name: string;
  fadingOut?: boolean;
}

export default function ItemConfirmationCard({ name, fadingOut = false }: ItemConfirmationCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={[
          "glass-strong",
          "animate-scale-in",
          "pointer-events-none",
          "shadow-xl",
          "rounded-2xl",
          "p-4 sm:p-6",
          "w-[85%] max-w-sm",
          "opacity-100",
          fadingOut ? "opacity-0 transition-opacity duration-300 ease-in" : "",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-4">
          {/* Placeholder image/icon */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 4a1 1 0 00-1 1v1H4a1 1 0 100 2h1.09l1.28 7.69A3 3 0 009.33 19h6.84a3 3 0 002.96-2.47l1.11-6.22A1 1 0 0019.26 9H7V5a1 1 0 011-1h3a1 1 0 100-2H8a3 3 0 00-3 3v1H4a3 3 0 000 6h.3l.86 5.18A5 5 0 009.33 21h6.84a5 5 0 004.93-4.12l1.11-6.22A3 3 0 0019.26 7H9V5a1 1 0 00-1-1H7z" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="text-white font-semibold text-xl truncate">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
