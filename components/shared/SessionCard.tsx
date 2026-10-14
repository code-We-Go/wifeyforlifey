import Image from "next/image";
import { Button } from "@/components/ui/button";

export function isSessionFullyBooked(session?: {
  sessionType?: string;
  maxCapacity?: number;
  bookings?: Array<any>;
}) {
  if (!session) return false;
  return Boolean(
    session.sessionType === "webinar" &&
      typeof session.maxCapacity === "number" &&
      session.maxCapacity > 0 &&
      (session.bookings?.length ?? 0) >= session.maxCapacity
  );
}

interface SessionCardProps {
  session: {
    _id: string;
    imageUrl: string;
    partnerName: string;
    title: string;
    sessionType?: string;
    maxCapacity?: number;
    bookings?: Array<any>;
  };
  discountBadge?: string | null;
  onDetailsClick: () => void;
  onBookClick: () => void;
}

export default function SessionCard({
  session,
  discountBadge,
  onDetailsClick,
  onBookClick,
}: SessionCardProps) {
  const isFullyBooked = isSessionFullyBooked(session);

  return (
    <div className="relative flex flex-col gap-1 md:gap-2 w-full max-w-lg h-full bg-creamey border-2 border-lovely rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Fully Booked Badge */}
      {isFullyBooked && (
        <div className="absolute top-3.5 left-3.5 z-20 bg-rose-600 text-white text-xs md:text-sm font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide">
          Fully Booked
        </div>
      )}

      {/* Discount Badge */}
      {discountBadge && (
        <div className="absolute top-3.5 right-3.5 z-20 bg-lovely text-creamey text-xs md:text-sm font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide">
          {discountBadge}
        </div>
      )}

      {/* Expert Image */}
      <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-lg flex-shrink-0">
        <div className="w-full h-full bg-creamey/30 relative">
          {session.imageUrl && (
            <Image
              src={session.imageUrl}
              alt={session.partnerName}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>

      {/* Expert Info */}
      <div className="flex flex-col justify-between flex-grow w-full text-left space-y-1 md:space-y-2">
        <div className="space-y-1">
          <p className="text-base md:text-lg text-lovely font-bold">
            {session.partnerName}
          </p>
          <p className="text-base md:text-lg font-medium text-lovely/60">
            {session.title}
          </p>
        </div>
        
        {/* Action Button */}
        <div className="flex text-sm flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={onDetailsClick}
            className="flex-1 bg-creamey border border-lovely text-lovely hover:bg-creamey/80 font-semibold rounded-md px-2 py-1 text-sm shadow-lg"
          >
            More Details
          </Button>
          {isFullyBooked ? (
            <Button
              disabled
              className="flex-[2] bg-gray-400 text-white font-semibold rounded-md px-2 py-1 text-sm shadow cursor-not-allowed opacity-80"
            >
              Fully Booked
            </Button>
          ) : (
            <Button
              onClick={onBookClick}
              className="flex-[2] bg-lovely hover:bg-lovely/90 text-white font-semibold rounded-md px-2 py-1 text-sm shadow-lg"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
