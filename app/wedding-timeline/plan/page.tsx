"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Define the Event type
type TimelineEvent = {
  id: string;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  duration: number; // minutes
  timeLabel?: string;
};

const defaultEvents: TimelineEvent[] = [
  {
    id: "arrival",
    duration: 30,
    brideActivity: "Arrival to the venue",
    groomActivity: "",
    bridesmaidsActivity: "",
    groomsmenActivity: "",
  },
  {
    id: "hair",
    duration: 60,
    brideActivity: "Hair Styling",
    groomActivity: "",
    bridesmaidsActivity: "",
    groomsmenActivity: "",
  },
  {
    id: "makeup",
    duration: 105,
    brideActivity: "Makeup",
    groomActivity: "",
    bridesmaidsActivity: "",
    groomsmenActivity: "",
  },
  {
    id: "ready_pics",
    duration: 15,
    brideActivity: "Getting Ready pictures",
    groomActivity: "Getting Ready pictures",
    bridesmaidsActivity: "Getting Ready pictures",
    groomsmenActivity: "Getting Ready pictures",
  },
  {
    id: "ceremony_clothes",
    duration: 30,
    brideActivity: "Wearing ceremony clothes",
    groomActivity: "Wearing Suit",
    bridesmaidsActivity: "Getting ready",
    groomsmenActivity: "Getting ready",
  },
  {
    id: "first_look",
    duration: 15,
    brideActivity: "First Look",
    groomActivity: "First Look",
    bridesmaidsActivity: "",
    groomsmenActivity: "",
  },
  {
    id: "photoshoot",
    duration: 120,
    brideActivity: "Photoshoot",
    groomActivity: "Photoshoot",
    bridesmaidsActivity: "Group Pictures",
    groomsmenActivity: "Group Pictures",
  },
  {
    id: "break",
    duration: 30,
    brideActivity: "Bridal Team Break!",
    groomActivity: "Bridal Team Break!",
    bridesmaidsActivity: "Guest Entrance",
    groomsmenActivity: "Guest Entrance",
  },
  {
    id: "zaffa",
    duration: 30,
    brideActivity: "Zaffa / Entrance",
    groomActivity: "Zaffa / Entrance",
    bridesmaidsActivity: "Zaffa / Entrance",
    groomsmenActivity: "Zaffa / Entrance",
  },
  {
    id: "guests_pics",
    duration: 30,
    brideActivity: "Pictures with guests",
    groomActivity: "Pictures with guests",
    bridesmaidsActivity: "Pictures with guests",
    groomsmenActivity: "Pictures with guests",
  },
  {
    id: "party_1",
    duration: 90,
    brideActivity: "Party Time",
    groomActivity: "Party Time",
    bridesmaidsActivity: "Party Time",
    groomsmenActivity: "Party Time",
  },
  {
    id: "dinner",
    duration: 60,
    brideActivity: "Dinner",
    groomActivity: "Dinner",
    bridesmaidsActivity: "Dinner",
    groomsmenActivity: "Dinner",
  },
  {
    id: "party_2",
    duration: 120,
    brideActivity: "Party Time!",
    groomActivity: "Party Time!",
    bridesmaidsActivity: "Party Time!",
    groomsmenActivity: "Party Time!",
  },
  {
    id: "end",
    duration: 0,
    brideActivity: "Wedding Ends",
    groomActivity: "Wedding Ends",
    bridesmaidsActivity: "Wedding Ends",
    groomsmenActivity: "Wedding Ends",
  },
];

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
  const startTimeParam = searchParams.get("startTime") || "10:30";
  const weddingStartTimeParam = searchParams.get("weddingStartTime") || "18:00";
  const { toast } = useToast();

  const [events, setEvents] = useState<TimelineEvent[]>(defaultEvents);
  const [baseTime, setBaseTime] = useState<Date>(new Date());
  const [weddingStartTime, setWeddingStartTime] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (startTimeParam) {
      const [hours, minutes] = startTimeParam.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setBaseTime(date);
    }
    if (weddingStartTimeParam) {
      const [hours, minutes] = weddingStartTimeParam.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setWeddingStartTime(date);
    }
  }, [startTimeParam, weddingStartTimeParam]);

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

  // Calculate times for rendering
  let currentTime = new Date(baseTime);
  const calculatedEvents = events.map((event) => {
    const start = new Date(currentTime);
    const end = addMinutes(start, event.duration);
    currentTime = end; // Next event starts when this one ends

    // For display: if duration is 0, it's a point in time
    const timeLabel =
      event.duration > 0
        ? `${formatTime(start)} - ${formatTime(end)}`
        : formatTime(start);

    return { ...event, timeLabel };
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/wedding-timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: startTimeParam,
          weddingStartTime: weddingStartTimeParam,
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

      toast({
        title: "Success",
        description: "Your timeline has been saved!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timeline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-creamey p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border-2 border-pinkey/20">
        <div className="p-6 bg-pinkey/10 border-b border-pinkey/20 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display text-heading-color">
              Wedding Day Timeline
            </h1>
            <p className="text-muted-foreground">
              Start Time:{" "}
              <span className="font-semibold text-heading-color">
                {formatTime(baseTime)}
              </span>{" "}
              | Wedding Start:{" "}
              <span className="font-semibold text-heading-color">
                {formatTime(weddingStartTime)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/wedding-timeline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Restart
              </Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-heading-color text-white hover:bg-heading-color/90"
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
          <Table>
            <TableHeader className="bg-creamey/50">
              <TableRow>
                <TableHead className="w-[180px] font-bold text-heading-color">
                  TIME
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  Duration (min)
                </TableHead>
                <TableHead className="font-bold text-heading-color">
                  BRIDE
                </TableHead>
                <TableHead className="font-bold text-heading-color">
                  GROOM
                </TableHead>
                <TableHead className="font-bold text-heading-color">
                  BRIDESMAIDS
                </TableHead>
                <TableHead className="font-bold text-heading-color">
                  GROOMSMEN
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedEvents.map((event, index) => (
                <TableRow key={event.id} className="hover:bg-pinkey/5">
                  <TableCell className="font-medium whitespace-nowrap text-sm bg-creamey/30">
                    <span className="bg-pinkey/20 px-2 py-1 rounded text-heading-color font-semibold">
                      {event.timeLabel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={event.duration}
                      onChange={(e) =>
                        handleDurationChange(index, e.target.value)
                      }
                      className="w-20 text-center h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={event.brideActivity}
                      onChange={(e) =>
                        handleActivityChange(
                          index,
                          "brideActivity",
                          e.target.value
                        )
                      }
                      className="h-8 bg-transparent border-none focus:bg-white focus:border-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={event.groomActivity}
                      onChange={(e) =>
                        handleActivityChange(
                          index,
                          "groomActivity",
                          e.target.value
                        )
                      }
                      className="h-8 bg-transparent border-none focus:bg-white focus:border-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={event.bridesmaidsActivity}
                      onChange={(e) =>
                        handleActivityChange(
                          index,
                          "bridesmaidsActivity",
                          e.target.value
                        )
                      }
                      className="h-8 bg-transparent border-none focus:bg-white focus:border-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={event.groomsmenActivity}
                      onChange={(e) =>
                        handleActivityChange(
                          index,
                          "groomsmenActivity",
                          e.target.value
                        )
                      }
                      className="h-8 bg-transparent border-none focus:bg-white focus:border-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEvent(index)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-pinkey/20 bg-creamey/20">
          <Button
            onClick={handleAddNewEvent}
            variant="outline"
            className="w-full border-dashed border-2 border-pinkey/40 text-muted-foreground hover:bg-pinkey/10 hover:text-heading-color hover:border-pinkey"
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
