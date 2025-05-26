"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Lock, Play, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockPlaylists, VideoPlaylist, Video } from "@/models/VideoPlaylist";
import { mockUser } from "@/models/User";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  
  const playlist = mockPlaylists.find((p) => p._id === playlistId);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // For demo purposes, we'll use the mock user
  const user = mockUser;
  const isSubscribed = user.isSubscribed || false;

  if (!playlist) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-medium mb-4">Playlist not found</h1>
        <p className="text-muted-foreground mb-6">
          The playlist you are looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/playlists">Back to Playlists</Link>
        </Button>
      </div>
    );
  }

  // Set the first video as selected if none is selected
  if (!selectedVideo && playlist.videos.length > 0) {
    setSelectedVideo(playlist.videos[0]);
  }

  // Check if the selected video requires subscription
  const videoLocked = selectedVideo?.requiresSubscription && !isSubscribed;

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <Link href="/playlists" className="text-muted-foreground hover:text-foreground text-sm">
                  Playlists
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {playlist.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Back button - mobile only */}
      <div className="md:hidden mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/playlists">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Playlists
          </Link>
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {playlist.category.charAt(0).toUpperCase() + playlist.category.slice(1)}
              </Badge>
              {playlist.requiresSubscription && (
                <Badge variant="outline">Premium</Badge>
              )}
            </div>
            <h1 className="text-3xl font-display font-medium">{playlist.title}</h1>
            <p className="text-muted-foreground mt-2">{playlist.description}</p>
          </div>

          {/* Video Player Section */}
          <div className="space-y-4">
            {selectedVideo ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                {videoLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
                    <Lock className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="text-xl font-medium mb-2">Premium Content</h3>
                    <p className="mb-4 max-w-md">
                      This video is only available to premium subscribers. Subscribe now to unlock all our premium content.
                    </p>
                    <Button className="rounded-full" size="lg">
                      Subscribe Now
                    </Button>
                  </div>
                ) : (
                  <iframe
                    src={selectedVideo.url.replace("watch?v=", "embed/")}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                )}
              </div>
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No videos available in this playlist.</p>
              </div>
            )}

            {selectedVideo && (
              <div>
                <h2 className="text-xl font-medium">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedVideo.duration}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(new Date())}
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Videos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Videos in this Playlist</h2>
            <span className="text-sm text-muted-foreground">
              {playlist.videos.length} {playlist.videos.length === 1 ? "video" : "videos"}
            </span>
          </div>
          
          <div className="bg-card rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y">
              {playlist.videos.map((video) => {
                const isLocked = video.requiresSubscription && !isSubscribed;
                const isActive = selectedVideo?._id === video._id;
                
                return (
                  <div 
                    key={video._id} 
                    className={`cursor-pointer hover:bg-accent/50 transition-colors p-4 ${
                      isActive ? "bg-accent/50" : ""
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={video.thumbnail}
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
                          <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">
                            {video.duration}
                          </span>
                          {video.requiresSubscription && (
                            <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
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
          
          {playlist.requiresSubscription && !isSubscribed && (
            <div className="bg-accent/50 rounded-lg p-4 text-center">
              <p className="text-sm mb-3">
                Subscribe to unlock all premium videos in this playlist.
              </p>
              <Button size="sm" className="rounded-full">
                Subscribe Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Playlists */}
      <div className="mt-16">
        <h2 className="text-2xl font-display font-medium mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPlaylists
            .filter(
              (p) => 
                p._id !== playlist._id && 
                (p.category === playlist.category || !p.requiresSubscription)
            )
            .slice(0, 3)
            .map((relatedPlaylist) => (
              <Link 
                key={relatedPlaylist._id} 
                href={`/playlists/${relatedPlaylist._id}`}
                className="block"
              >
                <div className="video-card group">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={relatedPlaylist.thumbnail}
                      alt={relatedPlaylist.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center">
                        {relatedPlaylist.requiresSubscription ? (
                          <Lock className="h-5 w-5 text-primary" />
                        ) : (
                          <Play className="h-5 w-5 text-primary ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-normal">
                        {relatedPlaylist.category.charAt(0).toUpperCase() + relatedPlaylist.category.slice(1)}
                      </Badge>
                      {relatedPlaylist.requiresSubscription && (
                        <Badge variant="outline" className="font-normal">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium line-clamp-1">{relatedPlaylist.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {relatedPlaylist.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}