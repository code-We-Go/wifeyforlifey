"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AnnouncementContextType {
  announcementBar: string;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  announcementBar: "",
});

export const useAnnouncement = () => useContext(AnnouncementContext);

export const AnnouncementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [announcementBar, setAnnouncementBar] = useState("");

  useEffect(() => {
    fetch("/api/banners/")
      .then((res) => res.json())
      .then((data) =>
        setAnnouncementBar(data.bannersData.announcementBar || "")
      );
  }, []);

  return (
    <AnnouncementContext.Provider value={{ announcementBar }}>
      {children}
    </AnnouncementContext.Provider>
  );
};
