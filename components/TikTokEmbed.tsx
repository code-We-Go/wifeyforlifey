"use client";

import React from "react";
import { FaTiktok } from "react-icons/fa";

interface TikTokEmbedProps {
  url: string;
  caption?: string;
  locale?: string;
}

export const TikTokEmbed: React.FC<TikTokEmbedProps> = ({
  url,
  caption,
  locale = "en",
}) => {
  const isArabic = locale === "ar";

  if (!url) return null;

  // Extract TikTok video/photo ID
  const videoMatch = url.match(/\/video\/(\d+)/);
  const photoMatch = url.match(/\/photo\/(\d+)/);
  const idMatch = url.match(/(\d{15,})/);
  const videoId = videoMatch
    ? videoMatch[1]
    : photoMatch
    ? photoMatch[1]
    : idMatch
    ? idMatch[0]
    : "";

  if (!videoId) return null;

  // TikTok official HTML5 player URL (from TikTok oEmbed standard)
  const embedSrc = `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed&music_info=1&description=1&autoplay=0&muted=0`;

  return (
    <div
      className="my-8 flex flex-col items-center justify-center w-full"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-[340px] flex flex-col items-center">
        <div className="relative w-[325px] max-w-full overflow-hidden rounded-2xl shadow-lg border border-lovely/15 bg-black">
          <iframe
            src={embedSrc}
            width="325"
            height="580"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="w-full rounded-2xl"
            style={{
              aspectRatio: "9/16",
              minHeight: "540px",
              height: "580px",
            }}
          />
        </div>

        {/* Caption */}
        {caption && (
          <p className="mt-3 text-center text-xs md:text-sm text-lovely/80 font-medium max-w-sm">
            {caption}
          </p>
        )}

        {/* Direct link fallback */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-lovely/70 hover:text-lovely transition font-medium"
        >
          <FaTiktok className="h-3 w-3" />
          <span>{isArabic ? "مشاهدة على تيك توك" : "Watch on TikTok"}</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>
    </div>
  );
};

export default TikTokEmbed;
