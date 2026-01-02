"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";
import type { PartnerSession } from "@/components/partners/PartnerSessionsSection";

export default function PartnerSessionCard({
  session,
  onBook,
}: {
  session: PartnerSession;
  onBook: (s: PartnerSession) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDiscount = !!session.discountCode;

  const MAX_LENGTH = 150;
  const description = session.description || "";
  const shouldTruncate = description.length > MAX_LENGTH;
  const displayedDescription =
    isExpanded || !shouldTruncate
      ? description
      : `${description.slice(0, MAX_LENGTH)}...`;

  return (
    <div className="bg-creamey border border-lovely rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={session.imageUrl}
          alt={session.title}
          fill
          className="object-cover"
        />
        {/* {hasDiscount && (
          <div className="absolute top-3 left-3 bg-lovely text-creamey text-xs px-3 py-1 rounded-full">
            10% OFF
          </div>
        )} */}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold w-4/5 text-lovely">
            {session.title}
          </h3>
          <span className="text-lovely  font-medium">EGP {session.price}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className={`${thirdFont.className} text-sm text-lovely/70`}>
            By {session.partnerName}
          </p>
          {session.sessionType && (
            <span className="text-xs font-medium text-lovely border border-lovely bg-creamey px-2 py-1 rounded-full capitalize">
              {session.sessionType}
            </span>
          )}
        </div>
        <div className="mt-2 mb-4">
          <p className="text-lovely/90 inline">{displayedDescription}</p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-lovely font-semibold ml-1 hover:underline text-sm inline-block"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}
        </div>
        <Button
          className="mt-auto w-full bg-lovely text-creamey hover:bg-lovely/90 rounded-2xl"
          onClick={() => onBook(session)}
        >
          Book Session
        </Button>
      </div>
    </div>
  );
}
