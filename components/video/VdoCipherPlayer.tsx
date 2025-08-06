"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VdoCipherPlayerProps {
  otp: string;
  playbackInfo: string;
  onVideoEnd?: () => void;
  onVideoReady?: () => void;
  onVideoError?: (error: any) => void;
  showControls?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentVideoTitle?: string;
  userId?: string;
  videoId?: string;
  playlistId?: string;
}

declare global {
  interface Window {
    VdoPlayer: any;
  }
}

export default function VdoCipherPlayer({
  otp,
  playbackInfo,
  onVideoEnd,
  onVideoReady,
  onVideoError,
  showControls = true,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentVideoTitle = "",
  userId,
  videoId,
  playlistId,
}: VdoCipherPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const vdoPlayerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // localStorage key for video progress
  const getProgressKey = () => {
    if (!userId || !videoId || !playlistId) return null;
    return `video_progress_${userId}_${playlistId}_${videoId}`;
  };

  // Save video progress to localStorage
  const saveVideoProgress = (currentTime: number, duration: number) => {
    const progressKey = getProgressKey();
    if (!progressKey) return;

    const progressData = {
      currentTime,
      duration,
      timestamp: Date.now(),
      videoId,
      playlistId,
    };

    try {
      localStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.warn("Failed to save video progress:", error);
    }
  };

  // Load video progress from localStorage
  const loadVideoProgress = () => {
    const progressKey = getProgressKey();
    if (!progressKey) return null;

    try {
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        // Only restore if the save is less than 7 days old
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (progressData.timestamp > sevenDaysAgo) {
          return progressData;
        }
      }
    } catch (error) {
      console.warn("Failed to load video progress:", error);
    }
    return null;
  };

  // Load VdoCipher script
  useEffect(() => {
    const loadVdoCipherScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script is already loaded
        if (window.VdoPlayer) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://player.vdocipher.com/playerAssets/1.6.10/vdo.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load VdoCipher script"));
        document.head.appendChild(script);
      });
    };

    loadVdoCipherScript()
      .then(() => {
        console.log("VdoCipher script loaded successfully");
      })
      .catch((err) => {
        console.error("Error loading VdoCipher script:", err);
        console.log("Falling back to iframe implementation");
        setUseIframeFallback(true);
        setIsLoading(false);
      });
  }, []);

  // Initialize player when OTP and playbackInfo change
  useEffect(() => {
    if (!otp || !playbackInfo) {
      return;
    }

    // If using iframe fallback, just set loading to false
    if (useIframeFallback) {
      setIsLoading(false);
      setIsPlayerReady(true);
      onVideoReady?.();
      return;
    }

    if (!window.VdoPlayer || !playerRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsPlayerReady(false);

    // Set a timeout to fallback to iframe if player doesn't load within 10 seconds
    const loadTimeout = setTimeout(() => {
      if (!isPlayerReady && isLoading) {
        console.log("Player loading timeout, falling back to iframe");
        setUseIframeFallback(true);
        setIsLoading(false);
        setIsPlayerReady(true);
        onVideoReady?.();
      }
    }, 10000);

    // Destroy existing player if it exists
    if (vdoPlayerRef.current) {
      try {
        vdoPlayerRef.current.destroy();
      } catch (err) {
        console.warn("Error destroying previous player:", err);
      }
      vdoPlayerRef.current = null;
    }

    // Clear the container
    if (playerRef.current) {
      playerRef.current.innerHTML = "";
    }

    try {
      // Initialize new player
      vdoPlayerRef.current = new window.VdoPlayer({
        otp: otp,
        playbackInfo: playbackInfo,
        theme: "9ae8bbe8dd964ddc9bdb932cca1cb59a",
        container: playerRef.current,
        autoplay: false,
        muted: false,
        controls: true,
        playsinline: true,
        playerHighColor: "#D32333", // Set the lovely color for progress bar
        playerLowColor: "#FFB6C7", // Set pinkey color for background
      });

      // Add event listeners
      vdoPlayerRef.current.addEventListener("load", () => {
        console.log("VdoCipher player loaded");
        clearTimeout(loadTimeout);
        setIsPlayerReady(true);
        setIsLoading(false);
        onVideoReady?.();

        // Restore saved progress after player is loaded
        const savedProgress = loadVideoProgress();
        if (savedProgress && savedProgress.currentTime > 10) { // Only restore if more than 10 seconds
          setTimeout(() => {
            if (vdoPlayerRef.current) {
              try {
                vdoPlayerRef.current.seek(savedProgress.currentTime);
                console.log(`Restored video progress to ${savedProgress.currentTime} seconds`);
              } catch (error) {
                console.warn("Failed to restore video progress:", error);
              }
            }
          }, 2000); // Wait 2 seconds for player to be fully ready
        }
      });

      // Add ready event listener as backup
      vdoPlayerRef.current.addEventListener("ready", () => {
        console.log("VdoCipher player ready");
        if (!isPlayerReady) {
          clearTimeout(loadTimeout);
          setIsPlayerReady(true);
          setIsLoading(false);
          onVideoReady?.();
        }
      });

      vdoPlayerRef.current.addEventListener("error", (error: any) => {
        console.error("VdoCipher player error:", error);
        setError("Error loading video");
        setIsLoading(false);
        onVideoError?.(error);
      });

      vdoPlayerRef.current.addEventListener("ended", () => {
        console.log("Video ended");
        // Clear saved progress when video ends
        const progressKey = getProgressKey();
        if (progressKey) {
          try {
            localStorage.removeItem(progressKey);
          } catch (error) {
            console.warn("Failed to clear video progress:", error);
          }
        }
        onVideoEnd?.();
      });

      vdoPlayerRef.current.addEventListener("timeupdate", () => {
        // Save progress every 5 seconds
        if (vdoPlayerRef.current) {
          try {
            const currentTime = vdoPlayerRef.current.getCurrentTime();
            const duration = vdoPlayerRef.current.getDuration();
            
            if (currentTime && duration && currentTime > 5) {
              // Throttle saves to every 5 seconds
              const now = Date.now();
              const lastSave = vdoPlayerRef.current._lastProgressSave || 0;
              if (now - lastSave > 5000) {
                saveVideoProgress(currentTime, duration);
                vdoPlayerRef.current._lastProgressSave = now;
              }
            }
          } catch (error) {
            // Ignore errors in timeupdate to avoid spam
          }
        }
      });

    } catch (err) {
      console.error("Error initializing VdoCipher player:", err);
      console.log("Falling back to iframe implementation due to initialization error");
      setUseIframeFallback(true);
      setIsLoading(false);
      setIsPlayerReady(true);
    }

    // Cleanup function
    return () => {
      clearTimeout(loadTimeout);
      if (vdoPlayerRef.current) {
        try {
          vdoPlayerRef.current.destroy();
        } catch (err) {
          console.warn("Error destroying player on cleanup:", err);
        }
        vdoPlayerRef.current = null;
      }
    };
  }, [otp, playbackInfo, onVideoEnd, onVideoReady, onVideoError, useIframeFallback]);

  const handlePrevious = () => {
    if (hasPrevious && onPrevious) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (hasNext && onNext) {
      onNext();
    }
  };

  return (
    <div className="relative w-full">
      {/* Video Player Container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10">
            <p className="text-center px-4">{error}</p>
          </div>
        )}

        {/* VdoCipher Player Container */}
        {useIframeFallback ? (
          <div className="w-full h-full">
            <iframe
              src={`https://player.vdocipher.com/v2/?otp=${encodeURIComponent(
                otp
              )}&playbackInfo=${encodeURIComponent(playbackInfo)}`}
              className="w-full h-full"
              style={{
                border: 0,
                minHeight: "100%",
              }}
              allowFullScreen
              allow="encrypted-media"
            />
          </div>
        ) : (
          <div
            ref={playerRef}
            className="w-full h-full"
            style={{ minHeight: "100%" }}
          />
        )}

        {/* Navigation Controls Overlay */}
        {showControls && isPlayerReady && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Previous Button */}
            {hasPrevious && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto bg-lovely/80 hover:bg-lovely text-white border-0 h-12 w-12 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Next Button */}
            {hasNext && (
              <Button
                onClick={handleNext}
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto bg-lovely/80 hover:bg-lovely text-white border-0 h-12 w-12 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* External Navigation Controls */}
      {showControls && (
        <div className="flex items-center justify-between mt-4 px-2">
          <Button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-lovely text-lovely hover:bg-lovely hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="h-4 w-4" />
            Previous
          </Button>

          {currentVideoTitle && (
            <div className="flex-1 text-center px-4">
              <p className="text-sm text-muted-foreground truncate">
                {currentVideoTitle}
              </p>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={!hasNext}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-lovely text-lovely hover:bg-lovely hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}