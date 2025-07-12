"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Lock, Play, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Playlist, Video } from "@/app/interfaces/interfaces";
import { mockUser } from "@/models/User";
import axios from "axios";
import { useSession } from "next-auth/react";
import { thirdFont } from "@/fonts";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedPlaylists, setRelatedPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      interval: "60000"
    }
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
      
      // Set the first video as selected if available
      if (res.data.data.videos && res.data.data.videos.length > 0) {
        setSelectedVideo(res.data.data.videos[0]);
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
        .filter((p: Playlist) => 
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
  const fetchVdoOtp = useCallback(async (videoId: string, watermark: string | undefined) => {
    setVideoLoading(true);
    setOtp(null);
    setPlaybackInfo(null);
    try {
      const res = await axios.post("/api/vdo", { videoID: videoId, annotate: watermark });
      setOtp(res.data.otp);
      setPlaybackInfo(res.data.playbackInfo);
    } catch (error) {
      console.error("Error fetching VdoCipher OTP:", error);
    } finally {
      setVideoLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  useEffect(() => {
    if (playlist) {
      fetchRelatedPlaylists();
    }
  }, [playlist, fetchRelatedPlaylists]);

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

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          {error || "The playlist you are looking for doesn't exist or has been removed."}
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
          <div>
            {/* <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {playlist.category ? (playlist.category.charAt(0).toUpperCase() + playlist.category.slice(1)) : "Uncategorized"}
              </Badge>
              {!playlist.isPublic && (
                <Badge color="bg-everGreen" className="bg-everGreen text-everGreen" variant="outline">Premium</Badge>
              )}
            </div> */}
            <h1 className={`${thirdFont.className} text-lovely text-4xl md:text-5xl font-semibold tracking-normal   `}>{playlist.title}</h1>
            {Array.isArray(playlist.description) ? (
              playlist.description.map((desc: string, idx: number) => (
                <p key={idx} className="text-lovely/90 mt-2">{desc}</p>
              ))
            ) : (
              <p className="text-lovely/90 mt-2">{playlist.description}</p>
            )}
          </div>

          {/* Video Player Section */}
          <div className="space-y-4">
            {selectedVideo ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                {videoLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <Lock className="h-16 w-16 mb-4 text-lovely" />
                    <h3 className="text-xl font-medium mb-2">Premium Content</h3>
                    <p className="mb-4 max-w-md">
                      This video is only available to premium subscribers. Subscribe now to unlock all our premium content.
                    </p>
     <Button 
                   onClick={()=>router.push("/subscription")}

     size="sm" className="rounded-2xl hover:bg-creamey hover:text-lovely text-creamey bg-lovely">
                Subscribe Now
              </Button>
                  </div>
                ) : videoLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading video...</p>
                  </div>
                ) : otp && playbackInfo ? (
                  <div style={{ paddingTop: "56.25%", position: "relative" }}>
                    <iframe

                      src={`https://player.vdocipher.com/v2/?otp=${encodeURIComponent(otp)}&playbackInfo=${encodeURIComponent(playbackInfo)}`}
                      style={{
                        border: 0,
                        maxWidth: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "100%",
                      }}
                      allowFullScreen
                      allow="encrypted-media"
                    ></iframe>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <p>Unable to load video.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <p className="text-lovely/90">No videos available in this playlist.</p>
              </div>
            )}

            {selectedVideo && (
              <div>
                <h2 className={`${thirdFont.className} text-3xl text-lovely font-medium`}>{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-lovely/90 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(new Date())}
                  </div>
                </div>
                <p className="text-lovely/90 mt-2">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Videos */}
        <div className="space-y-4 md:pl-6 sticky top-8 h-fit">
          <div className="flex items-center justify-between">
            <h2 className={`${thirdFont.className} text-3xl tracking-normal text-lovely font-medium`}>Videos in this Playlist</h2>
            <span className="text-sm text-lovely/90">
              {playlist.videos?.length || 0} {(playlist.videos?.length || 0) === 1 ? "video" : "videos"}
            </span>
          </div>
          
          <div className="bg-card rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y max-h-[70vh] overflow-y-auto scrollbar-hide">
              {Array.isArray(playlist.videos) && playlist.videos.map((video: any,index) => {
                console.log('isLocked' + video.isPublic +isSubscribed+video.title)
                const isLocked =  !video.isPublic && !isSubscribed;
                const isActive = selectedVideo?._id === video._id;
                
                return (
                  <div 
                    key={video._id} 
                    className={`${thirdFont.className} cursor-pointer transition-colors p-4 text-creamey ${
                      isActive ? "bg-lovely text-creamey" : "bg-pinkey text-lovely  hover:bg-lovely hover:text-creamey "
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={video.thumbnailUrl || "/video/1.png"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          {isLocked ? (
                            <Lock className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1">{video.title}</h3>
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
                            onClick={()=>router.push("/subscription")}

              size="sm" className="rounded-2xl hover:bg-creamey hover:text-lovely text-creamey bg-everGreen">
                Subscribe Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Playlists */}
      {relatedPlaylists.length > 0 && (
        <div className="mt-16">
          <h2 className={`${thirdFont.className} text-3xl tracking-normal font-meduim text-lovely mb-6`}>You May Also Like</h2>
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
                  <div className="p-4 bg-lovely text-creamey">
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
                    <h3 className="font-medium line-clamp-1">{relatedPlaylist.title}</h3>
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