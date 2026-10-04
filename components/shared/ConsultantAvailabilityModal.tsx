"use client";

import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Consultants that are temporarily unavailable until a given date.
 * Matching is done on `partnerName` (case/whitespace-insensitive).
 * Once `availableFrom` is reached the notice stops showing automatically.
 */
const CONSULTANT_AVAILABILITY: {
  partnerName: string;
  availableFrom: Date;
  label: string;
}[] = [
  {
    partnerName: "Sherry Louis",
    availableFrom: new Date("2026-10-18T00:00:00+03:00"),
    label: "18/10",
  },
];

const normalize = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

export type AvailabilityNotice = { partnerName: string; label: string };

export function getAvailabilityNotice(session: { partnerName?: string } | null): AvailabilityNotice | null {
  if (!session) return null;
  const name = normalize(session.partnerName);
  const entry = CONSULTANT_AVAILABILITY.find((c) => normalize(c.partnerName) === name);
  if (!entry || Date.now() >= entry.availableFrom.getTime()) return null;
  return { partnerName: session.partnerName || entry.partnerName, label: entry.label };
}

type Props = {
  notice: AvailabilityNotice | null;
  onClose: () => void;
  onContinue: () => void;
};

export default function ConsultantAvailabilityModal({ notice, onClose, onContinue }: Props) {
  if (!notice) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-creamey rounded-2xl w-full max-w-sm p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-16 h-16 bg-lovely/10 rounded-full flex items-center justify-center mb-4">
          <CalendarClock className="w-8 h-8 text-lovely" />
        </div>
        <h3 className="text-xl font-bold text-lovely mb-2">Heads up! 💕</h3>
        <p className="text-lovely/90 text-sm leading-relaxed mb-6">
          <span className="font-semibold">{notice.partnerName}</span> is available for sessions
          starting from <span className="font-bold">{notice.label}</span>. You can book now and
          your session will be scheduled after that date.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={onContinue}
            className="w-full bg-lovely hover:bg-lovely/90 text-creamey rounded-2xl"
          >
            Continue to booking
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full border-lovely text-lovely rounded-2xl"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
