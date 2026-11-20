"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Heart } from "lucide-react";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";
import { useTranslations, useLocale } from "next-intl";
import { localizeEvent, formatTimelineTimeLabel } from "@/lib/wedding-timeline-localization";
import { exportTimelinePDF } from "@/lib/timelinePdfExport";

type TimelineEvent = {
  id: string;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  duration: number;
  timeLabel?: string;
  translations?: any;
};

export default function SharedTimelinePage() {
  const t = useTranslations("weddingTimeline");
  const locale = useLocale();
  const params = useParams();
  const token = params?.token as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileActiveColumn, setMobileActiveColumn] = useState("brideActivity");

  useEffect(() => {
    const fetchSharedTimeline = async () => {
      if (!token) {
        setError(locale === "ar" ? "رابط المشاركة غير صالح" : "Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/wedding-timeline?token=${token}`
        );

        if (!res.ok) {
          throw new Error("Timeline not found");
        }

        const data = await res.json();
        if (data.success && data.data) {
          const rawEvents = (data.data.events || []) as TimelineEvent[];
          setEvents(rawEvents.map((e) => localizeEvent(e, locale)));
        } else {
          throw new Error("Invalid timeline data");
        }
      } catch (err: any) {
        console.error("Error fetching shared timeline:", err);
        setError(err.message || "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTimeline();
  }, [token]);

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      await exportTimelinePDF({
        events,
        locale,
      });

      toast({
        title: locale === "ar" ? "تم بنجاح" : "Success",
        description:
          locale === "ar"
            ? "تم تحميل ملف الـ PDF بنجاح!"
            : "Timeline exported as PDF!",
      });
    } catch (error) {
      console.error("Export failed", error);
      toast({
        title: locale === "ar" ? "فشل التحميل" : "Export Failed",
        description:
          locale === "ar"
            ? "تعذر إنشاء ملف الـ PDF. يرجى المحاولة مرة أخرى."
            : "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] bg-creamey flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lovely" />
          <p className="text-lovely text-lg">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[85vh] bg-creamey flex items-center justify-center p-8">
        <div className="bg-white border-4 border-lovely p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Heart className="h-16 w-16 text-lovely mx-auto mb-4" />
          <h1 className={`${thirdFont.className} text-3xl text-lovely mb-4`}>
            Oops!
          </h1>
          <p className="text-lovely/70 mb-6">{error}</p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-pinkey hover:bg-pinkey/90 text-lovely"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-creamey p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full rounded-lg shadow-xl overflow-hidden border-4 border-pinkey">
        <div className="p-6 bg-lovely border-b border-pinkey/20 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1
              className={`${thirdFont.className} text-3xl md:text-4xl font-display text-white`}
            >
              {t("sharedTimelineTitle")}
            </h1>
            <p className="text-white/80 text-sm mt-2">
              {locale === "ar" ? "مشارك بكل حب" : "Shared with love"} <Heart className="inline h-4 w-4 fill-white" />
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {t("exportPdf")}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full relative">
            <TableHeader className="bg-lovely sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-lovely">
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 w-24 md:w-auto text-center">
                  {t("time")}
                </TableHead>
                <TableHead className="text-center text-white text-xs md:text-sm p-1 md:p-4 w-16 md:w-auto">
                  {t("duration")}
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 text-center">
                  <div className="md:hidden">
                    <Select
                      value={mobileActiveColumn}
                      onValueChange={setMobileActiveColumn}
                    >
                      <SelectTrigger className="h-6 text-xs bg-transparent border-none text-white p-0 focus:ring-0 focus:ring-offset-0 font-bold uppercase text-center justify-center">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brideActivity">{t("bride")}</SelectItem>
                        <SelectItem value="groomActivity">{t("groom")}</SelectItem>
                        <SelectItem value="bridesmaidsActivity">
                          {t("bridesmaids")}
                        </SelectItem>
                        <SelectItem value="groomsmenActivity">
                          {t("groomsmen")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="hidden md:inline">{t("bride")}</span>
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                  {t("groom")}
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                  {t("bridesmaids")}
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                  {t("groomsmen")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-lovely">
              {events.map((event, index) => (
                <TableRow
                  key={event.id || index}
                  className="hover:bg-pinkey/40 bg-pinkey/60"
                >
                  <TableCell className="font-medium whitespace-nowrap text-sm md:text-base p-1 md:p-4">
                    <span className="bg-pinkey/20 px-1 md:px-2 py-1 rounded text-lovely font-semibold block text-center mt-1 text-xs md:text-sm">
                      {formatTimelineTimeLabel(event.timeLabel, locale)}
                    </span>
                  </TableCell>
                  <TableCell className="p-1 md:p-4 text-center font-semibold">
                    {event.duration}
                  </TableCell>
                  <TableCell
                    className={`p-1 md:p-4 ${
                      mobileActiveColumn === "brideActivity"
                        ? "table-cell"
                        : "hidden"
                    } md:table-cell`}
                  >
                    {event.brideActivity}
                  </TableCell>
                  <TableCell
                    className={`p-1 md:p-4 ${
                      mobileActiveColumn === "groomActivity"
                        ? "table-cell"
                        : "hidden"
                    } md:table-cell`}
                  >
                    {event.groomActivity}
                  </TableCell>
                  <TableCell
                    className={`p-1 md:p-4 ${
                      mobileActiveColumn === "bridesmaidsActivity"
                        ? "table-cell"
                        : "hidden"
                    } md:table-cell`}
                  >
                    {event.bridesmaidsActivity}
                  </TableCell>
                  <TableCell
                    className={`p-1 md:p-4 ${
                      mobileActiveColumn === "groomsmenActivity"
                        ? "table-cell"
                        : "hidden"
                    } md:table-cell`}
                  >
                    {event.groomsmenActivity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 bg-lovely border-t border-pinkey/20 text-center">
          <p className="text-white text-sm">
            Created with{" "}
            <Heart className="inline h-4 w-4 fill-white text-white" /> by
            Wifey for Lifey.
          </p>
        </div>
      </div>
    </div>
  );
}
