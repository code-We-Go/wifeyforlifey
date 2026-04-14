"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
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
  Share2,
  MessageSquare,
  X,
  Star,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  GripVertical,
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
import { Input } from "@/components/ui/input";
import {
  type CeremonyType,
  type CeremonyVariation,
  type WeddingFeature,
  CEREMONY_OPTIONS,
  FEATURES,
} from "@/lib/wedding-timeline-config";

// --- Types & Constants ---

// CEREMONY_OPTIONS and FEATURES are imported from @/lib/wedding-timeline-config
// They are also served via GET /api/wedding-timeline/config for mobile app consumption.



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

const calculateTimeline = (events: TimelineEvent[], zaffaTimeStr: string, anchorId: string = "zaffa") => {
  if (events.length === 0) return [];
// on Nareiman's Demandss the part starts => entrance
  const zaffaIndex = events.findIndex((e) => e.id === anchorId);
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

  const brideRef = useRef<HTMLTextAreaElement>(null);
  const groomRef = useRef<HTMLTextAreaElement>(null);
  const bridesmaidsRef = useRef<HTMLTextAreaElement>(null);
  const groomsmenRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas on mount and when content changes
  useEffect(() => {
    const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    };

    resizeTextarea(brideRef.current);
    resizeTextarea(groomRef.current);
    resizeTextarea(bridesmaidsRef.current);
    resizeTextarea(groomsmenRef.current);
  }, [event.brideActivity, event.groomActivity, event.bridesmaidsActivity, event.groomsmenActivity]);

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
      className={`hover:bg-pinkey w-full ${
        event.isBreak ? "bg-pinkey/50" : "bg-pinkey/60"
      } ${isDragging ? "opacity-50 shadow-lg bg-pinkey/80" : ""}`}
    >
      {/* Drag Handle Column */}
      <TableCell className="p-1 md:p-2 align-middle w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-lovely/60 hover:text-lovely flex items-center justify-center touch-none"
        >
          <GripVertical className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </TableCell>
      <TableCell className="font-medium text-sm md:text-base p-1 md:p-4 align-middle">
        <span className="bg-pinkey/20 px-1 md:px-2 py-1 rounded text-lovely font-semibold block text-center mt-1 text-xs md:text-sm break-words">
          {event.timeLabel}
        </span>
      </TableCell>
      <TableCell className="p-1 md:p-4 align-middle">
        <div className="flex justify-center items-center w-full">
          <Input
            type="number"
            value={event.duration}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => handleDurationChange(index, e.target.value)}
            className="w-10 md:w-14 bg-creamey text-center min-h-[1.5rem] md:min-h-[2rem] text-xs md:text-sm p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 align-middle ${
          mobileActiveColumn === "brideActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Textarea
          ref={brideRef}
          value={event.brideActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "brideActivity", e.target.value)
          }
          className={`min-h-[1.5rem] md:min-h-[2rem] bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 text-center resize-none overflow-hidden ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
          rows={1}
          style={{
            height: 'auto',
            lineHeight: '1.2',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 align-middle ${
          mobileActiveColumn === "groomActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Textarea
          ref={groomRef}
          value={event.groomActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomActivity", e.target.value)
          }
          className={`min-h-[1.5rem] md:min-h-[2rem] bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 text-center resize-none overflow-hidden ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
          rows={1}
          style={{
            height: 'auto',
            lineHeight: '1.2',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 align-middle ${
          mobileActiveColumn === "bridesmaidsActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Textarea
          ref={bridesmaidsRef}
          value={event.bridesmaidsActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "bridesmaidsActivity", e.target.value)
          }
          className={`min-h-[1.5rem] md:min-h-[2rem] bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 text-center resize-none overflow-hidden ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
          rows={1}
          style={{
            height: 'auto',
            lineHeight: '1.2',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </TableCell>
      <TableCell
        className={`p-1 md:p-4 align-middle ${
          mobileActiveColumn === "groomsmenActivity" ? "table-cell" : "hidden"
        } md:table-cell`}
      >
        <Textarea
          ref={groomsmenRef}
          value={event.groomsmenActivity}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleActivityChange(index, "groomsmenActivity", e.target.value)
          }
          className={`min-h-[1.5rem] md:min-h-[2rem] bg-transparent border-none focus:bg-white focus:border-input text-xs md:text-sm p-1 text-center resize-none overflow-hidden ${
            event.isBreak ? "text-lovely italic" : ""
          }`}
          rows={1}
          style={{
            height: 'auto',
            lineHeight: '1.2',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </TableCell>
      <TableCell className="p-1 md:p-4 align-middle">
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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeCeremonyType, setActiveCeremonyType] = useState<CeremonyType | null>(null);
  const [selectedCeremonyVariation, setSelectedCeremonyVariation] = useState<CeremonyVariation | null>(null);
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

  // -- Katb Ketab Only - Extra Questions State --
  // Q1: Where are you getting ready? "home" | "venue"
  const [gettingReadyLocation, setGettingReadyLocation] = useState<"home" | "venue" | null>(null);
  // Q2: Will bridesmaids come to preparations? "yes" | "no"
  const [bridesmaidsAtPrep, setBridesmaidsAtPrep] = useState<"yes" | "no" | null>(null);
  // Q3: Is photo session at same place as Katb Ketab? "yes" | "no"
  const [photoAtKatbLocation, setPhotoAtKatbLocation] = useState<"yes" | "no" | null>(null);

  // -- Names (optional, for PDF) --
  const [brideFirstName, setBrideFirstName] = useState("");
  const [groomFirstName, setGroomFirstName] = useState("");

  // -- Timeline Editor State --
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [mobileActiveColumn, setMobileActiveColumn] = useState("brideActivity");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // -- Share State --
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // -- Feedback State --
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState({
    easeOfUse: 5,
    satisfaction: 5,
  });
  const [feedbackTimeSaved, setFeedbackTimeSaved] = useState("");
  const [feedbackFeelings, setFeedbackFeelings] = useState<string[]>([]);
  const [feedbackRecommend, setFeedbackRecommend] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [showBlogSuggestion, setShowBlogSuggestion] = useState(false);

  // -- Tutorial State --
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // -- Reset State --
  const [showResetDialog, setShowResetDialog] = useState(false);

  // -- Options Modal State (for mobile) --
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // -- Helper for Anchor Event --
  const getAnchorEventId = (variation: CeremonyVariation | null) => {
    if (!variation) return "zaffa";
    
    // Christian variations always anchor to Church
    if (variation.startsWith("christian")) return "church";
    
    // Muslim variations
    if (variation === "muslim_katb_ketab_only") return "katb_ketab";
    
    // Default for muslim_katb_ketab_wedding and muslim_wedding_only
    return "zaffa"; 
  };
  
  const getAnchorLabel = (variation: CeremonyVariation | null) => {
    const anchorId = getAnchorEventId(variation);
    const feature = FEATURES.find(f => f.id === anchorId);
    return feature ? feature.label : "Wedding";
  };

  // Tutorial Steps
  const tutorialSteps = [
    {
      image: "/weddingPlanningToutorial/step1.gif",
      title: "Set Your Wedding Start Time",
      description: "Start by selecting when your wedding begins. This will be the anchor point for your entire timeline."
    },
    {
      image: "/weddingPlanningToutorial/2.gif",
      title: "Choose Your Features",
      description: "Select the activities you want to include in your wedding day and customize their duration to fit your schedule. (Note: this is our recommended timing but you still can change it later)"
    },
    {
      image: "/weddingPlanningToutorial/3.gif",
      title: "Drag and Drop Events",
      description: "Easily reorder your timeline by dragging and dropping events. Arrange your day exactly how you want it!"
    },
    {
      image: "/weddingPlanningToutorial/4.gif",
      title: "Mobile View Selector",
      description: "On mobile devices, use the dropdown selector to switch between viewing different personas (Bride, Groom, Bridesmaids, Groomsmen)."
    },
    {
      image: "/weddingPlanningToutorial/step5.gif",
      title: "Save, Share & Export",
      description: "Use these options to save your timeline, share it with your loved ones, or export it as a PDF for printing."
    }
  ];

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
              const { zaffaTime: savedZaffa, events: savedEvents, feedback } = data.data;
              if (savedZaffa) setZaffaTime(savedZaffa);
              if (savedEvents && savedEvents.length > 0) {
                setEvents(savedEvents);
                setStep(5);
              }
              // Check if user has already provided feedback
              // Only set hasFeedback to true if feedback exists and has actual data
              if (feedback && (feedback.easeOfUse > 0 || feedback.satisfaction > 0 || feedback.timeSaved || feedback.recommend || (feedback.feelings && feedback.feelings.length > 0))) {
                setHasFeedback(true);
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

  // 2. Show tutorial for first-time users when they reach step 5 (Timeline)
  useEffect(() => {
    const hasSeenStorage = localStorage.getItem("weddingTimelineTutorialSeen");
    if (step === 6 && !hasSeenTutorial && !hasSeenStorage) {
      // Small delay to let the timeline render first
      const timer = setTimeout(() => {
        setShowTutorial(true);
        setHasSeenTutorial(true);
        localStorage.setItem("weddingTimelineTutorialSeen", "true");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, hasSeenTutorial]);

  // 3. Handle step parameter from URL and restore zaffaTime after login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    
    if (stepParam === '2' && isAuthenticated && !checkingTimeline) {
      // Restore the saved zaffaTime from localStorage
      const pendingZaffaTime = localStorage.getItem('pendingZaffaTime');
      if (pendingZaffaTime) {
        setZaffaTime(pendingZaffaTime);
        localStorage.removeItem('pendingZaffaTime'); // Clean up
      }
      setStep(4);
      
      // Clean up the URL parameter
      window.history.replaceState({}, '', '/wedding-timeline');
    }
  }, [isAuthenticated, checkingTimeline]);

  // 4. Handle Drag End
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

  // 5. Calculated Events (Time Calculation)
  const calculatedEvents = calculateTimeline(events, zaffaTime, getAnchorEventId(selectedCeremonyVariation));

  // 6. Auto-Save Logic (Only if newly generated and not yet saved)
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
        className: "bg-pinkey text-lovely border-lovely",
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
          className: "bg-pinkey text-lovely border-lovely",
        });

        // Show feedback dialog if user hasn't provided feedback yet
        if (!hasFeedback) {
          setTimeout(() => setShowFeedbackDialog(true), 1000);
        }
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to save timeline. Please try again.",
          className: "bg-pinkey text-lovely border-lovely",
        });
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handlePlan = async () => {

    // 1. Generate Events from Selection
    // featureList keeps the full WeddingFeature shape (including .order and .activities)
    let featureList = FEATURES.filter(
      (f) =>
        !f.allowedVariations ||
        (selectedCeremonyVariation &&
          f.allowedVariations.includes(selectedCeremonyVariation))
    ).map((f) => ({
      ...f,
      enabled: selectedFeatures[f.id]?.enabled ?? true,
      duration: selectedFeatures[f.id]?.duration ?? f.defaultDuration,
    })).filter((f) => f.enabled || f.hidden); // Include if enabled OR hidden (mandatory)

    // -- Katb Ketab Only: Apply extra question answers --
    if (selectedCeremonyVariation === "muslim_katb_ketab_only") {
      // Q1: Remove "Arrival at the venue" if getting ready at home
      if (gettingReadyLocation === "home") {
        featureList = featureList.filter((f) => f.id !== "arrival");
      }
      // Q2: Remove getting_ready if bridesmaids won't attend
      if (bridesmaidsAtPrep === "no") {
        featureList = featureList.filter((f) => f.id !== "getting_ready");
      }
    }

    // Sort features based on their order field (from WeddingFeature)
    featureList.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    // Generate Events with Breaks
    const generatedEvents: TimelineEvent[] = [];

    featureList.forEach((feature, index) => {
      // Activities come directly from the merged WeddingFeature shape
      const acts = feature.activities ?? { bride: "", groom: "", bridesmaids: "", groomsmen: "" };

      // -- Katb Ketab Only overrides --
      const isKatbOnly = selectedCeremonyVariation === "muslim_katb_ketab_only";
      const isHomeKatbOnly = isKatbOnly && gettingReadyLocation === "home";
      const noBridesmaids = isKatbOnly && bridesmaidsAtPrep === "no";

      // Events where bridesmaids/groomsmen have no activity if they're not present
      const bridesmaidsEmptyFor = ["makeup", "dress_suit"];

      generatedEvents.push({
        id: feature.id,
        duration: feature.duration,
        brideActivity: acts.bride,
        groomActivity: isHomeKatbOnly && feature.id === "makeup" ? "" : acts.groom,
        bridesmaidsActivity:
          noBridesmaids && bridesmaidsEmptyFor.includes(feature.id) ? "" : acts.bridesmaids,
        groomsmenActivity: isHomeKatbOnly && feature.id === "makeup" ? "" : acts.groomsmen,
      });

      // -- Katb Ketab Only: after preparations (dress_suit) insert 30 min transport if getting ready at home --
      if (
        selectedCeremonyVariation === "muslim_katb_ketab_only" &&
        feature.id === "dress_suit" &&
        gettingReadyLocation === "home"
      ) {
        generatedEvents.push({
          id: "transport_to_photoshoot",
          duration: 30,
          brideActivity: "Transportation to Photoshoot Location",
          groomActivity: "Transportation to Photoshoot Location",
          bridesmaidsActivity: "Transportation to Photoshoot Location",
          groomsmenActivity: "Transportation to Photoshoot Location",
        });
      }

      // -- Katb Ketab Only: after photoshoot insert 30 min transport to mosque if different location --
      if (
        selectedCeremonyVariation === "muslim_katb_ketab_only" &&
        feature.id === "photoshoot" &&
        photoAtKatbLocation === "no"
      ) {
        generatedEvents.push({
          id: "transport_to_mosque",
          duration: 30,
          brideActivity: "Transportation to Mosque / Katb Ketab Location",
          groomActivity: "Transportation to Mosque / Katb Ketab Location",
          bridesmaidsActivity: "Transportation to Mosque / Katb Ketab Location",
          groomsmenActivity: "Transportation to Mosque / Katb Ketab Location",
        });
      }

      // Add break if not the last event AND not after zaffa, arrival, or any 'after' category events
    if (index < featureList.length - 1 && feature.id !== "zaffa" && feature.id !== "entrance" && feature.id !== "arrival" && feature.id !== "katb_ketab" && feature.id !== "church" && feature.id !== "moving_to_venue" && feature.id !== "Guest_Arrival" && feature.id !== "moving_to_church" && feature.id !== "Grand_Entrance" && feature.category !== "after") {
      const nextFeature = featureList[index + 1];
        const isBeforeGettingReady = nextFeature?.id === "getting_ready";
        
        generatedEvents.push({
          id: `break_${index}`,
          duration: 15,
          brideActivity: "Break / Transition",
          groomActivity: isBeforeGettingReady ? "Getting Ready Photos" : "Break / Transition",
          bridesmaidsActivity: "Break / Transition",
          groomsmenActivity: isBeforeGettingReady ? "Getting Ready Photos" : "Break / Transition",
          isBreak: true,
        });
      }
    });

    setEvents(generatedEvents);

    // 2. Save to DB
    if (isAuthenticated) {
      const computedEvents = calculateTimeline(generatedEvents, zaffaTime, getAnchorEventId(selectedCeremonyVariation));
      await saveToDb(generatedEvents, computedEvents, zaffaTime, true);
    }

    // 3. Move to Step 6
    setStep(6);
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

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to share your timeline.",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }

    setIsSharing(true);

    try {
      const response = await fetch("/api/wedding-timeline?action=share", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to get share link");

      const data = await response.json();
      
      if (data.success && data.shareUrl) {
        setShareUrl(data.shareUrl);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        
        toast({
          title: "Share Link Created!",
          description: "Link copied to clipboard. Share it with your loved ones!",
          className: "bg-pinkey text-lovely border-lovely",
        });

        // Show feedback dialog if user hasn't provided feedback yet
        if (!hasFeedback) {
          setTimeout(() => setShowFeedbackDialog(true), 1000);
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Share Failed",
        description: "Could not get share link. Please try again.",
        className: "bg-pinkey text-lovely border-lovely",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSubmitFeedback = async () => {
    // Validate ALL fields are filled in
    if (feedbackRatings.easeOfUse === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate how easy it was to create your timeline (Question 1).",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }
    if (feedbackRatings.satisfaction === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate how satisfied you are with how the day looks (Question 2).",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }
    if (!feedbackTimeSaved) {
      toast({
        title: "Selection Required",
        description: "Please select how much time you feel this tool saved you (Question 3).",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }
    if (feedbackFeelings.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one feeling about how this tool made you feel (Question 4).",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }
    if (!feedbackRecommend) {
      toast({
        title: "Selection Required",
        description: "Please let us know if you would recommend this tool to another bride (Question 5).",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }
    if (!feedbackText.trim()) {
      toast({
        title: "Comments Required",
        description: "Please share any additional comments before submitting.",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }

    await doSubmitFeedback();
  };

  const doSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    setShowBlogSuggestion(false);

    try {
      const response = await fetch("/api/wedding-timeline/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          easeOfUse: feedbackRatings.easeOfUse,
          satisfaction: feedbackRatings.satisfaction,
          timeSaved: feedbackTimeSaved,
          feelings: feedbackFeelings,
          recommend: feedbackRecommend,
          comment: feedbackText,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      const data = await response.json();

      if (data.success) {
        setHasFeedback(true);
        setShowFeedbackDialog(false);
        setFeedbackText("");
        setFeedbackRatings({
          easeOfUse: 0,
          satisfaction: 0,
        });
        setFeedbackTimeSaved("");
        setFeedbackFeelings([]);
        setFeedbackRecommend("");

        toast({
          title: "Thank You! 💕",
          description: "Your feedback helps us make this feature even better!",
          className: "bg-pinkey text-lovely border-lovely",
        });
      }
    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit feedback. Please try again.",
        className: "bg-pinkey text-lovely border-lovely",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const { default: jsPDF, GState } = (await import("jspdf")) as any;

      const doc = new jsPDF();

      // Helper function to draw rounded rectangle
      const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fillColor: string, borderColor: string) => {
        doc.setFillColor(fillColor);
        doc.setDrawColor(borderColor);
        doc.setLineWidth(0.5);
        
        // Draw rounded rectangle
        doc.roundedRect(x, y, width, height, radius, radius, 'FD');
      };

      // Helper function to calculate how many lines text will need
      const calculateTextLines = (text: string, width: number, fontSize: number = 8) => {
        doc.setFontSize(fontSize);
        const maxWidth = width - 2; // Leave 1 unit padding on each side
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines;
      };

      // Helper function to add text centered in a cell with wrapping
      const addCenteredText = (text: string, x: number, y: number, width: number, height: number, fontSize: number = 8) => {
        doc.setFontSize(fontSize);
        const maxWidth = width - 2; // Leave 1 unit padding on each side
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5; // Line spacing
        const totalTextHeight = lines.length * lineHeight;
        
        // Start Y position to center the text block vertically
        let textY = y + (height - totalTextHeight) / 2 + (fontSize / 2.5);
        
        lines.forEach((line: string) => {
          const lineWidth = doc.getTextWidth(line);
          const textX = x + (width - lineWidth) / 2;
          doc.text(line, textX, textY);
          textY += lineHeight;
        });
      };

      // Set Page Background (Creamey)
      doc.setFillColor("#FBF3E0");
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

      // Add Logo at the top (full opacity)
      const logoUrl = "/logo/Wifey for Lifey Primary Logo with Slogan Red.png";
      const logoImg = new Image();
      logoImg.src = logoUrl;

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });

      // Add logo centered at top
      const logoWidth = 60;
      const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
      const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
      doc.addImage(logoImg, "PNG", logoX, 10, logoWidth, logoHeight);


      // Add timeline subheader image
      const subHeaderUrl = "/timeline/timelineSubHeader.jpg";
      const subHeaderImg = new Image();
      subHeaderImg.src = subHeaderUrl;

      await new Promise((resolve, reject) => {
        subHeaderImg.onload = resolve;
        subHeaderImg.onerror = reject;
      });

      // Add subheader image centered below logo
      const subHeaderWidth = 100;
      const subHeaderHeight = (subHeaderImg.height * subHeaderWidth) / subHeaderImg.width;
      const subHeaderX = (doc.internal.pageSize.getWidth() - subHeaderWidth) / 2;
      const titleY = 10 + logoHeight ;
      doc.addImage(subHeaderImg, "JPEG", subHeaderX, titleY, subHeaderWidth, subHeaderHeight);


      // Table configuration
      const startY = titleY + subHeaderHeight ;
      const gap = 2; // Gap between cells
      const radius = 1; // Rounded corner radius
      const minRowHeight = 8; // Minimum row height
      const baseLineHeight = 4; // Height per line of text
      const timeColWidth = 30;
      const activityColWidth = 35;
      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = timeColWidth + (activityColWidth * 4) + (gap * 5);
      const startX = (pageWidth - tableWidth) / 2;

      let currentY = startY;

      // Draw header row (text only, no boxes)
      const headers = ["TIME", "BRIDE", "GROOM", "BRIDESMAIDS", "GROOMSMEN"];
      const headerWidths = [timeColWidth, activityColWidth, activityColWidth, activityColWidth, activityColWidth];
      
      doc.setTextColor("#D32333");
      doc.setFont("BebasNeue-Regular", "bold");
      doc.setFontSize(10);
      
      let headerX = startX;
      headers.forEach((header, index) => {
        const textWidth = doc.getTextWidth(header);
        const textX = headerX + (headerWidths[index] - textWidth) / 2;
        doc.text(header, textX, currentY + 5); // Simple text without cell
        headerX += headerWidths[index] + gap;
      });

      // Draw horizontal line under headers
      const lineY = currentY + 7;
      doc.setDrawColor("#D32333");
      doc.setLineWidth(0.5);
      doc.line(startX, lineY, startX + tableWidth, lineY);

      currentY += 10; // Space after headers and line

      // Draw data rows
      doc.setFont("helvetica", "normal");
      
      calculatedEvents.forEach((event) => {
        // Calculate the required height for this row based on content
        let maxLines = 1;
        const fontSize = 8;
        
        // Check if all activities are the same (merged cell)
        const allSame = 
          event.brideActivity === event.groomActivity &&
          event.brideActivity === event.bridesmaidsActivity &&
          event.brideActivity === event.groomsmenActivity;

        if (allSame) {
          // For merged cell, use the merged width
          const mergedWidth = (activityColWidth * 4) + (gap * 3);
          const lines = calculateTextLines(event.brideActivity, mergedWidth, fontSize);
          maxLines = Math.max(maxLines, lines.length);
        } else {
          // Check each activity column
          const activities = [
            event.brideActivity,
            event.groomActivity,
            event.bridesmaidsActivity,
            event.groomsmenActivity
          ];
          
          activities.forEach((activity) => {
            const lines = calculateTextLines(activity, activityColWidth, fontSize);
            maxLines = Math.max(maxLines, lines.length);
          });
        }

        // Also check time label
        const timeLines = calculateTextLines(event.timeLabel || "", timeColWidth, fontSize);
        maxLines = Math.max(maxLines, timeLines.length);

        // Calculate row height based on number of lines
        const rowHeight = Math.max(minRowHeight, maxLines * baseLineHeight + 2);

        // Check if we need a new page
        if (currentY + rowHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          doc.setFillColor("#FBF3E0");
          doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
          currentY = 20;
        }

        // Draw time cell (always pink)
        drawRoundedRect(startX, currentY, timeColWidth, rowHeight, radius, "#FFB6C7", "#D32333");
        doc.setTextColor("#D32333");
        doc.setFont("helvetica", "bold");
        addCenteredText(event.timeLabel || "", startX, currentY, timeColWidth, rowHeight, fontSize);

        if (allSame) {
          // Draw merged cell for all activities
          const mergedWidth = (activityColWidth * 4) + (gap * 3);
          const mergedX = startX + timeColWidth + gap;
          // Use pink background for entrance event, creamy for others
          const bgColor = event.id === "entrance" || event.id === "church" || event.id === "Grand_Entrance" ? "#FFB6C7" : "#FBF3E0";
          drawRoundedRect(mergedX, currentY, mergedWidth, rowHeight, radius, bgColor, "#D32333");
          doc.setTextColor("#D32333");
          doc.setFont("helvetica", "normal");
          addCenteredText(event.brideActivity, mergedX, currentY, mergedWidth, rowHeight, fontSize);
        } else {
          // Draw separate cells for each activity
          const activities = [
            event.brideActivity,
            event.groomActivity,
            event.bridesmaidsActivity,
            event.groomsmenActivity
          ];
          
          let cellX = startX + timeColWidth + gap;
          activities.forEach((activity) => {
            drawRoundedRect(cellX, currentY, activityColWidth, rowHeight, radius, "#FBF3E0", "#D32333");
            doc.setTextColor("#D32333");
            doc.setFont("helvetica", "normal");
            addCenteredText(activity, cellX, currentY, activityColWidth, rowHeight, fontSize);
            cellX += activityColWidth + gap;
          });
        }

        currentY += rowHeight + gap;
      });

      // Add Tips section
      currentY += 10; // Add some space after the table

      // Check if we need a new page for tips
      if (currentY + 50 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        doc.setFillColor("#FBF3E0");
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
        currentY = 20;
      }

      // Tips title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#D32333");
      doc.text("Tips:", startX, currentY);
      currentY += 7;

      // Tips content
      const tips = [
        "The photographer and videographer should arrive during the last 30-40 minutes of the makeup session.",
        "If a photo booth, audio booth, or live painter is hired, it's recommended that they arrive and complete setup 1-2 hours before the wedding begins.",
        "Zaffa is recommended to start after Katb El Ketab.",
        "If additional entertainers are hired (tabla show, violinist, etc.), we recommend that they begin after dinner."
      ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor("#D32333");

      tips.forEach((tip) => {
        // Check if we need a new page
        if (currentY + 10 > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          doc.setFillColor("#FBF3E0");
          doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
          currentY = 20;
        }

        // Add bullet point and text with wrapping
        const bulletX = startX + 2;
        const textX = startX + 7;
        const maxWidth = tableWidth - 7;

        doc.text("•", bulletX, currentY);
        
        // Split text if it's too long
        const lines = doc.splitTextToSize(tip, maxWidth);
        doc.text(lines, textX, currentY);
        
        currentY += (lines.length * 5) + 2; // Adjust spacing based on number of lines
      });

      // Add Watermark to all pages (with low opacity)
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const wmWidth = 120;
        const wmHeight = (logoImg.height * wmWidth) / logoImg.width;
        const x = (doc.internal.pageSize.getWidth() - wmWidth) / 2;
        const y = (doc.internal.pageSize.getHeight() - wmHeight) / 2;

        (doc as any).saveGraphicsState();
        doc.setGState(new GState({ opacity: 0.12 }));
        doc.addImage(logoImg, "PNG", x, y, wmWidth, wmHeight);
        (doc as any).restoreGraphicsState();
        
        // Add footer text with link
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor("#D32333");
        const footerText = "This timeline was created by ";
        const linkText = "shopwifeyforlifey.com";
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 10;
        
        const footerTextWidth = doc.getTextWidth(footerText);
        const totalWidth = footerTextWidth + doc.getTextWidth(linkText);
        const footerStartX = (pageWidth - totalWidth) / 2;
        
        doc.text(footerText, footerStartX, footerY);
        doc.textWithLink(linkText, footerStartX + footerTextWidth, footerY, {
          url: "https://shopwifeyforlifey.com"
        });
      }

      const pdfFileName =
        brideFirstName.trim() && groomFirstName.trim()
          ? `${brideFirstName.trim()} & ${groomFirstName.trim()} wedding day timeline.pdf`
          : "wedding-timeline.pdf";
      doc.save(pdfFileName);

      // Increment export counter in database
      if (isAuthenticated) {
        try {
          await fetch("/api/wedding-timeline/export", {
            method: "POST",
          });
        } catch (error) {
          console.error("Failed to track export:", error);
          // Don't show error to user, this is just analytics
        }
      }

      toast({
        title: "Success",
        description: "Timeline exported as PDF!",
        className: "bg-pinkey text-lovely border-lovely",
      });

      if (!hasFeedback) {
        setTimeout(() => setShowFeedbackDialog(true), 1000);
      }
    } catch (error) {
      console.error("Export failed", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        className: "bg-pinkey text-lovely border-lovely",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      setShowTutorial(false);
      setCurrentTutorialStep(0);
    }
  };

  const handlePrevTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setCurrentTutorialStep(0);
  };

  const handleResetTimeline = async () => {
    try {
      // If authenticated, delete from database
      if (isAuthenticated) {
        const response = await fetch("/api/wedding-timeline", {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete timeline");
        }
      }

      // Reset all state to initial values
      setEvents([]);
      setZaffaTime("18:00");
      setSelectedFeatures(
        FEATURES.reduce(
          (acc, feature) => ({
            ...acc,
            [feature.id]: { enabled: true, duration: feature.defaultDuration },
          }),
          {}
        )
      );
      setStep(1);
      setActiveCeremonyType(null);
      setSelectedCeremonyVariation(null);
      setGettingReadyLocation(null);
      setBridesmaidsAtPrep(null);
      setPhotoAtKatbLocation(null);
      setHasAutoSaved(false);
      setShareUrl(null);
      setShowResetDialog(false);
      setHasSeenTutorial(false);
      setBrideFirstName("");
      setGroomFirstName("");
      
      // Clear tutorial flag from localStorage so it shows again
      localStorage.removeItem("weddingTimelineTutorialSeen");

      toast({
        title: "Timeline Reset",
        description: "Your timeline has been deleted. Start fresh!",
        className: "bg-pinkey text-lovely border-lovely",
      });
    } catch (error) {
      console.error("Reset failed:", error);
      toast({
        title: "Error",
        description: "Failed to reset timeline. Please try again.",
        className: "bg-pinkey text-lovely border-lovely",
      });
    }
  };

  // --- Render ---

  // Layout wrapper changes based on step
  const isWizard = step === 1 || step === 2 || step === 3 || step === 4 || step === 5;

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
            Your Timeline Bestie
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
                <div className="space-y-6 sm:px-4 md:px-12 lg:px-16 xl:px-24 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xl text-lovely text-center block">
                      What kind of ceremony are you planning?
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {CEREMONY_OPTIONS.map((option) => (
                        <div
                          key={option.id}
                          className={`
                            border-2 rounded-lg p-4 cursor-pointer transition-all
                            ${
                              activeCeremonyType === option.id
                                ? "border-pinkey bg-pinkey/50 text-lovely"
                                : "border-pinkey/30 hover:border-pinkey/60 bg-creamey"
                            }
                          `}
                          onClick={() => setActiveCeremonyType(option.id)}
                        >
                          <h3 className="text-lg font-bold text-lovely text-center mb-2">
                            {option.label}
                          </h3>
                          
                          {activeCeremonyType === option.id && (
                            <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
                              {option.variations.map((variation) => (
                                <div
                                  key={variation.id}
                                  className={`
                                    p-3 rounded border cursor-pointer flex items-center gap-3
                                    ${
                                      selectedCeremonyVariation === variation.id
                                        ? "bg-lovely text-creamey border-lovely"
                                        : "bg-white/50 hover:text-creamey hover:bg-lovely/90 text-lovely border-pinkey/20"
                                    }
                                  `}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCeremonyVariation(variation.id);
                                  }}
                                >
                                  <div className={`
                                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${selectedCeremonyVariation === variation.id ? "border-white" : "border-pinkey"}
                                  `}>
                                    {selectedCeremonyVariation === variation.id && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{variation.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    disabled={!selectedCeremonyVariation}
                    onClick={() => {
                      if (selectedCeremonyVariation === "muslim_katb_ketab_only") {
                        setStep(2); // go to extra questions step
                      } else {
                        setStep(3); // skip extra questions, go to time picker
                      }
                    }}
                    className="w-full bg-pinkey hover:bg-pinkey/90 text-lovely font-bold text-lg py-6 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 sm:px-4 md:px-12 lg:px-16 xl:px-24 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Q1: Where are you getting ready? */}
                  <div className="space-y-3">
                    <Label className="text-xl text-lovely text-center block">
                      Where are you getting ready?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["home", "venue"] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setGettingReadyLocation(option)}
                          className={`p-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                            gettingReadyLocation === option
                              ? "bg-lovely text-creamey border-lovely"
                              : "bg-white/50 text-lovely border-pinkey/40 hover:border-pinkey"
                          }`}
                        >
                          {option === "home" ? "🏠 Home" : "🏛️ Venue"}
                        </button>
                      ))}
                    </div>
                    {gettingReadyLocation === "home" && (
                      <p className="text-xs text-lovely/60 text-center">
                        A 30-minute transportation to the photoshoot location will be added after preparations.
                      </p>
                    )}
                  </div>

                  {/* Q2: Will bridesmaids come to preparations? */}
                  <div className="space-y-3">
                    <Label className="text-xl text-lovely text-center block">
                      Will the bridesmaids come to preparations?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["yes", "no"] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setBridesmaidsAtPrep(option)}
                          className={`p-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                            bridesmaidsAtPrep === option
                              ? "bg-lovely text-creamey border-lovely"
                              : "bg-white/50 text-lovely border-pinkey/40 hover:border-pinkey"
                          }`}
                        >
                          {option === "yes" ? "✅ Yes" : "❌ No"}
                        </button>
                      ))}
                    </div>
                    {bridesmaidsAtPrep === "no" && (
                      <p className="text-xs text-lovely/60 text-center">
                        The &quot;Getting Ready Pictures&quot; event will be removed.
                      </p>
                    )}
                  </div>

                  {/* Q3: Is photo session at same place as Katb Ketab? */}
                  <div className="space-y-3">
                    <Label className="text-xl text-lovely text-center block">
                      Is the photo session at the same location as the Katb Ketab?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["yes", "no"] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setPhotoAtKatbLocation(option)}
                          className={`p-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                            photoAtKatbLocation === option
                              ? "bg-lovely text-creamey border-lovely"
                              : "bg-white/50 text-lovely border-pinkey/40 hover:border-pinkey"
                          }`}
                        >
                          {option === "yes" ? "✅ Yes, same place" : "📍 No, different"}
                        </button>
                      ))}
                    </div>
                    {photoAtKatbLocation === "no" && (
                      <p className="text-xs text-lovely/60 text-center">
                        A 30-minute transportation to the mosque will be added after the photoshoot.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-creamey text-lovely border-pinkey border-2 hover:text-lovely font-bold hover:bg-pinkey/10"
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!gettingReadyLocation || !bridesmaidsAtPrep || !photoAtKatbLocation}
                      onClick={() => setStep(3)}
                      className="flex-1 bg-pinkey hover:bg-pinkey/90 text-lovely font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 sm:px-4 md:px-12 lg:px-16 xl:px-24 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xl text-lovely text-center block">
                      When does the {getAnchorLabel(selectedCeremonyVariation)} start?
                    </Label>
                    <div className="flex w-full justify-center px-2">
                        <input
                          type="time"
                          value={zaffaTime}
                          onChange={(e) => setZaffaTime(e.target.value)}
                          className="w-full px-3 py-3 bg-creamey border-pinkey border-2 text-lovely md:px-6 md:py-4 rounded-md border-input focus:outline-none focus:ring-2 focus:ring-pinkey focus:border-pinkey"
                          style={{
                            colorScheme: 'light'
                          }}
                        />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(selectedCeremonyVariation === "muslim_katb_ketab_only" ? 2 : 1)}
                      className="flex-1 bg-creamey text-lovely border-pinkey border-2 hover:text-lovely font-bold hover:bg-pinkey/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!isAuthenticated) {
                          localStorage.setItem('pendingZaffaTime', zaffaTime);
                          setShowLoginDialog(true);
                          return;
                        }
                        setStep(4);
                      }}
                      className="flex-1 bg-pinkey hover:bg-pinkey/90 text-lovely font-bold text-lg"
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
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
                      {FEATURES.filter(
                        (f) =>
                          !f.hidden &&
                          (!f.allowedVariations ||
                            (selectedCeremonyVariation &&
                              f.allowedVariations.includes(
                                selectedCeremonyVariation
                              )))
                      ).map((feature) => (
                        <div
                          key={feature.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                            selectedFeatures[feature.id].enabled
                              ? "bg-pinkey/20 border-pinkey/50"
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
                              {feature.id === "hair" && (
                                <span className="block text-xs font-normal text-lovely/70 mt-1">
                                  (for hijabis we recommend make up to be first, you can swap them later.)
                                </span>
                              )}
                            </Label>
                          </div>
                          {selectedFeatures[feature.id].enabled && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={selectedFeatures[feature.id].duration}
                                onChange={(e) =>
                                  handleFeatureDurationChange(
                                    feature.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-center h-8 bg-creamey border-pinkey"
                              >
                                </input>
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
                      onClick={() => setStep(3)}
                      className="flex-1 bg-creamey text-lovely border-pinkey border-2 hover:text-lovely font-bold hover:bg-pinkey/10"
                    >
                      Prev step
                    </Button>
                    <Button
                      onClick={() => setStep(5)}
                      disabled={loading}
                      className="flex-1 bg-pinkey hover:bg-pinkey/90  font-bold  text-lovely"
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 sm:px-4 md:px-12 lg:px-16 xl:px-24 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xl text-lovely text-center block">
                      One last thing! 💕
                    </Label>
                    <p className="text-sm text-lovely/60 text-center">
                      Optionally, enter the bride&apos;s and groom&apos;s first names to personalise your PDF file name.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-lovely mb-1 block">
                          Bride&apos;s First Name
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. Nour"
                          value={brideFirstName}
                          onChange={(e) => setBrideFirstName(e.target.value)}
                          className="bg-creamey border-pinkey border-2 text-lovely placeholder:text-lovely/40 focus-visible:ring-pinkey"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-lovely mb-1 block">
                          Groom&apos;s First Name
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. Ahmed"
                          value={groomFirstName}
                          onChange={(e) => setGroomFirstName(e.target.value)}
                          className="bg-creamey border-pinkey border-2 text-lovely placeholder:text-lovely/40 focus-visible:ring-pinkey"
                        />
                      </div>
                    </div>

                    {brideFirstName.trim() && groomFirstName.trim() && (
                      <p className="text-xs text-lovely/60 text-center">
                        Your PDF will be saved as: <span className="font-semibold text-lovely">&ldquo;{brideFirstName.trim()} &amp; {groomFirstName.trim()} wedding.pdf&rdquo;</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(4)}
                      className="flex-1 bg-creamey text-lovely border-pinkey border-2 hover:text-lovely font-bold hover:bg-pinkey/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlan}
                      disabled={loading}
                      className="flex-1 bg-pinkey hover:bg-pinkey/90 font-bold text-lovely"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Plan My Day 💍
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Timeline Editor Step 6 */}
      {step === 6 && (
        <div
          ref={contentRef}
          className="max-w-7xl mx-auto w-full rounded-lg shadow-xl overflow-hidden border-4 border-pinkey animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="p-6 bg-lovely border-b border-pinkey/20 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1
                className={`${thirdFont.className} text-4xl font-display text-white`}
              >
                Your Timeline Bestie
              </h1>
            </div>
            {/* Desktop: Show all buttons */}
            <div className="hidden md:flex gap-2">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                variant="outline"
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                Share
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                onClick={() => setShowTutorial(true)}
                variant="outline"
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                How to Use
              </Button>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Mobile: Show Options button */}
            <div className="md:hidden">
              <Button
                onClick={() => setShowOptionsModal(true)}
                variant="outline"
                className="bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely"
              >
                <MoreVertical className="h-4 w-4 mr-2" />
                Options
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
                    {/* Drag Handle Header */}
                    <TableHead className="w-8 p-1 md:p-2"></TableHead>
                    <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 w-32 md:w-auto text-center">
                      TIME
                    </TableHead>
                    <TableHead className="text-center text-white text-xs md:text-sm p-1 md:p-4 w-16 md:w-auto">
                      Duration (min)
                    </TableHead>
                    <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 text-center">
                      <div className="md:hidden flex justify-center w-full">
                        <Select
                          value={mobileActiveColumn}
                          onValueChange={setMobileActiveColumn}
                        >
                          <SelectTrigger className="h-6 text-xs bg-transparent border-none text-white p-0 focus:ring-0 focus:ring-offset-0 font-bold uppercase text-center justify-center">
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
                    <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                      GROOM
                    </TableHead>
                    <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                      BRIDESMAIDS
                    </TableHead>
                    <TableHead className="font-bold text-white text-xs md:text-sm p-1 md:p-4 hidden md:table-cell text-center">
                      GROOMSMEN
                    </TableHead>
                    <TableHead className="w-8 md:w-auto p-1 md:p-4 text-center"></TableHead>
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

      {/* Blog Suggestion Popup */}
      {showBlogSuggestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-creamey border-4 border-lovely rounded-2xl shadow-2xl max-w-md w-full p-7 relative animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowBlogSuggestion(false)}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className={`${thirdFont.className} text-2xl text-lovely text-center mb-3`}>
              Quick Tip Before You Go!
            </h2>
            <p className="text-lovely/80 text-sm text-center mb-5 leading-relaxed">
              We noticed your ratings were a bit low. Our blog post on{" "}
              <strong>creating the perfect wedding day timeline</strong> might have the answers you're looking for — from ordering events to timing tips! 🌸
            </p>

            {/* Blog image */}
            <div className="flex shadow-lg justify-center mb-4 rounded-xl overflow-hidden">
              <NextImage
                src="/timeline/blog.png"
                alt="Wedding Timeline Blog"
                width={400}
                height={220}
                className="w-full object-cover rounded-xl"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="/blogs/how-to-create-your-perfect-wedding-day-timeline-with-free-canva-template"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-lovely hover:bg-lovely/90 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:scale-[1.02]"
              >
                <span>📖</span> Read the Blog Post
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      {showFeedbackDialog && step === 4 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey border-4 border-lovely rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFeedbackDialog(false)}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className={`${thirdFont.className} text-3xl text-lovely mb-3 text-center`}>
                Hi bestie! We'd love to know your feedback! 💗
              </h2>
              <p className="text-lovely/90 text-base font-semibold text-center ">
                You just created your wedding day timeline in less than 5 minutes! ✨<br />
                Help us make this tool even better for brides like you.
              </p>
            </div>

            <div className="space-y-5">
              {/* Q1 - Star Rating */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  1. How easy was it to create your wedding day timeline using this tool?
                </label>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setFeedbackRatings((prev) => ({
                          ...prev,
                          easeOfUse: star,
                        }));
                        if (star < 4) setShowBlogSuggestion(true);
                      }}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= feedbackRatings.easeOfUse
                            ? "fill-lovely text-lovely"
                            : "text-lovely/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 - Star Rating */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  2. Are you satisfied about how the day looks?
                </label>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setFeedbackRatings((prev) => ({
                          ...prev,
                          satisfaction: star,
                        }));
                        if (star < 4) setShowBlogSuggestion(true);
                      }}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= feedbackRatings.satisfaction
                            ? "fill-lovely text-lovely"
                            : "text-lovely/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 - Time Saved */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  3. Compared to creating a timeline on your own, how much time do you feel this tool saved you?
                </label>
                <div className="space-y-2">
                  {[
                    { value: "2-7days", label: "Between 2 days to 7 days" },
                    { value: "7-14days", label: "Between 7 days to 2 weeks" },
                    { value: "era", label: "A whole era of overthinking" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFeedbackTimeSaved(option.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                        feedbackTimeSaved === option.value
                          ? "border-lovely bg-pinkey/50 text-lovely font-medium"
                          : "border-pinkey bg-creamey hover:border-lovely text-lovely/80"
                      }`}
                    >
                      <span className="mr-2">{feedbackTimeSaved === option.value ? "●" : "○"}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4 - Feelings (Multi-select) */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  4. How did this tool make you feel while planning your wedding day?
                </label>
                <p className="text-xs text-lovely/60 mb-2">(Select all that apply)</p>
                <div className="space-y-2">
                  {[
                    { value: "less_stressed", label: "Less stressed" },
                    { value: "more_organized", label: "More organized" },
                    { value: "more_confident", label: "More confident" },
                    { value: "calm_reassured", label: "Calm & reassured" },
                    { value: "no_difference", label: "No difference" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFeedbackFeelings((prev) =>
                          prev.includes(option.value)
                            ? prev.filter((f) => f !== option.value)
                            : [...prev, option.value]
                        );
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                        feedbackFeelings.includes(option.value)
                          ? "border-lovely bg-pinkey/50 text-lovely font-semibold"
                          : "border-pinkey bg-creamey hover:border-lovely text-lovely/80"
                      }`}
                    >
                      <span className="mr-2">{feedbackFeelings.includes(option.value) ? "☑" : "☐"}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5 - Recommendation */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  5. Would you recommend this timeline creator to another bride?
                </label>
                <div className="space-y-2">
                  {[
                    { value: "definitely_not", label: "Definitely not" },
                    { value: "maybe", label: "Maybe" },
                    { value: "definitely_yes", label: "Definitely yes" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFeedbackRecommend(option.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                        feedbackRecommend === option.value
                          ? "border-lovely bg-pinkey/50 text-lovely font-medium"
                          : "border-pinkey bg-creamey hover:border-lovely text-lovely/80"
                      }`}
                    >
                      <span className="mr-2">{feedbackRecommend === option.value ? "●" : "○"}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="text-sm font-medium text-lovely block mb-2">
                  Any additional comments?
                  <span className="text-lovely ml-1">*</span>
                </label>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[80px] placeholder:text-lovely/60 border-2 bg-creamey resize-none focus:border-lovely border-pinkey"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowFeedbackDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-pinkey bg-creamey hover:text-lovely text-lovely hover:bg-pinkey/20"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="flex-1 bg-lovely hover:bg-lovely/90 text-white"
              >
                {isSubmittingFeedback ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Floating Feedback Button (always visible if no feedback given) */}
      {!hasFeedback && step === 4 && !showFeedbackDialog && (
        <button
          onClick={() => setShowFeedbackDialog(true)}
          className="fixed bottom-6 right-6 bg-lovely text-white p-4 rounded-full shadow-lg hover:bg-lovely/90 transition-all hover:scale-110 z-40 flex items-center gap-2 group"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Write Feedback
          </span>
        </button>
      )}
      {/* Login Dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey border-4 border-lovely rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowLoginDialog(false)}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <h2 className={`${thirdFont.className} text-2xl text-lovely mb-2`}>
                Login Required
              </h2>
              <p className="text-lovely/90 text-base">
                To be able to view your wedding day timeline later, you’ll need to sign up or login if you already have an account 💗
              </p>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                className="flex-1 bg-lovely hover:bg-lovely/90 text-white"
                onClick={() => {
                  router.push("/login?callbackUrl=/wedding-timeline?step=2");
                  setShowLoginDialog(false);
                }}
              >
                Login
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 border-lovely text-lovely hover:bg-pinkey/20"
                onClick={() => {
                  router.push("/register?callbackUrl=/wedding-timeline?step=2");
                  setShowLoginDialog(false);
                }}
              >
                Sign Up
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey h-auto  overflow-y-auto border-4 border-lovely rounded-lg shadow-2xl max-w-3xl w-full relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleCloseTutorial}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-4">
              <h2 className={`${thirdFont.className} text-3xl text-lovely mb-2 max-md:mt-8 text-center`}>
                How to Use Timeline Bestie
              </h2>
              <p className="text-lovely/70 text-center mb-2">
                Step {currentTutorialStep + 1} of {tutorialSteps.length}
              </p>

              <div className="bg-creamey rounded-lg p-2 mb-2 border-2 border-pinkey/20">
                <div className="flex justify-center mb-4">
                  <NextImage
                    src={tutorialSteps[currentTutorialStep].image}
                    alt={tutorialSteps[currentTutorialStep].title}
                    width={300}
                    height={300}
                    className="rounded-lg max-h-[300px] object-cover"
                    unoptimized
                  />
                </div>
                <h3 className={`${thirdFont.className} text-2xl text-lovely mb-3 text-center`}>
                  {tutorialSteps[currentTutorialStep].title}
                </h3>
                <p className="text-lovely/90 text-center text-base leading-relaxed">
                  {tutorialSteps[currentTutorialStep].description}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTutorialStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTutorialStep
                        ? "w-8 bg-lovely"
                        : "w-2 bg-lovely/30 hover:bg-lovely/50"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePrevTutorialStep}
                  disabled={currentTutorialStep === 0}
                  variant="outline"
                  className="flex-1 border-2 border-pinkey bg-creamey text-lovely hover:text-lovely hover:bg-pinkey/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextTutorialStep}
                  className="flex-1 bg-lovely hover:bg-lovely/90 text-white"
                >
                  {currentTutorialStep === tutorialSteps.length - 1 ? (
                    "Get Started"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey border-4 border-lovely rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowResetDialog(false)}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 bg-lovely/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-lovely" />
              </div>
              <h2 className={`${thirdFont.className} text-2xl text-lovely mb-2`}>
                Reset Timeline?
              </h2>
              <p className="text-lovely/90 text-base">
                Are you sure you want to delete your current timeline and start over? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 border-2 border-pinkey bg-creamey text-lovely hover:bg-pinkey/20"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-lovely hover:bg-lovely/90 text-white"
                onClick={handleResetTimeline}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Yes, Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Options Modal (Mobile) */}
      {showOptionsModal && (
        <div
        onClick={() => setShowOptionsModal(false)}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-creamey border-4 border-lovely rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowOptionsModal(false)}
              className="absolute top-4 right-4 text-lovely/50 hover:text-lovely transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className={`${thirdFont.className} text-2xl text-lovely text-center`}>
                Timeline Options
              </h2>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleExportPDF();
                  setShowOptionsModal(false);
                }}
                disabled={isExporting}
                variant="outline"
                className="w-full bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely justify-start"
              >
                {isExporting ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 mr-3" />
                )}
                Export as PDF
              </Button>

              <Button
                onClick={() => {
                  handleShare();
                  setShowOptionsModal(false);
                }}
                disabled={isSharing}
                variant="outline"
                className="w-full bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely justify-start"
              >
                {isSharing ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Share2 className="h-5 w-5 mr-3" />
                )}
                Share Timeline
              </Button>

              <Button
                onClick={() => {
                  handleSave(false);
                  setShowOptionsModal(false);
                }}
                disabled={isSaving}
                className="w-full bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely justify-start"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-3" />
                )}
                Save Timeline
              </Button>

              <Button
                onClick={() => {
                  setShowOptionsModal(false);
                  setShowTutorial(true);
                }}
                variant="outline"
                className="w-full bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely justify-start"
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                How to Use
              </Button>

              <Button
                onClick={() => {
                  setShowOptionsModal(false);
                  setShowResetDialog(true);
                }}
                variant="outline"
                className="w-full bg-creamey hover:border-creamey border-2 border-lovely text-lovely hover:bg-pinkey hover:text-lovely justify-start"
              >
                <Trash2 className="h-5 w-5 mr-3" />
                Reset Timeline
              </Button>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setShowOptionsModal(false)}
                variant="outline"
                className="w-full border-2 border-pinkey bg-creamey text-lovely hover:bg-pinkey/20"
              >
                Close
              </Button>
            </div>
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
