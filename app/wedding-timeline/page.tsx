"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { thirdFont } from "@/fonts";

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

export default function WeddingTimelinePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // State
  const [step, setStep] = useState<1 | 2>(1);
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

  // Check for existing timeline
  useEffect(() => {
    const checkExistingTimeline = async () => {
      if (isAuthenticated && !loading) {
        setCheckingTimeline(true);
        try {
          const res = await fetch("/api/wedding-timeline");
          if (res.ok) {
            const data = await res.json();
            if (data.found && data.data) {
              const { zaffaTime, selectedFeatures } = data.data;
              const params = new URLSearchParams();
              params.set("zaffa", zaffaTime);

              // Map DB features to URL param format
              const featuresParam = selectedFeatures
                .filter((f: any) => f.enabled)
                .map((f: any) => `${f.name}:${f.duration}`)
                .join(",");

              params.set("features", featuresParam);
              router.push(`/wedding-timeline/plan?${params.toString()}`);
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
  }, [isAuthenticated, loading, router]);

  const handleFeatureToggle = (id: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const handleDurationChange = (id: string, duration: number) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: { ...prev[id], duration },
    }));
  };

  const handlePlan = () => {
    // 1. Construct the data object
    const data = {
      zaffaTime,
      features: FEATURES.map((f) => ({
        id: f.id,
        label: f.label,
        category: f.category,
        enabled: selectedFeatures[f.id].enabled,
        duration: selectedFeatures[f.id].duration,
      })),
    };

    // 2. Serialize for URL
    // We'll pass essential data via URL params
    const params = new URLSearchParams();
    params.set("zaffa", zaffaTime);

    // Pass selected features as a comma-separated string of "id:duration"
    // Only pass enabled ones
    const featuresParam = data.features
      .filter((f) => f.enabled)
      .map((f) => `${f.id}:${f.duration}`)
      .join(",");

    params.set("features", featuresParam);

    const targetUrl = `/wedding-timeline/plan?${params.toString()}`;

    // 3. Check Auth
    if (!isAuthenticated) {
      // Force login by redirecting to login with callback
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(targetUrl)}`;
      router.push(loginUrl);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-[85vh] bg-creamey flex p-8 md:pt-16 flex-col items-center justify-center ">
      <div className="bg-creamey border-lovely p-8 rounded-lg shadow-lg max-w-2xl w-full border-4 relative">
        <Image
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
        {/* <h2 className="text-2xl font-display text-center mb-8 text-pinkey italic">
          Timeline Wizard
        </h2> */}

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
                  {/* <p className="text-sm text-muted-foreground text-center">
                This will be the anchor for your timeline.
              </p> */}
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
                                handleDurationChange(
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
                    {loading ? "Checking..." : "Plan My Day"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
