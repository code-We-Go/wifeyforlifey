"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { thirdFont } from "@/fonts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

//Define the Event type
type TimelineEvent = {
  id: string;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  duration: number; // minutes
  timeLabel?: string;
  isBreak?: boolean;
};

// Sortable Row Component
function SortableRow({
  event,
  index,
  handleDurationChange,
  handleActivityChange,
  handleDeleteEvent,
}: {
  event: TimelineEvent;
  index: number;
  handleDurationChange: (index: number, val: string) => void;
  handleActivityChange: (
    index: number,
    field: keyof TimelineEvent,
    val: string
  ) => void;
  handleDeleteEvent: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`hover:bg-pinkey w-full cursor-grab active:cursor-grabbing ${
        event.isBreak ? "bg-pinkey/30" : "bg-pinkey/60"
      } ${isDragging ? "opacity-50 shadow-lg bg-pinkey/80" : ""}`}
    >
      <TableCell className="font-medium whitespace-nowrap text-sm ">
        {/* <div className="flex flex-col items-center gap-1 mr-2">
          <div
            className="cursor-grab hover:bg-black/10 p-1 rounded active:cursor-grabbing outline-none"
          >
            <GripVertical className="h-5 w-5 text-lovely/70" />
          </div>
        </div> */}
        <span className="bg-pinkey/20 px-2 py-1 rounded text-lovely font-semibold block text-center mt-1">
          {event.timeLabel}
        </span>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={event.duration}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => handleDurationChange(index, e.target.value)}
          className="w-20 bg-creamey text-center h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          value={event.brideActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "brideActivity", e.target.value)
          }
          className={`h-8 bg-transparent border-none focus:bg-white focus:border-input ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell>
        <Input
          value={event.groomActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomActivity", e.target.value)
          }
          className={`h-8 bg-transparent border-none focus:bg-white focus:border-input ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell>
        <Input
          value={event.bridesmaidsActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "bridesmaidsActivity", e.target.value)
          }
          className={`h-8 bg-transparent border-none focus:bg-white focus:border-input ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell>
        <Input
          value={event.groomsmenActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomsmenActivity", e.target.value)
          }
          className={`h-8 bg-transparent border-none focus:bg-white focus:border-input ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => handleDeleteEvent(index)}
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Define Feature Meta for ordering and labels
const FEATURE_META: Record<
  string,
  {
    label: string;
    bride: string;
    groom: string;
    bridesmaids: string;
    groomsmen: string;
    order: number;
  }
> = {
  makeup: {
    label: "Makeup",
    bride: "Makeup",
    groom: "Relaxing",
    bridesmaids: "Getting Ready",
    groomsmen: "Relaxing",
    order: 1,
  },
  hair: {
    label: "Hair & Veil",
    bride: "Hair Styling",
    groom: "Getting Ready",
    bridesmaids: "Helping Bride",
    groomsmen: "Getting Ready",
    order: 2,
  },
  getting_ready: {
    label: "Getting ready pictures",
    bride: "Getting Ready Photos",
    groom: "Getting Ready Photos",
    bridesmaids: "Photos",
    groomsmen: "Photos",
    order: 3,
  },
  first_look: {
    label: "First look",
    bride: "First Look",
    groom: "First Look",
    bridesmaids: "Watching",
    groomsmen: "Watching",
    order: 4,
  },
  photoshoot: {
    label: "Photoshoot",
    bride: "Couple Photoshoot",
    groom: "Couple Photoshoot",
    bridesmaids: "Group Photos",
    groomsmen: "Group Photos",
    order: 5,
  },
  zaffa: {
    label: "Zaffa",
    bride: "Zaffa / Entrance",
    groom: "Zaffa / Entrance",
    bridesmaids: "Procession",
    groomsmen: "Procession",
    order: 6,
  },
  entrance: {
    label: "Entrance",
    bride: "Grand Entrance",
    groom: "Grand Entrance",
    bridesmaids: "Entrance",
    groomsmen: "Entrance",
    order: 7,
  },
  katb_ketab: {
    label: "Katb Ketab",
    bride: "Katb Ketab Ceremony",
    groom: "Katb Ketab Ceremony",
    bridesmaids: "Attending",
    groomsmen: "Attending",
    order: 8,
  },
  dinner: {
    label: "Dinner",
    bride: "Dinner",
    groom: "Dinner",
    bridesmaids: "Dinner",
    groomsmen: "Dinner",
    order: 9,
  },
};

// Helper to format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

function TimelineEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [zaffaTimeStr, setZaffaTimeStr] = useState("18:00");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Parse params and generate timeline
  useEffect(() => {
    const initializeTimeline = async () => {
      // 1. Try to fetch existing timeline from DB if authenticated
      if (isAuthenticated && !authLoading) {
        try {
          const res = await fetch("/api/wedding-timeline");
          if (res.ok) {
            const data = await res.json();
            if (data.found && data.data && data.data.events?.length > 0) {
              setEvents(data.data.events);
              if (data.data.zaffaTime) setZaffaTimeStr(data.data.zaffaTime);
              return; // Stop here, don't use params
            }
          }
        } catch (error) {
          console.error("Error fetching timeline:", error);
        }
      }

      // 2. Fallback: Generate from URL params
      const zaffaParam = searchParams.get("zaffa");
      const featuresParam = searchParams.get("features");

      if (zaffaParam && featuresParam) {
        setZaffaTimeStr(zaffaParam);
        const featureList = featuresParam
          .split(",")
          .filter((f) => !f.startsWith("break_") && !f.includes("break")) // Filter out breaks from params
          .map((f) => {
            const [id, duration] = f.split(":");
            return { id, duration: parseInt(duration) };
          });

        // Sort features based on predefined order
        featureList.sort((a, b) => {
          const orderA = FEATURE_META[a.id]?.order || 99;
          const orderB = FEATURE_META[b.id]?.order || 99;
          return orderA - orderB;
        });

        // Generate Events with Breaks
        const generatedEvents: TimelineEvent[] = [];

        featureList.forEach((feature, index) => {
          const meta = FEATURE_META[feature.id] || {
            label: feature.id,
            bride: "",
            groom: "",
            bridesmaids: "",
            groomsmen: "",
          };

          generatedEvents.push({
            id: feature.id,
            duration: feature.duration,
            brideActivity: meta.bride,
            groomActivity: meta.groom,
            bridesmaidsActivity: meta.bridesmaids,
            groomsmenActivity: meta.groomsmen,
          });

          // Add break if not the last event
          if (index < featureList.length - 1) {
            generatedEvents.push({
              id: `break_${index}`,
              duration: 15,
              brideActivity: "Break / Transition",
              groomActivity: "Break / Transition",
              bridesmaidsActivity: "Break / Transition",
              groomsmenActivity: "Break / Transition",
              isBreak: true,
            });
          }
        });

        setEvents(generatedEvents);
      } else {
        // 3. No DB plan and no Params -> Redirect to wizard
        router.push("/wedding-timeline");
      }
    };

    if (!authLoading) {
      initializeTimeline();
    }
  }, [searchParams, isAuthenticated, authLoading, router]);

  // Calculate Times based on Zaffa Anchor
  const calculatedEvents = (() => {
    if (events.length === 0) return [];

    // 1. Find Zaffa Event Index
    const zaffaIndex = events.findIndex((e) => e.id === "zaffa");

    // Create base date for Zaffa
    const [hours, minutes] = zaffaTimeStr.split(":").map(Number);
    const zaffaDate = new Date();
    zaffaDate.setHours(hours, minutes, 0, 0);

    const result = [...events];
    const times: { start: Date; end: Date }[] = new Array(result.length);

    if (zaffaIndex !== -1) {
      // Set Zaffa Time
      times[zaffaIndex] = {
        start: zaffaDate,
        end: addMinutes(zaffaDate, result[zaffaIndex].duration),
      };

      // Work Backwards
      for (let i = zaffaIndex - 1; i >= 0; i--) {
        const nextStart = times[i + 1].start;
        const end = nextStart; // Previous event ends when next starts (no gap logic here because breaks are explicit events)
        const start = addMinutes(end, -result[i].duration);
        times[i] = { start, end };
      }

      // Work Forwards
      for (let i = zaffaIndex + 1; i < result.length; i++) {
        const prevEnd = times[i - 1].end;
        const start = prevEnd;
        const end = addMinutes(start, result[i].duration);
        times[i] = { start, end };
      }
    } else {
      // Fallback if no Zaffa: Start at 12:00 PM or ZaffaTime
      let currentTime = zaffaDate;
      for (let i = 0; i < result.length; i++) {
        const start = currentTime;
        const end = addMinutes(start, result[i].duration);
        times[i] = { start, end };
        currentTime = end;
      }
    }

    // Attach time labels
    return result.map((e, i) => ({
      ...e,
      timeLabel: `${formatTime(times[i].start)} - ${formatTime(times[i].end)}`,
    }));
  })();

  // Auto-Save Logic
  useEffect(() => {
    const shouldAutoSave =
      isAuthenticated &&
      !authLoading &&
      !hasAutoSaved &&
      calculatedEvents.length > 0 &&
      searchParams.get("zaffa"); // Only auto-save if we have params (newly generated)

    if (shouldAutoSave) {
      handleSave(true);
      setHasAutoSaved(true);
    }
  }, [
    isAuthenticated,
    authLoading,
    hasAutoSaved,
    calculatedEvents,
    searchParams,
  ]);

  const handleDurationChange = (index: number, newDuration: string) => {
    const duration = parseInt(newDuration) || 0;
    const newEvents = [...events];
    newEvents[index].duration = duration;
    setEvents(newEvents);
  };

  const handleActivityChange = (
    index: number,
    field: keyof TimelineEvent,
    value: string
  ) => {
    const newEvents = [...events];
    (newEvents[index] as any)[field] = value;
    setEvents(newEvents);
  };

  const handleAddNewEvent = () => {
    const newEvent: TimelineEvent = {
      id: `new_${Date.now()}`,
      duration: 30,
      brideActivity: "New Activity",
      groomActivity: "",
      bridesmaidsActivity: "",
      groomsmenActivity: "",
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (index: number) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  };

  const handleSave = async (silent = false) => {
    if (!isAuthenticated && !silent) {
      toast({
        title: "Login Required",
        description: "Please login to save your timeline.",
        variant: "destructive",
      });
      return;
    }

    if (!silent) setIsSaving(true);

    try {
      // Reconstruct selectedFeatures from events (approximate) or params
      // Better to just save what we have
      const response = await fetch("/api/wedding-timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zaffaTime: zaffaTimeStr,
          selectedFeatures: events
            .filter(
              (e) =>
                !e.isBreak &&
                !e.id.startsWith("break_") &&
                !e.id.includes("break")
            )
            .map((e) => ({
              name: e.id,
              duration: e.duration,
              enabled: true,
            })),
          events: calculatedEvents.map((e) => ({
            id: e.id,
            brideActivity: e.brideActivity,
            groomActivity: e.groomActivity,
            bridesmaidsActivity: e.bridesmaidsActivity,
            groomsmenActivity: e.groomsmenActivity,
            duration: e.duration,
            timeLabel: e.timeLabel,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      if (!silent) {
        toast({
          title: "Success",
          description: "Your timeline has been saved!",
        });
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to save timeline. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

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
      doc.text("Your Wedding Day Planner", 14, 20);

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
      const tableRows = calculatedEvents.map((event) => [
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
          fillColor: "#FFC2D1", // Slightly lighter/different pink if needed, or keep same
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: "bold" }, // Time
          1: { cellWidth: 20, halign: "center" }, // Duration
        },
        didDrawPage: (data) => {
          // Watermark Logic
          const logoUrl =
            "/logo/Wifey for Lifey Primary Logo with Slogan Red.png";
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = doc.internal.pageSize.getHeight();

          // We can't easily load image async inside didDrawPage hook in a simple way without pre-loading
          // But since we are inside an async function wrapper, we can't await here easily for the image load *per page* if it wasn't preloaded.
          // However, we can add the image *after* the table is drawn to all pages, or preload it.
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

  return (
    <div className="min-h-screen bg-creamey p-4 md:p-8">
      <div
        ref={contentRef}
        className="max-w-7xl mx-auto  rounded-lg shadow-xl overflow-hidden border-4 border-pinkey"
      >
        <div className="p-6 bg-lovely border-b border-pinkey/20 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1
              className={`${thirdFont.className} text-4xl font-display text-white`}
            >
              Your Wedding Day planner
            </h1>
            {/* <p className="text-lovely">
              Zaffa Time:{" "}
              <span className="font-semibold text-lovely">
                {zaffaTimeStr}
              </span>
            </p> */}
          </div>
          <div className="flex  gap-2">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="bg-creamey border-2 border-lovely text-lovely hover:bg-lovely hover:text-white"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export PDF
            </Button>
            {/* <Button
              className="bg-creamey text-lovely"
              variant="outline"
              asChild
            >
              <Link href="/wedding-timeline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Restart
              </Link>
            </Button> */}
            <Button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-lovely border-2 border-creamey text-white hover:bg-pinkey"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table className="w-full relative">
              <TableHeader className="bg-lovely sticky top-0 z-10 shadow-sm">
                <TableRow className="hover:bg-lovely">
                  <TableHead className="] font-bold text-white">TIME</TableHead>
                  <TableHead className="] text-cente text-white">
                    Duration (min)
                  </TableHead>
                  <TableHead className="font-bold text-white">BRIDE</TableHead>
                  <TableHead className="font-bold text-white">GROOM</TableHead>
                  <TableHead className="font-bold text-white">
                    BRIDESMAIDS
                  </TableHead>
                  <TableHead className="font-bold text-white">
                    GROOMSMEN
                  </TableHead>
                  <TableHead className=""></TableHead>
                  {/* <TableHead className=""></TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody className="text-lovely">
                <SortableContext
                  items={calculatedEvents.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {calculatedEvents.map((event, index) => (
                    <SortableRow
                      key={event.id}
                      event={event}
                      index={index}
                      handleDurationChange={handleDurationChange}
                      handleActivityChange={handleActivityChange}
                      handleDeleteEvent={handleDeleteEvent}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div
          className="p-4 border-t border-pinkey/20 bg-creamey/20"
          data-html2canvas-ignore="true"
        >
          <Button
            onClick={handleAddNewEvent}
            variant="secondary"
            className="w-full bg-lovely text-white border-dashed border-2 border-pinkey/40  hover:bg-pinkey/10 hover:text-lovely hover:border-pinkey"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Event
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WeddingTimelinePlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TimelineEditor />
    </Suspense>
  );
}
