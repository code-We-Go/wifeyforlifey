import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SessionCardProps {
  session: {
    _id: string;
    imageUrl: string;
    partnerName: string;
    title: string;
  };
  onDetailsClick: () => void;
  onBookClick: () => void;
}

export default function SessionCard({ session, onDetailsClick, onBookClick }: SessionCardProps) {
  return (
    <div className="flex flex-col gap-1 md:gap-2 w-full max-w-lg h-full bg-creamey border-2 border-lovely rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow">
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
        
        {/* <p 
          className="text-sm hover:cursor-pointer underline font-medium text-lovely/60"           
          onClick={onDetailsClick}
        >
          More Details
        </p> */}
        
        {/* Action Button */}
        <div className="flex text-sm flex-col sm:flex-row gap-3 w-full">
                  <p 
          className="text-sm hover:cursor-pointer underline font-medium text-lovely/60"           
          onClick={onDetailsClick}
        >
          More Details
        </p>
          <Button
            onClick={onBookClick}
            className="flex-1 bg-lovely hover:bg-lovely/90 text-white font-semibold rounded-md px-2 py-1 text-sm shadow-lg"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
