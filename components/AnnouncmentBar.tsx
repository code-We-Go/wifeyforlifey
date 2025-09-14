import React from "react";

interface AnnouncmentBarProps {
  announcementBar: string;
}

const AnnouncmentBar = ({ announcementBar }: AnnouncmentBarProps) => {
  return (
    <div className="bg-pinkey flex justify-center items-center min-h-8 h-auto px-2 md:px-4 py-1 text-lovely">
      <p className="text-center font-medium">{announcementBar}</p>
    </div>
  );
};

export default AnnouncmentBar;
