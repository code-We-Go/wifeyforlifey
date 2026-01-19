"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  {
    id: "arrival",
    label: "Arrival at the venue",
    defaultDuration: 30,
    category: "before",
    hidden: true,
  },
  { id: "hair", label: "Hair & Veil ", defaultDuration: 60, category: "before" },
  { id: "makeup", label: "Makeup", defaultDuration: 105, category: "before" },
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
  { id: "entrance", label: "Entrance", defaultDuration: 10, category: "after" },
  {
    id: "katb_ketab",
    label: "Katb Ketab",
    defaultDuration: 45,
    category: "after",
  },
  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 60,
    category: "after",
    hidden: true,
  },
  { id: "dinner", label: "Dinner", defaultDuration: 60, category: "after" },
  {
    id: "party_after_dinner",
    label: "Party",
    defaultDuration: 120,
    category: "after",
    hidden: true,
  },
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
  arrival: {
    label: "Arrival at the venue",
    bride: "Arrival at the venue",
    groom: "Sleeping",
    bridesmaids: "Arrival at the venue",
    groomsmen: "Sleeping",
    order: 1,
  },
  hair: {
    label: "Hair & Veil (for hijabis we recommend make up to be first)",
    bride: "Hair Styling ",
    groom: "Waking up",
    bridesmaids: "Helping Bride",
    groomsmen: "Waking up",
    order: 2,
  },
  makeup: {
    label: "Makeup",
    bride: "Makeup",
    groom: "Arriving & Getting Ready",
    bridesmaids: "Getting Ready",
    groomsmen: "Arriving & Getting Ready",
    order: 3,
  },
  getting_ready: {
    label: "Getting ready pictures",
    bride: "Getting Ready Photos",
    groom: "Break",
    bridesmaids: "Getting Ready Photos",
    groomsmen: "Break",
    order: 4,
  },
  dress_suit: {
    label: "Wearing dress & suit",
    bride: "Wearing Dress",
    groom: "Wearing Suit",
    bridesmaids: "Helping Bride",
    groomsmen: "Helping Groom",
    order: 4.5,
  },
  first_look: {
    label: "First look",
    bride: "First Look",
    groom: "First Look",
    bridesmaids: "cheering the couple up",
    groomsmen: "cheering the couple up",
    order: 5,
  },
  photoshoot: {
    label: "Photoshoot",
    bride: "Couple Photoshoot",
    groom: "Couple Photoshoot",
    bridesmaids: "Group Photos",
    groomsmen: "Group Photos",
    order: 6,
  },
  zaffa: {
    label: "Zaffa",
    bride: "Zaffa / Entrance",
    groom: "Zaffa / Entrance",
    bridesmaids: "Procession",
    groomsmen: "Procession",
    order: 7,
  },
  entrance: {
    label: "Entrance",
    bride: "Grand Entrance",
    groom: "Grand Entrance",
    bridesmaids: "Entrance",
    groomsmen: "Entrance",
    order: 8,
  },
  katb_ketab: {
    label: "Katb Ketab",
    bride: "Katb Ketab Ceremony",
    groom: "Katb Ketab Ceremony",
    bridesmaids: "Attending",
    groomsmen: "Attending",
    order: 9,
  },
  party_before_dinner: {
    label: "Party",
    bride: "Party / Dancing",
    groom: "Party / Dancing",
    bridesmaids: "Party / Dancing",
    groomsmen: "Party / Dancing",
    order: 9.5,
  },
  dinner: {
    label: "Dinner",
    bride: "Dinner",
    groom: "Dinner",
    bridesmaids: "Dinner",
    groomsmen: "Dinner",
    order: 10,
  },
  party_after_dinner: {
    label: "Party",
    bride: "Party / Dancing",
    groom: "Party / Dancing",
    bridesmaids: "Party / Dancing",
    groomsmen: "Party / Dancing",
    order: 11,
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
        event.isBreak ? "bg-pinkey/50" : "bg-pinkey/60"
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
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // -- Share State --
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // -- Feedback State --
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState({
    easeOfUse: 0,
    satisfaction: 0,
  });
  const [feedbackTimeSaved, setFeedbackTimeSaved] = useState("");
  const [feedbackFeelings, setFeedbackFeelings] = useState<string[]>([]);
  const [feedbackRecommend, setFeedbackRecommend] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  // -- Tutorial State --
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // -- Reset State --
  const [showResetDialog, setShowResetDialog] = useState(false);

  // -- Options Modal State (for mobile) --
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Tutorial Steps
  const tutorialSteps = [
    {
      image: "/weddingPlanningToutorial/1.gif",
      title: "Set Your Zaffa Time",
      description: "Start by selecting when your Zaffa (party entrance) begins. This will be the anchor point for your entire timeline."
    },
    {
      image: "/weddingPlanningToutorial/2.gif",
      title: "Choose Your Features",
      description: "Select the activities you want to include in your wedding day and customize their duration to fit your schedule."
    },
    {
      image: "/weddingPlanningToutorial/3.gif",
      title: "Drag and Drop Events",
      description: "Easily reorder your timeline by dragging and dropping events. Arrange your day exactly how you want it!"
    },
    {
      image: "/weddingPlanningToutorial/4.gif",
      title: "Mobile View Selector",
      description: "On mobile devices, use the dropdown selector to switch between viewing different columns (Bride, Groom, Bridesmaids, Groomsmen)."
    },
    {
      image: "/weddingPlanningToutorial/5.gif",
      title: "Save, Share & Export",
      description: "Use these three buttons to save your timeline, share it with your loved ones, or export it as a PDF for printing."
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
                setStep(3);
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

  // 2. Show tutorial for first-time users when they reach step 3
  useEffect(() => {
    const hasSeenStorage = localStorage.getItem("weddingTimelineTutorialSeen");
    if (!hasSeenTutorial && !hasSeenStorage) {
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
      setStep(2);
      
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
  const calculatedEvents = calculateTimeline(events, zaffaTime);

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

        // Show feedback prompt if user hasn't provided feedback yet
        if (!hasFeedback) {
          setTimeout(() => setShowFeedbackPrompt(true), 1000);
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
    const featureList = FEATURES.map((f) => ({
      id: f.id,
      label: f.label,
      category: f.category,
      enabled: selectedFeatures[f.id].enabled,
      duration: selectedFeatures[f.id].duration,
      hidden: f.hidden,
    })).filter((f) => f.enabled || f.hidden); // Include if enabled OR hidden (mandatory)

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

      // Add break if not the last event AND not after zaffa or any 'after' category events
      if (index < featureList.length - 1 && feature.id !== "zaffa" && feature.category !== "after") {
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

        // Show feedback prompt if user hasn't provided feedback yet
        if (!hasFeedback) {
          setTimeout(() => setShowFeedbackPrompt(true), 1000);
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
    // Validate at least one rating or selection
    const hasRatings = Object.values(feedbackRatings).some((r) => r > 0);
    const hasSelections = feedbackTimeSaved || feedbackFeelings.length > 0 || feedbackRecommend;
    
    if (!hasRatings && !hasSelections && !feedbackText.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide at least one response before submitting.",
        className: "bg-pinkey text-lovely border-lovely",
      });
      return;
    }

    setIsSubmittingFeedback(true);

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
        setShowFeedbackPrompt(false);
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

      // Helper function to add text centered in a cell
      const addCenteredText = (text: string, x: number, y: number, width: number, height: number, fontSize: number = 9) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        // Horizontal center
        const textX = x + (width - textWidth) / 2;
        // Vertical center - adjusted to move text higher for better centering
        const textY = y + (height / 2) + (fontSize / 4.5);
        doc.text(text, textX, textY);
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

      // Add "Wedding day timeline" title in script style
      doc.setFont("BebasNeue-Regular", "italic");
      doc.setFontSize(24);
      doc.setTextColor("#D32333");
      const titleY = 10 + logoHeight + 8;
      doc.text("My Wedding day timeline", doc.internal.pageSize.getWidth() / 2, titleY, {
        align: "center"
      });

      // Table configuration
      const startY = titleY + 10;
      const gap = 2; // Gap between cells
      const radius = 2; // Rounded corner radius
      const rowHeight = 8; // Increased for better text spacing
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
        // Check if we need a new page
        if (currentY + rowHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          doc.setFillColor("#FBF3E0");
          doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
          currentY = 20;
        }

        // Check if all activities are the same (merged cell)
        const allSame = 
          event.brideActivity === event.groomActivity &&
          event.brideActivity === event.bridesmaidsActivity &&
          event.brideActivity === event.groomsmenActivity;

        // Draw time cell (always pink)
        drawRoundedRect(startX, currentY, timeColWidth, rowHeight, radius, "#FFB6C7", "#D32333");
        doc.setTextColor("#D32333");
        doc.setFont("helvetica", "bold");
        addCenteredText(event.timeLabel || "", startX, currentY, timeColWidth, rowHeight, 9);

        if (allSame) {
          // Draw merged cell for all activities
          const mergedWidth = (activityColWidth * 4) + (gap * 3);
          const mergedX = startX + timeColWidth + gap;
          drawRoundedRect(mergedX, currentY, mergedWidth, rowHeight, radius, "#FBF3E0", "#D32333");
          doc.setTextColor("#D32333");
          doc.setFont("helvetica", "normal");
          addCenteredText(event.brideActivity, mergedX, currentY, mergedWidth, rowHeight, 9);
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
            addCenteredText(activity, cellX, currentY, activityColWidth, rowHeight, 9);
            cellX += activityColWidth + gap;
          });
        }

        currentY += rowHeight + gap;
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
        doc.setGState(new GState({ opacity: 0.1 }));
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

      doc.save("wedding-timeline.pdf");

      toast({
        title: "Success",
        description: "Timeline exported as PDF!",
        className: "bg-pinkey text-lovely border-lovely",
      });

      if (!hasFeedback) {
        setTimeout(() => setShowFeedbackPrompt(true), 1000);
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
      setHasAutoSaved(false);
      setShareUrl(null);
      setShowResetDialog(false);
      setHasSeenTutorial(false);
      
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
                    <div className="flex relative justify-center">
                      <div className="relative w-full max-w-xs">
                        <Input
                          type="time"
                          value={zaffaTime}
                          onChange={(e) => setZaffaTime(e.target.value)}
                          className="p-6 text-xl border-pinkey/50 focus:border-pinkey focus:ring-pinkey text-lovely/90 bg-creamey/20 text-center [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-lovely pointer-events-none z-20" />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                          if (!isAuthenticated) {
      // Save the selected zaffaTime to localStorage before redirecting
      localStorage.setItem('pendingZaffaTime', zaffaTime);
      setShowLoginDialog(true);
      return;
    }
    setStep(2);
                    }}
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

      {/* Feedback Dialog */}
      {showFeedbackDialog && step === 3 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey border-4 border-lovely rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowFeedbackDialog(false);
                setShowFeedbackPrompt(false);
              }}
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
                      onClick={() =>
                        setFeedbackRatings((prev) => ({
                          ...prev,
                          easeOfUse: star,
                        }))
                      }
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
                      onClick={() =>
                        setFeedbackRatings((prev) => ({
                          ...prev,
                          satisfaction: star,
                        }))
                      }
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
                </label>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[80px] placeholder:text-lovely/60 border-2 border-pinkey bg-creamey resize-none focus:border-lovely"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowFeedbackDialog(false);
                  setShowFeedbackPrompt(false);
                }}
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

      {/* Feedback Prompt (appears after using features) */}
      {showFeedbackPrompt && !showFeedbackDialog && step === 3 && (
        <div className="fixed bottom-24 right-6 bg-lovely text-white p-4 rounded-lg shadow-xl max-w-xs animate-in slide-in-from-bottom-4 duration-300 z-40">
          <button
            onClick={() => setShowFeedbackPrompt(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm mb-3 pr-4">
            Enjoying the timeline feature? We'd love to hear your thoughts!
          </p>
          <Button
            onClick={() => {
              setShowFeedbackPrompt(false);
              setShowFeedbackDialog(true);
            }}
            size="sm"
            className="w-full bg-creamey text-lovely hover:bg-creamey"
          >
            Share Feedback
          </Button>
        </div>
      )}

      {/* Floating Feedback Button (always visible if no feedback given) */}
      {!hasFeedback && step === 3 && !showFeedbackDialog && (
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
                  router.push("/signup?callbackUrl=/wedding-timeline?step=2");
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
                How to Use Wedding Timeline Planner
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
