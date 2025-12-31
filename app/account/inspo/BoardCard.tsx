"use client";

import { CldImage } from "next-cloudinary";
import { MoreHorizontal, Share } from "lucide-react";

interface BoardCardProps {
  title: string;
  pinCount?: number;
  sectionCount?: number;
  coverImages: string[];
  onClick: () => void;
}

const BoardCard = ({
  title,
  pinCount,
  sectionCount,
  coverImages,
  onClick,
}: BoardCardProps) => {
  return (
    <div className="flex flex-col gap-2 cursor-pointer group" onClick={onClick}>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 flex gap-[1px]">
        {/* Main Image (Left) */}
        <div className="w-2/3 relative h-full bg-gray-200">
          {coverImages[0] && (
            <CldImage
              src={coverImages[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="50vw"
            />
          )}
        </div>

        {/* Right Column (2 Images) */}
        <div className="w-1/3 flex flex-col gap-[1px]">
          <div className="relative h-1/2 bg-gray-200">
            {coverImages[1] && (
              <CldImage
                src={coverImages[1]}
                alt={title}
                fill
                className="object-cover"
                sizes="25vw"
              />
            )}
          </div>
          <div className="relative h-1/2 bg-gray-200">
            {coverImages[2] && (
              <CldImage
                src={coverImages[2]}
                alt={title}
                fill
                className="object-cover"
                sizes="25vw"
              />
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-lg text-lovely truncate">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-lovely/70">
          {pinCount !== undefined && <span>{pinCount} Inspos</span>}
          {sectionCount !== undefined && (
            <>
              <span>•</span>
              <span>{sectionCount} Sections</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardCard;
