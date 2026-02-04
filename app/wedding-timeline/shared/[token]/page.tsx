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

type TimelineEvent = {
  id: string;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  duration: number;
  timeLabel?: string;
};

export default function SharedTimelinePage() {
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
        setError("Invalid share link");
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
          setEvents(data.data.events || []);
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
      const { default: jsPDF, GState } = (await import("jspdf")) as any;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // Set Page Background (Creamey)
      doc.setFillColor("#FBF3E0");
      doc.rect(
        0,
        0,
        doc.internal.pageSize.width,
        doc.internal.pageSize.height,
        "F"
      );

      // Add Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#D32333"); // Lovely
      doc.text("Wedding Day Timeline", 14, 20);

      // Define columns
      const tableColumn = [
        "Time",
        "Duration",
        "Bride",
        "Groom",
        "Bridesmaids",
        "Groomsmen",
      ];

      // Define rows
      const tableRows = events.map((event) => [
        event.timeLabel || "",
        event.duration + " min",
        event.brideActivity,
        event.groomActivity,
        event.bridesmaidsActivity,
        event.groomsmenActivity,
      ]);

      // Add Table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: "#D32333", // Lovely
          fillColor: "#FFB6C7", // Pinkey
          lineColor: "#D32333", // Lovely
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: "#D32333", // Lovely
          textColor: "#FFFFFF", // White
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: "#FFC2D1",
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: "bold" }, // Time
          1: { cellWidth: 20, halign: "center" }, // Duration
        },
      });

      // Add Watermark to all pages
      const logoUrl = "/logo/Wifey for Lifey Primary Logo with Slogan Red.png";
      const watermarkImg = new Image();
      watermarkImg.src = logoUrl;

      await new Promise((resolve, reject) => {
        watermarkImg.onload = resolve;
        watermarkImg.onerror = reject;
      });

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const wmWidth = 120;
        const wmHeight = (watermarkImg.height * wmWidth) / watermarkImg.width;
        const x = (doc.internal.pageSize.getWidth() - wmWidth) / 2;
        const y = (doc.internal.pageSize.getHeight() - wmHeight) / 2;

        (doc as any).saveGraphicsState();
        doc.setGState(new GState({ opacity: 0.1 }));
        doc.addImage(watermarkImg, "PNG", x, y, wmWidth, wmHeight);
        (doc as any).restoreGraphicsState();
      }

      doc.save("wedding-timeline.pdf");

      toast({
        title: "Success",
        description: "Timeline exported as PDF!",
      });
    } catch (error) {
      console.error("Export failed", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
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
              Wedding Day Timeline
            </h1>
            <p className="text-white/80 text-sm mt-2">
              Shared with love <Heart className="inline h-4 w-4 fill-white" />
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
              Export PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full relative">
            <TableHeader className="bg-lovely sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-lovely">
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 w-24 md:w-auto">
                  TIME
                </TableHead>
                <TableHead className="text-center text-white text-xs md:text-sm p-1 md:p-4 w-16 md:w-auto">
                  Duration (min)
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4">
                  <div className="md:hidden">
                    <Select
                      value={mobileActiveColumn}
                      onValueChange={setMobileActiveColumn}
                    >
                      <SelectTrigger className="h-6 text-xs bg-transparent border-none text-white p-0 focus:ring-0 focus:ring-offset-0 font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brideActivity">Bride</SelectItem>
                        <SelectItem value="groomActivity">Groom</SelectItem>
                        <SelectItem value="bridesmaidsActivity">
                          Bridesmaids
                        </SelectItem>
                        <SelectItem value="groomsmenActivity">
                          Groomsmen
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="hidden md:inline">BRIDE</span>
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell">
                  GROOM
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell">
                  BRIDESMAIDS
                </TableHead>
                <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell">
                  GROOMSMEN
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
                      {event.timeLabel}
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
