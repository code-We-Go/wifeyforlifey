"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Lock, Play, Clock, Calendar, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Playlist, Video } from "@/app/interfaces/interfaces";
import { mockUser } from "@/models/User";
import axios from "axios";
import { useSession } from "next-auth/react";
import { thirdFont } from "@/fonts";
import VdoPlayer from "./components/VdoPlayer";
import CommentSection from "@/components/video/CommentSection";
import LoadingSpinner from "@/app/checkout/components/LoadingSpinner";

export default function PlaylistPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoIdParam = searchParams?.get("videoId") || null;
  const router = useRouter();
  const playlistId = params.id as string;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleVideoEnd = () => {
    console.log("Video ended, triggering next video...");
    // Update playlist progress: add to videosWatched (lastWatchedVideoID is set on start)
    try {
      if (selectedVideo?._id) {
        axios
          .put("/api/playlist-progress", {
            playlistId,
            videoId: (selectedVideo as any)._id,
          })
          .then(() => fetchPlaylistProgress())
          .catch((err) =>
            console.warn("Failed to update playlist progress", err)
          );
      }
    } catch (e) {
      console.warn("Progress update threw", e);
    }
    nextVideo(); // autoplay next video on end
  };

  const nextVideo = () => {
    if (!playlist?.videos || playlist.videos.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.videos.length;
    setCurrentIndex(nextIndex);
    const nextVideo = playlist.videos[nextIndex];
    if (typeof nextVideo === "object" && nextVideo !== null) {
      setSelectedVideo(nextVideo);
    }
  };

  const prevVideo = () => {
    if (!playlist?.videos || playlist.videos.length === 0) return;
    const prevIndex =
      (currentIndex - 1 + playlist.videos.length) % playlist.videos.length;
    setCurrentIndex(prevIndex);
    const prevVideo = playlist.videos[prevIndex];
    if (typeof prevVideo === "object" && prevVideo !== null) {
      setSelectedVideo(prevVideo);
    }
  };

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedPlaylists, setRelatedPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeMore, setSeeMore] = useState(false); // <-- Add this line
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [lastWatchedVideoId, setLastWatchedVideoId] = useState<string | null>(
    null
  );
  const preferLastAppliedRef = useRef(false);

  const { data: session, status } = useSession();
  const isSubscribed = session?.user.isSubscribed || false;

  const watermarkText = session?.user.email || "";
  // VdoCipher expects watermark config as an array of objects, as a JSON string
  const watermarkConfig = JSON.stringify([
    {
      type: "rtext",
      text: watermarkText,
      alpha: "0.7",
      color: "0xFFFFFF",
      size: "4",
      interval: "60000",
    },
  ]);

  const [otp, setOtp] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Check if the selected video requires subscription
  const videoLocked = !selectedVideo?.isPublic && !isSubscribed;

  // Fetch the specific playlist
  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/playlists/${playlistId}`);
      console.log("Playlist data:", res.data);
      setPlaylist(res.data.data);

      // Check if we have a videoId in the URL params
      if (res.data.data.videos && res.data.data.videos.length > 0) {
        if (videoIdParam) {
          // Find the video with the matching ID
          const videoIndex = res.data.data.videos.findIndex(
            (video: any) => video._id === videoIdParam
          );
          if (videoIndex !== -1) {
            // Set the found video as selected and update current index
            setSelectedVideo(res.data.data.videos[videoIndex]);
            setCurrentIndex(videoIndex);
            console.log(
              `Selected video by ID: ${videoIdParam} at index ${videoIndex}`
            );
          } else {
            // If video not found, default to first video
            setSelectedVideo(res.data.data.videos[0]);
            console.log(
              `Video ID ${videoIdParam} not found, defaulting to first video`
            );
          }
        } else {
          // No videoId param; prefer last watched video for subscribed users
          if (status === "authenticated" && isSubscribed) {
            try {
              const progRes = await axios.get("/api/playlist-progress", {
                params: { playlistId },
              });
              const lastId = progRes.data?.progress?.lastWatchedVideoID
                ? String(progRes.data.progress.lastWatchedVideoID)
                : null;
              if (lastId) {
                const lastIndex = res.data.data.videos.findIndex(
                  (v: any) => String(v._id) === lastId
                );
                if (lastIndex !== -1) {
                  setSelectedVideo(res.data.data.videos[lastIndex]);
                  setCurrentIndex(lastIndex);
                  console.log(
                    `Selected last watched video: ${lastId} at index ${lastIndex}`
                  );
                  return; // Skip defaulting to first
                }
              }
            } catch (e) {
              console.warn(
                "Unable to fetch last watched video for playlist",
                e
              );
            }
          }
          // Fallback: default to first video
          // setSelectedVideo(res.data.data.videos[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching playlist:", error);
      setError(error.response?.data?.error || "Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  // Fetch related playlists
  const fetchRelatedPlaylists = useCallback(async () => {
    try {
      const res = await axios.get(`/api/playlists?all=true`);
      const allPlaylists = res.data.data;

      // Filter related playlists (same category or public ones, excluding current)
      const related = allPlaylists
        .filter(
          (p: Playlist) =>
            p._id !== playlistId &&
            (p.category === playlist?.category || !p.isPublic)
        )
        .slice(0, 3);

      setRelatedPlaylists(related);
    } catch (error) {
      console.error("Error fetching related playlists:", error);
    }
  }, [playlistId, playlist?.category]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleBlur = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        alert("Video paused because screen focus was lost.");
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // Fetch OTP and playbackInfo for VdoCipher
  const fetchVdoOtp = useCallback(
    async (videoId: string, watermark: string | undefined) => {
      setVideoLoading(true);
      setOtp(null);
      setPlaybackInfo(null);
      try {
        const res = await axios.post("/api/vdo", {
          videoID: videoId,
          annotate: watermark,
        });
        setOtp(res.data.otp);
        setPlaybackInfo(res.data.playbackInfo);
      } catch (error) {
        console.error("Error fetching VdoCipher OTP:", error);
      } finally {
        setVideoLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  useEffect(() => {
    if (playlist) {
      fetchRelatedPlaylists();
    }
  }, [playlist, fetchRelatedPlaylists]);

  // Create a playlist progress record when user enters the playlist
  useEffect(() => {
    if (status === "authenticated" && isSubscribed && playlistId) {
      axios
        .post("/api/playlist-progress", { playlistId })
        .catch((err) =>
          console.warn("Failed to create playlist progress", err)
        );
    }
  }, [status, isSubscribed, playlistId]);

  // Fetch watched videos for this playlist
  const fetchPlaylistProgress = useCallback(async () => {
    try {
      const res = await axios.get("/api/playlist-progress", {
        params: { playlistId },
      });
      const progress = res.data?.progress;
      const ids = new Set<string>(
        (progress?.videosWatched || []).map((id: any) => String(id))
      );
      setWatchedVideos(ids);
      setLastWatchedVideoId(
        progress?.lastWatchedVideoID
          ? String(progress.lastWatchedVideoID)
          : null
      );
    } catch (err) {
      console.warn("Failed to fetch playlist progress", err);
    }
  }, [playlistId]);

  useEffect(() => {
    if (status === "authenticated" && isSubscribed && playlistId) {
      fetchPlaylistProgress();
    }
  }, [status, isSubscribed, playlistId, fetchPlaylistProgress]);

  // Sync selectedVideo with currentIndex when playlist loads
  useEffect(() => {
    if (
      playlist?.videos &&
      playlist.videos.length > 0 &&
      currentIndex < playlist.videos.length
    ) {
      const video = playlist.videos[currentIndex];
      if (typeof video === "object" && video !== null) {
        if (!selectedVideo || String((selectedVideo as any)._id) !== String((video as any)._id)) {
          setSelectedVideo(video);
        }
      }
    }
  }, [playlist, currentIndex, selectedVideo]);

  // Fetch OTP when selectedVideo changes and is not locked
  useEffect(() => {
    if (selectedVideo && !videoLocked && selectedVideo.url) {
      fetchVdoOtp(selectedVideo.url, watermarkConfig);
    } else {
      setOtp(null);
      setPlaybackInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo, videoLocked, watermarkConfig]);

  // Respond to query param changes for videoId (client-side navigation)
  useEffect(() => {
    const vid = searchParams?.get("videoId");
    if (!playlist || !playlist.videos || playlist.videos.length === 0 || !vid)
      return;
    // If already on this video, do nothing
    if (selectedVideo && String((selectedVideo as any)._id) === String(vid)) return;
    const idx = playlist.videos.findIndex(
      (v: any) => String(v._id) === String(vid)
    );
    if (idx !== -1) {
      setCurrentIndex(idx);
      const v = playlist.videos[idx];
      if (typeof v === "object" && v !== null) {
        setSelectedVideo(v);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, playlist, selectedVideo]);

  // Prefer last-watched selection when no videoId query is present
  useEffect(() => {
    if (!playlist || !playlist.videos || playlist.videos.length === 0) return;
    // If a videoId is in the query, that effect above will handle selection
    const vidParam = searchParams?.get("videoId");
    if (vidParam) return;
    // Only apply once to avoid loops
    if (preferLastAppliedRef.current) return;
    if (status === "authenticated" && isSubscribed && lastWatchedVideoId) {
      // If current selection already matches last watched, mark applied and exit
      if (selectedVideo && String((selectedVideo as any)._id) === String(lastWatchedVideoId)) {
        preferLastAppliedRef.current = true;
        return;
      }
      const idx = playlist.videos.findIndex(
        (v: any) => String(v._id) === String(lastWatchedVideoId)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
        const v = playlist.videos[idx];
        if (typeof v === "object" && v !== null) {
          setSelectedVideo(v);
        }
        preferLastAppliedRef.current = true;
      }
    }
  }, [
    playlist,
    lastWatchedVideoId,
    searchParams,
    status,
    isSubscribed,
    selectedVideo,
  ]);

  // Update lastWatchedVideoID when user starts watching a new video
  useEffect(() => {
    const updateLast = async () => {
      try {
        if (
          status === "authenticated" &&
          isSubscribed &&
          playlistId &&
          selectedVideo?._id
        ) {
          await axios.patch("/api/playlist-progress", {
            playlistId,
            videoId: (selectedVideo as any)._id,
          });
          // Refresh local progress state so UI stays in sync
          fetchPlaylistProgress();
        }
      } catch (err) {
        console.warn("Failed to set last watched video", err);
      }
    };

    updateLast();
    // We only care about the selectedVideo object changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo]);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Add hover handlers
  const handleVideoMouseEnter = () => {
    setIsVideoHovered(true);
  };

  const handleVideoMouseLeave = () => {
    setIsVideoHovered(false);
  };

  if (isLoading) {
    return (
      <div className="container-custom flex-col flex w-full justify-center items-center bg-lovely h-auto min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-128px)] py-16 text-center">
        <div className="animate-spin text-creamey rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-creamey">Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-medium mb-4">Playlist not found</h1>
        <p className="text-lovely/90 mb-6">
          {error ||
            "The playlist you are looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link href="/playlists">Back to Playlists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12 h-auto min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-128px)]">
      {/* Breadcrumbs */}
      {/* <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-lovely/90 hover:text-foreground text-sm">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-lovely/90">/</span>
                <Link href="/playlists" className="text-lovely/90 hover:text-foreground text-sm">
                  Playlists
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-lovely/90">/</span>
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {playlist.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div> */}

      {/* Back button - mobile only */}
      {/* <div className="md:hidden mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/playlists">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Playlists
          </Link>
        </Button>
      </div> */}

      {/* Playlist Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 relative">
        <div className="lg:col-span-2 space-y-6">
          <div className=" ">
            {/* <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {playlist.category ? (playlist.category.charAt(0).toUpperCase() + playlist.category.slice(1)) : "Uncategorized"}
              </Badge>
              {!playlist.isPublic && (
                <Badge color="bg-everGreen" className="bg-everGreen text-everGreen" variant="outline">Premium</Badge>
              )}
            </div> */}
            <h1
              className={`${thirdFont.className} text-lovely text-4xl md:text-5xl font-semibold tracking-normal   `}
            >
              {playlist.title}
            </h1>
            <div
              className={`${
                seeMore ? "h-auto" : "max-h-[10vh]"
              }  overflow-hidden transition-all duration-300`}
            >
              {Array.isArray(playlist.description) ? (
                playlist.description.map((desc: string, idx: number) => (
                  <p
                    key={idx}
                    className="text-lovely/90 mt-2 whitespace-pre-line"
                  >
                    {desc}
                  </p>
                ))
              ) : (
                <p className="text-lovely/90 mt-2 whitespace-pre-line">
                  {playlist.description}
                </p>
              )}
            </div>
            {/* Add the See More / See Less button */}
            {(playlist?.description?.length > 1 ||
              playlist.description[0] !== "") && (
              <div className="mt-2">
                <button
                  className="text-lovely underline cursor-pointer focus:outline-none"
                  onClick={() => setSeeMore((prev) => !prev)}
                >
                  {seeMore ? "See Less" : "See More"}
                </button>
              </div>
            )}
          </div>

          {/* Video Player Section */}
          <div className="space-y-4">
            {selectedVideo ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                {videoLocked ? (
                  <div className=" aspect-video w-full h-full inset-0 flex flex-col items-center justify-center text-white p-1 sm:p-4 md:p-8 text-center">
                    {/* Thumbnail as background */}
                    {selectedVideo?.thumbnailUrl && (
                      <Image
                        src={selectedVideo.thumbnailUrl}
                        alt={selectedVideo.title}
                        fill
                        className="object-cover z-0"
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    {/* Black overlay */}
                    <div className="absolute inset-0 w-full bg-black/70 z-10" />
                    {/* Lock icon and message */}
                    <div className="relative w-full z-20 justify-center flex flex-col items-center">
                      <Lock className="h-10 w-10 md:h-16 md:w-16 mb-1 md:mb-4 text-creamey" />
                      <h3 className="text-base md:text-xl font-medium mb-1 md:mb-4">
                        This video is exclusive to the Wifeys community!
                      </h3>
                      <p className="mb-1 text-xs md:text-base md:mb-4 max-w-md">
                        Subscribe now for planning hacks, vendor tips, expert
                        advices, emotional support, and bridal tea 10x juicier
                        than anything I’ve shared on TikTok in the last year and
                        a half ✨.
                      </p>
                      <Button
                        onClick={() =>
                          router.push("/subscription/687396821b4da119eb1c13fe")
                        }
                        size="sm"
                        className="rounded-2xl text-xs md:text-base hover:bg-creamey hover:text-lovely text-creamey bg-lovely"
                      >
                        Subscribe Now
                      </Button>
                    </div>
                  </div>
                ) : videoLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading video...</p>
                  </div>
                ) : otp && playbackInfo ? (
                  <div
                    className="relative"
                    onMouseEnter={handleVideoMouseEnter}
                    onMouseLeave={handleVideoMouseLeave}
                  >
                    <Suspense fallback={<LoadingSpinner />}>
                      <VdoPlayer
                        otp={otp}
                        playbackInfo={playbackInfo}
                        autoplay={currentIndex === 0 ? false : true}
                        muted={false}
                        volume={0.8}
                        onVideoEnd={handleVideoEnd}
                      />
                    </Suspense>
                    {/* Navigation buttons - positioned to avoid video controls */}
                    <div
                      className={`absolute top-[45%] left-4 right-4 flex justify-between items-center transition-opacity duration-300 pointer-events-none ${
                        isVideoHovered ? "opacity-100 " : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={prevVideo}
                        className="bg-black/50 hover:bg-lovely/90 text-white rounded-full px-3 py-1.5  transition-colors duration-200 pointer-events-auto text-sm"
                      >
                        ⏮
                      </button>
                      <button
                        onClick={nextVideo}
                        className="bg-black/50 hover:bg-lovely/90 text-white px-3 py-1.5 rounded-full transition-colors duration-200 pointer-events-auto text-sm"
                      >
                        ⏭
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <p>Unable to load video.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <p className="text-lovely/90">
                  No videos available in this playlist.
                </p>
              </div>
            )}

            {selectedVideo && (
              <div>
                <h2
                  className={`${thirdFont.className} text-3xl text-lovely font-medium`}
                >
                  {selectedVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-lovely/90 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(new Date())}
                  </div>
                </div>
                <p className="text-lovely/90 mt-2 whitespace-pre-line">
                  {selectedVideo.description}
                </p>

                {/* Comment Section */}
                {selectedVideo._id && (
                  <CommentSection videoId={selectedVideo._id} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Playlist Videos */}
        <div className="space-y-4 md:pl-6 sticky top-8 h-fit">
          <div className="flex items-center justify-between">
            <h2
              className={`${thirdFont.className} text-3xl tracking-normal text-lovely font-medium`}
            >
              Videos in this Playlist
            </h2>
            <span className="text-sm text-lovely/90">
              {playlist.videos?.length || 0}{" "}
              {(playlist.videos?.length || 0) === 1 ? "video" : "videos"}
            </span>
          </div>

          <div className="bg-card border border-lovely rounded-lg overflow-hidden shadow-sm">
            {/* Playlist progress (subscribed users only) */}
            {status === "authenticated" && isSubscribed && (
              <div className="p-4  bg-creamey/90">
                <div className="flex items-center justify-between text-sm text-lovely  mb-2">
                  <span>
                    Watched {watchedVideos.size} of{" "}
                    {playlist.videos?.length || 0}
                  </span>
                  <span>
                    {playlist.videos?.length
                      ? Math.round(
                          (watchedVideos.size /
                            (playlist.videos?.length || 1)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    playlist.videos?.length
                      ? Math.round(
                          (watchedVideos.size /
                            (playlist.videos?.length || 1)) *
                            100
                        )
                      : 0
                  }
                  className="h-3 bg-pinkey/70 text-lovely"
                />
              </div>
            )}

            <div className="divide-y max-h-[70vh] overflow-y-auto ">
              {Array.isArray(playlist.videos) &&
                playlist.videos.map((video: any, index) => {
                  console.log(
                    "isLocked" + video.isPublic + isSubscribed + video.title
                  );
                  const isLocked = !video.isPublic && !isSubscribed;
                  const isActive = selectedVideo?._id === video._id;

                  return (
                    <div
                      key={video._id}
                      className={`${
                        thirdFont.className
                      } cursor-pointer relative transition-colors p-4 text-creamey ${
                        isActive
                          ? "bg-lovely text-creamey"
                          : "bg-pinkey text-lovely  hover:bg-lovely hover:text-creamey "
                      }`}
                      onClick={() => {
                        const videoIndex = playlist.videos.findIndex(
                          (v: any) => v._id === video._id
                        );
                        if (videoIndex !== -1) {
                          setCurrentIndex(videoIndex);
                          setSelectedVideo(video);
                          // Update URL using Next router so searchParams updates
                          router.push(
                            `/playlists/${playlistId}?videoId=${video._id}`
                          );
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                          {/* <Image
                            src={video.thumbnailUrl || "/video/1.png"}
                            alt={video.title}
                            fill
                            unoptimized
                            className="object-cover aspect-video"
                          /> */}
                          <img
                            src={video.thumbnailUrl || "/video/1.png"}
                            alt={video.title}
                            className="object-cover aspect-video w-full h-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            {isLocked ? (
                              <Lock className="h-5 w-5 text-white" />
                            ) : (
                              <Play className="h-5 w-5 text-white" />
                            )}
                          </div>
                        </div>
                        {isSubscribed &&
                          watchedVideos.has(String(video._id)) && (
                            <div className="absolute top-1 right-1 bg-white/80 rounded-2xl p-0.5">
                              <Check className="h-4 w-4 text-lovely" />
                            </div>
                          )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium line-clamp-2">
                            {video.title}
                          </h5>
                          <div className="flex items-center mt-1">
                            {!video.isPublic && (
                              <span className="text-xs bg-muted text-everGreen px-1.5 py-0.5 rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {playlist.isPublic && !isSubscribed && (
            <div className="bg-lovely text-creamey rounded-lg p-4 text-center">
              <p className="text-sm mb-3">
                Subscribe to unlock all premium videos in this playlist.
              </p>
              <Button
                onClick={() =>
                  router.push("/subscription/687396821b4da119eb1c13fe")
                }
                size="sm"
                className="rounded-2xl bg-creamey hover:text-lovely text-lovely hover:bg-creamey hover:font-semibold"
              >
                Subscribe Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Playlists */}
      {relatedPlaylists.length > 0 && (
        <div className="mt-16">
          <h2
            className={`${thirdFont.className} text-3xl tracking-normal font-meduim text-lovely mb-6`}
          >
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPlaylists.map((relatedPlaylist) => (
              <Link
                key={relatedPlaylist._id}
                href={`/playlists/${relatedPlaylist._id}`}
                className="block"
              >
                <div className="video-card group">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      unoptimized
                      src={relatedPlaylist.thumbnailUrl || "/video/1.png"}
                      alt={relatedPlaylist.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center">
                        {relatedPlaylist.isPublic ? (
                          <Lock className="h-5 w-5 text-lovely" />
                        ) : (
                          <Play className="h-5 w-5 text-lovely ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 min-h-[15vh] md:min-h-[25vh] bg-lovely text-creamey">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Badge variant="secondary" className="font-normal">
                        {relatedPlaylist.category ? (relatedPlaylist.category.charAt(0).toUpperCase() + relatedPlaylist.category.slice(1)) : "Uncategorized"}
                      </Badge> */}
                      {/* {relatedPlaylist.isPublic && (
                        <Badge variant="outline" className="font-normal">
                          Premium
                        </Badge>
                      )} */}
                    </div>
                    <h3 className="font-medium line-clamp-1">
                      {relatedPlaylist.title}
                    </h3>
                    <p className="text-sm text-creamey/70 mt-1 line-clamp-2">
                      {relatedPlaylist.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
