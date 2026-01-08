"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WeddingTimelinePage() {
  const [startTime, setStartTime] = useState("10:30");
  const [weddingStartTime, setWeddingStartTime] = useState("18:00");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/wedding-timeline/plan?startTime=${startTime}&weddingStartTime=${weddingStartTime}`);
  };

  return (
    <div className="min-h-screen bg-creamey flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-2 border-pinkey/20">
        <h1 className="text-4xl font-display text-center mb-2 text-heading-color">
          Wedding Day
        </h1>
        <h2 className="text-2xl font-display text-center mb-8 text-pinkey italic">
          Timeline
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="startTime" className="text-lg text-heading-color">
              What time does your day start?
            </Label>
            <div className="relative">
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="text-lg p-6 border-pinkey/30 focus:border-pinkey focus:ring-pinkey bg-creamey/20"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Usually this is when you arrive at the venue.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="weddingStartTime" className="text-lg text-heading-color">
              What time does the wedding start?
            </Label>
            <div className="relative">
              <Input
                id="weddingStartTime"
                type="time"
                value={weddingStartTime}
                onChange={(e) => setWeddingStartTime(e.target.value)}
                required
                className="text-lg p-6 border-pinkey/30 focus:border-pinkey focus:ring-pinkey bg-creamey/20"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This is usually the Zaffa or Ceremony start time.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-pinkey hover:bg-pinkey/90 text-heading-color font-bold text-lg py-6"
          >
            Start Planning
          </Button>
        </form>
      </div>
    </div>
  );
}
