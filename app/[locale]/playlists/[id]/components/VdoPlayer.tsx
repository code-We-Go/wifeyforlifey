// components/VdoPlayer.tsx
import { useEffect, useRef, useState, useCallback } from "react";

// Declare VdoPlayer global
declare global {
  interface Window {
    VdoPlayer: any;
  }
}

interface VdoPlayerProps {
  otp: string;
  playbackInfo: string;
  onVideoEnd?: () => void;
  onVideoStart?: () => void;
  onVideoReady?: () => void;
  onWatchThreshold?: () => void;
  watchThresholdPct?: number;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number; // 0 to 1
}

const VdoPlayer = ({
  otp,
  playbackInfo,
  onVideoEnd,
  onVideoStart,
  onVideoReady,
  onWatchThreshold,
  watchThresholdPct = 0.95,
  autoplay = true,
  muted = false,
  volume = 1,
}: VdoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const thresholdTriggeredRef = useRef(false);
  const readyHandledRef = useRef(false);
  // Keep latest callbacks in refs to avoid re-init loops
  const onVideoEndRef = useRef<typeof onVideoEnd>();
  const onVideoStartRef = useRef<typeof onVideoStart>();
  const onVideoReadyRef = useRef<typeof onVideoReady>();
  const onWatchThresholdRef = useRef<typeof onWatchThreshold>();
  const watchThresholdPctRef = useRef<number>(watchThresholdPct);

  useEffect(() => {
    onVideoEndRef.current = onVideoEnd;
  }, [onVideoEnd]);
  useEffect(() => {
    onVideoStartRef.current = onVideoStart;
  }, [onVideoStart]);
  useEffect(() => {
    onVideoReadyRef.current = onVideoReady;
  }, [onVideoReady]);
  useEffect(() => {
    onWatchThresholdRef.current = onWatchThreshold;
  }, [onWatchThreshold]);
  useEffect(() => {
    watchThresholdPctRef.current = watchThresholdPct ?? 0.95;
  }, [watchThresholdPct]);

  // Check if user has interacted with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("keydown", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  const initializePlayer = useCallback(async () => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    // Create the iframe element
    const iframe = document.createElement("iframe");

    // Build URL with proper parameters
    const urlParams = new URLSearchParams({
      otp,
      playbackInfo,
      autoplay: autoplay ? "true" : "false",
      muted: muted ? "true" : "false",
    });

    iframe.src = `https://player.vdocipher.com/v2/?${urlParams.toString()}`;
    iframe.style.cssText =
      "border:0;max-width:100%;position:absolute;top:0;left:0;height:100%;width:100%;";
    iframe.setAttribute("allowFullScreen", "true");
    iframe.setAttribute("allow", "encrypted-media; autoplay");
    iframe.setAttribute("id", "vdocipher-player-" + Date.now());

    // Store iframe reference
    iframeRef.current = iframe;

    // Create the wrapper div with proper aspect ratio
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "padding-top:56.25%;position:relative;width:100%;";

    // Append iframe to wrapper
    wrapper.appendChild(iframe);

    // Append wrapper to container
    containerRef.current.appendChild(wrapper);

    // Load the VdoCipher API script
    const loadApiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.VdoPlayer) {
          resolve();
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(
          'script[src="https://player.vdocipher.com/v2/api.js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () =>
            reject(new Error("Failed to load VdoCipher API"))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = "https://player.vdocipher.com/v2/api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load VdoCipher API"));
        document.head.appendChild(script);
      });
    };

    try {
      await loadApiScript();
      setIsApiReady(true);

      // Wait for iframe to load
      iframe.onload = () => {
        // Small delay to ensure VdoCipher player is fully initialized
        setTimeout(() => {
          try {
            if (window.VdoPlayer && iframe) {
              const player = window.VdoPlayer.getInstance(iframe);

              if (player) {
                playerRef.current = player;

                // Set up event listeners
                setupEventListeners(player);

                // Configure volume if not muted
                if (!muted && volume !== undefined) {
                  setTimeout(() => {
                    if (player.video) {
                      player.video.volume = volume;
                    }
                  }, 500);
                }

                setIsPlayerReady(true);
                onVideoReady?.();
              }
            }
          } catch (error) {
            console.error("Error getting VdoPlayer instance:", error);
          }
        }, 1000);
      };
    } catch (error) {
      console.error("Error initializing VdoCipher player:", error);
    }
  }, [otp, playbackInfo, autoplay, muted, volume]);

  const setupEventListeners = (player: any) => {
    // Reset threshold flag for a fresh video session
    thresholdTriggeredRef.current = false;

    // Prefer attaching to VdoCipher player instance
    const onEnded = () => {
      console.log("Video ended");
      onVideoEndRef.current?.();
    };
    const onPlay = () => {
      console.log("Video started playing");
      onVideoStartRef.current?.();
    };
    const onReady = () => {
      console.log("VdoCipher player ready");
      // Ensure ready logic runs once per init
      if (readyHandledRef.current) return;
      readyHandledRef.current = true;
      // If autoplay is enabled, try to play; fallback to muted autoplay
      try {
        if (autoplay) {
          setTimeout(() => {
            if (player?.video) {
              player.video.muted = false;
              player.video.volume = volume;
              player.video
                .play()
                .catch((error: any) => {
                  console.warn("Autoplay with sound failed, trying muted:", error);
                  // Fallback to muted autoplay (gesture not required)
                  try {
                    player.video.muted = true;
                    player.video.play().catch(() => {
                      // ignore if muted autoplay also fails
                    });
                  } catch {}
                });
            }
          }, 100);
        }
      } catch (e) {
        // ignore autoplay errors
      }
      onVideoReadyRef.current?.();
    };

    const onTimeUpdate = () => {
      try {
        const currentTime = player?.video?.currentTime ?? 0;
        const duration = player?.video?.duration ?? 0;
        if (!thresholdTriggeredRef.current && duration && duration > 0) {
          const pct = currentTime / duration;
          if (pct >= (watchThresholdPctRef.current ?? 0.95)) {
            thresholdTriggeredRef.current = true;
            onWatchThresholdRef.current?.();
          }
        }
      } catch (err) {
        // ignore progress errors
      }
    };

    try {
      // Attach to player instance events when available
      if (player?.addEventListener) {
        player.addEventListener("ended", onEnded);
        player.addEventListener("play", onPlay);
        player.addEventListener("ready", onReady);
        player.addEventListener("load", onReady);
        player.addEventListener("timeupdate", onTimeUpdate);
      }
      // Fallback to video element events
      if (player?.video?.addEventListener) {
        player.video.addEventListener("ended", onEnded);
        player.video.addEventListener("play", onPlay);
        player.video.addEventListener("loadeddata", onReady);
        player.video.addEventListener("timeupdate", onTimeUpdate);
        player.video.addEventListener("pause", () => {
          console.log("Video paused");
        });
        player.video.addEventListener("volumechange", () => {
          console.log(
            "Volume changed:",
            player.video.volume,
            "Muted:",
            player.video.muted
          );
        });
      }
    } catch (e) {
      console.warn("Failed to attach VdoCipher event listeners", e);
    }
  };

  useEffect(() => {
    initializePlayer();

    // Cleanup function
    return () => {
      readyHandledRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      playerRef.current = null;
      setIsApiReady(false);
      setIsPlayerReady(false);
    };
  }, [initializePlayer]);

  // Player control methods
  const play = useCallback(() => {
    if (playerRef.current?.video) {
      return playerRef.current.video.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current?.video) {
      playerRef.current.video.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (playerRef.current?.video) {
      playerRef.current.video.currentTime = time;
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current?.video) {
      return playerRef.current.video.currentTime;
    }
    return 0;
  }, []);

  const getDuration = useCallback(() => {
    if (playerRef.current?.video) {
      return playerRef.current.video.duration;
    }
    return 0;
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (playerRef.current?.video) {
      playerRef.current.video.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current?.video) {
      playerRef.current.video.muted = !playerRef.current.video.muted;
      return playerRef.current.video.muted;
    }
    return false;
  }, []);

  const unmute = useCallback(() => {
    if (playerRef.current?.video) {
      playerRef.current.video.muted = false;
      if (volume) {
        playerRef.current.video.volume = volume;
      }
    }
  }, [volume]);

  // Expose methods to parent component via ref
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).play = play;
      (containerRef.current as any).pause = pause;
      (containerRef.current as any).seek = seek;
      (containerRef.current as any).getCurrentTime = getCurrentTime;
      (containerRef.current as any).getDuration = getDuration;
      (containerRef.current as any).setVolume = setVolume;
      (containerRef.current as any).toggleMute = toggleMute;
      (containerRef.current as any).unmute = unmute;
      (containerRef.current as any).isApiReady = isApiReady;
      (containerRef.current as any).isPlayerReady = isPlayerReady;
    }
  }, [
    isApiReady,
    isPlayerReady,
    play,
    pause,
    seek,
    getCurrentTime,
    getDuration,
    setVolume,
    toggleMute,
    unmute,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
      }}
    />
  );
};

export default VdoPlayer;
