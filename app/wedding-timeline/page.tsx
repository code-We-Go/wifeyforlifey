"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Clock,
  Loader2,
  Trash2,
  Save,
  Download,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";
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

// --- Types & Constants ---

type Feature = {
  id: string;
  label: string;
  defaultDuration: number;
  category: "before" | "zaffa" | "after"; // To help with ordering later
  hidden?: boolean;
};

const FEATURES: Feature[] = [
  { id: "makeup", label: "Makeup", defaultDuration: 105, category: "before" },
  { id: "hair", label: "Hair & Veil", defaultDuration: 60, category: "before" },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
  },
  {
    id: "dress_suit",
    label: "Wearing dress & suit",
    defaultDuration: 30,
    category: "before",
    hidden: true,
  },
  {
    id: "first_look",
    label: "First look",
    defaultDuration: 15,
    category: "before",
  },
  {
    id: "photoshoot",
    label: "Photoshoot",
    defaultDuration: 120,
    category: "before",
  },
  { id: "zaffa", label: "Zaffa", defaultDuration: 30, category: "zaffa" },
  { id: "entrance", label: "Entrance", defaultDuration: 20, category: "after" },
  {
    id: "katb_ketab",
    label: "Katb Ketab",
    defaultDuration: 45,
    category: "after",
  },
  { id: "dinner", label: "Dinner", defaultDuration: 60, category: "after" },
];

// Define Feature Meta for ordering and labels (used in Timeline generation)
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
  dress_suit: {
    label: "Wearing dress & suit",
    bride: "Wearing Dress",
    groom: "Wearing Suit",
    bridesmaids: "Helping Bride",
    groomsmen: "Helping Groom",
    order: 3.5,
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

// --- Helper Functions ---

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

const calculateTimeline = (events: TimelineEvent[], zaffaTimeStr: string) => {
  if (events.length === 0) return [];

  const zaffaIndex = events.findIndex((e) => e.id === "zaffa");
  const [hours, minutes] = zaffaTimeStr.split(":").map(Number);
  const zaffaDate = new Date();
  zaffaDate.setHours(hours, minutes, 0, 0);

  const result = [...events];
  const times: { start: Date; end: Date }[] = new Array(result.length);

  if (zaffaIndex !== -1) {
    times[zaffaIndex] = {
      start: zaffaDate,
      end: addMinutes(zaffaDate, result[zaffaIndex].duration),
    };

    for (let i = zaffaIndex - 1; i >= 0; i--) {
      const nextStart = times[i + 1].start;
      const end = nextStart;
      const start = addMinutes(end, -result[i].duration);
      times[i] = { start, end };
    }

    for (let i = zaffaIndex + 1; i < result.length; i++) {
      const prevEnd = times[i - 1].end;
      const start = prevEnd;
      const end = addMinutes(start, result[i].duration);
      times[i] = { start, end };
    }
  } else {
    let currentTime = zaffaDate;
    for (let i = 0; i < result.length; i++) {
      const start = currentTime;
      const end = addMinutes(start, result[i].duration);
      times[i] = { start, end };
      currentTime = end;
    }
  }

  return result.map((e, i) => ({
    ...e,
    timeLabel: `${formatTime(times[i].start)} - ${formatTime(times[i].end)}`,
  }));
};

// --- Sortable Row Component ---

function SortableRow({
  event,
  index,
  handleDurationChange,
  handleActivityChange,
  handleDeleteEvent,
  mobileActiveColumn,
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
  mobileActiveColumn: string;
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
      <TableCell className="font-medium whitespace-nowrap text-sm md:text-base p-1 md:p-4">
        <span className="bg-pinkey/20 px-1 md:px-2 py-1 rounded text-lovely font-semibold block text-center mt-1 text-xs md:text-sm">
          {event.timeLabel}
        </span>
      </TableCell>
      <TableCell className="p-1 md:p-4">
        <Input
          type="number"
          value={event.duration}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => handleDurationChange(index, e.target.value)}
          className="w-16 md:w-20 bg-creamey text-center h-6 md:h-8 text-xs md:text-sm p-1"
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 ${
          mobileActiveColumn === "brideActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Input
          value={event.brideActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "brideActivity", e.target.value)
          }
          className={`h-6 md:h-8 bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 ${
          mobileActiveColumn === "groomActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Input
          value={event.groomActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomActivity", e.target.value)
          }
          className={`h-6 md:h-8 bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 ${
          mobileActiveColumn === "bridesmaidsActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Input
          value={event.bridesmaidsActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "bridesmaidsActivity", e.target.value)
          }
          className={`h-6 md:h-8 bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 ${
          mobileActiveColumn === "groomsmenActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Input
          value={event.groomsmenActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomsmenActivity", e.target.value)
          }
          className={`h-6 md:h-8 bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
        />
      </TableCell>
      <TableCell className="p-1 md:p-4">
        <Button
          variant="ghost"
          size="icon"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => handleDeleteEvent(index)}
          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-6 w-6 md:h-8 md:w-8"
        >
          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// --- Main Page Component ---

function WeddingTimelinePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();

  // -- Wizard State --
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkingTimeline, setCheckingTimeline] = useState(false);
  const [zaffaTime, setZaffaTime] = useState("18:00");
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, { enabled: boolean; duration: number }>
  >(
    FEATURES.reduce(
      (acc, feature) => ({
        ...acc,
        [feature.id]: { enabled: true, duration: feature.defaultDuration },
      }),
      {}
    )
  );

  // -- Timeline Editor State --
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [mobileActiveColumn, setMobileActiveColumn] = useState("brideActivity");
  const contentRef = useRef<HTMLDivElement>(null);

  // -- Dnd Sensors --
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // -- Effects --

  // 1. Check for existing timeline on load
  useEffect(() => {
    const checkExistingTimeline = async () => {
      if (isAuthenticated && !loading) {
        setCheckingTimeline(true);
        try {
          const res = await fetch("/api/wedding-timeline");
          if (res.ok) {
            const data = await res.json();
            if (data.found && data.data) {
              // Existing plan found -> Load it and go to Step 3
              const { zaffaTime: savedZaffa, events: savedEvents } = data.data;
              if (savedZaffa) setZaffaTime(savedZaffa);
              if (savedEvents && savedEvents.length > 0) {
                setEvents(savedEvents);
                setStep(3);
              }
            }
          }
        } catch (error) {
          console.error("Error checking timeline:", error);
        } finally {
          setCheckingTimeline(false);
        }
      }
    };

    checkExistingTimeline();
  }, [isAuthenticated, loading]);

  // 2. Handle Drag End
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

  // 3. Calculated Events (Time Calculation)
  const calculatedEvents = calculateTimeline(events, zaffaTime);

  // 4. Auto-Save Logic (Only if newly generated and not yet saved)
  //   useEffect(() => {
  //     // We might want to be careful with auto-save to avoid overwriting accidentally
  //     // But if the user just created a plan, maybe we save it?
  //     // For now, let's leave manual save as primary, or auto-save if we are in Step 3 and changes happen?
  //     // Keeping it simple: Manual Save for now to avoid complexity in combined page.
  //   }, []);

  // -- Handlers --

  const handleFeatureToggle = (id: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const handleFeatureDurationChange = (id: string, duration: number) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: { ...prev[id], duration },
    }));
  };

  const saveToDb = async (
    currentEvents: TimelineEvent[],
    computedEvents: TimelineEvent[],
    currentZaffaTime: string,
    silent = false
  ) => {
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
      const response = await fetch("/api/wedding-timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zaffaTime: currentZaffaTime,
          selectedFeatures: currentEvents
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
          events: computedEvents.map((e) => ({
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

  const handlePlan = async () => {
    // 1. Generate Events from Selection
    const featureList = FEATURES.map((f) => ({
      id: f.id,
      label: f.label,
      category: f.category,
      enabled: selectedFeatures[f.id].enabled,
      duration: selectedFeatures[f.id].duration,
    })).filter((f) => f.enabled);

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

    // 2. Save to DB (Silent or not? User said "add a record", let's be explicit but not blocking)
    if (isAuthenticated) {
      // Calculate timeline for saving (since state 'events' is not updated yet in this closure)
      const computedEvents = calculateTimeline(generatedEvents, zaffaTime);
      await saveToDb(generatedEvents, computedEvents, zaffaTime, true);
    }

    // 3. Move to Step 3
    setStep(3);
  };

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
    // We pass the current state to the helper
    await saveToDb(events, calculatedEvents, zaffaTime, silent);
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
          fillColor: "#FFC2D1", // Slightly lighter/different pink if needed
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

  // --- Render ---

  // Layout wrapper changes based on step
  const isWizard = step === 1 || step === 2;

  return (
    <div
      className={`min-h-[85vh] h-auto bg-creamey flex flex-col ${
        isWizard ? "items-center justify-center p-8 md:pt-16" : "p-4 md:p-8"
      }`}
    >
      {/* Wizard Step 1 & 2 */}
      {isWizard && (
        <div className="bg-creamey border-lovely p-8 rounded-lg shadow-lg max-w-2xl w-full border-4 relative">
          <NextImage
            width={100}
            height={70}
            className="absolute -top-8 -rotate-45 -left-10 z-20"
            alt="fyonka"
            src={"/fyonkaCreamey.png"}
          />
          <h1
            className={`${thirdFont.className} text-4xl text-center mb-2 text-lovely `}
          >
            Your Wedding Day Planner
          </h1>

          {loading || checkingTimeline ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-lovely/70 mb-4" />
              <p className="text-muted-foreground">
                {checkingTimeline
                  ? "Checking for existing plan..."
                  : "Loading..."}
              </p>
            </div>
          ) : (
            <>
              {!isAuthenticated && step === 1 && (
                <div className="flex justify-center mb-6">
                  <Button
                    variant="link"
                    className="text-lovely/70 underline"
                    onClick={() =>
                      router.push("/login?callbackUrl=/wedding-timeline")
                    }
                  >
                    Already have a plan? Login to check
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xl text-lovely text-center block">
                      When does the Party start?
                    </Label>
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-xs">
                        <Input
                          type="time"
                          value={zaffaTime}
                          onChange={(e) => setZaffaTime(e.target.value)}
                          className="p-6 text-xl border-pinkey/30 focus:border-pinkey focus:ring-pinkey text-lovely/90 bg-creamey/20 text-center [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-lovely pointer-events-none z-20" />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-pinkey hover:bg-pinkey/90 text-lovely font-bold text-lg py-6 mt-8"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in  text-lovely fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xl  block mb-4">
                      Select your activities
                    </Label>
                    <p className="text-sm text-lovely/60 mb-4">
                      Select the activities you want to include and adjust their
                      duration (in minutes).
                    </p>

                    <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-2">
                      {FEATURES.filter((f) => !f.hidden).map((feature) => (
                        <div
                          key={feature.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                            selectedFeatures[feature.id].enabled
                              ? "bg-pinkey/20 border-pinkey/30"
                              : "bg-creamey border-pinkey opacity-70"
                          }`}
                        >
                          <Checkbox
                            id={feature.id}
                            checked={selectedFeatures[feature.id].enabled}
                            onCheckedChange={() =>
                              handleFeatureToggle(feature.id)
                            }
                            className="data-[state=checked]:bg-pinkey border-pinkey  border-2 data-[state=checked]:border-pinkey"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={feature.id}
                              className="text-base font-medium cursor-pointer"
                            >
                              {feature.label}
                            </Label>
                          </div>
                          {selectedFeatures[feature.id].enabled && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={selectedFeatures[feature.id].duration}
                                onChange={(e) =>
                                  handleFeatureDurationChange(
                                    feature.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-center h-8 bg-creamey border-pinkey"
                              />
                              <span className="text-xs  w-8">min</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-creamey text-lovely border-pinkey border-2 hover:text-lovely font-bold hover:bg-pinkey/10"
                    >
                      Prev step
                    </Button>
                    <Button
                      onClick={handlePlan}
                      disabled={loading}
                      className="flex-1 bg-pinkey hover:bg-pinkey/90  font-bold  text-lovely"
                    >
                      Plan My Day
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Timeline Editor Step 3 */}
      {step === 3 && (
        <div
          ref={contentRef}
          className="max-w-7xl mx-auto w-full rounded-lg shadow-xl overflow-hidden border-4 border-pinkey animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="p-6 bg-lovely border-b border-pinkey/20 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1
                className={`${thirdFont.className} text-4xl font-display text-white`}
              >
                Your Wedding Day planner
              </h1>
            </div>
            <div className="flex gap-2">
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
                onClick={() => setStep(2)}
                variant="outline"
                className="bg-creamey border-2 border-lovely text-lovely hover:bg-lovely hover:text-white"
              >
                Edit Activities
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
                    <TableHead className="w-8 md:w-auto p-1 md:p-4"></TableHead>
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
                        mobileActiveColumn={mobileActiveColumn}
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
      )}
    </div>
  );
}

export default function WeddingTimelinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WeddingTimelinePageContent />
    </Suspense>
  );
}
