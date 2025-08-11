"use client";
import AnnouncmentBar from "@/components/AnnouncmentBar";
import { useAnnouncement } from "@/context/announcementContext";

export default function ConditionalAnnouncmentBar() {
  const { announcementBar } = useAnnouncement();
  if (!announcementBar) return null;
  return <AnnouncmentBar announcementBar={announcementBar} />;
}
