import Link from "next/link";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoPlaylist } from "@/models/VideoPlaylist";

interface VideoCardProps {
  playlist: VideoPlaylist;
}

export default function VideoCard({ playlist }: VideoCardProps) {
  return (
    <Link href={`/playlists/${playlist._id}`}>
      <div className="video-card group">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            src={playlist.thumbnail}
            alt={playlist.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-white/80 flex items-center justify-center">
              {playlist.requiresSubscription ? (
                <Lock className="h-6 w-6 text-primary" />
              ) : (
                <Play className="h-6 w-6 text-primary ml-1" />
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="font-normal">
              {playlist.category.charAt(0).toUpperCase() + playlist.category.slice(1)}
            </Badge>
            {playlist.requiresSubscription && (
              <Badge variant="outline" className="font-normal">
                Premium
              </Badge>
            )}
          </div>
          <h3 className="font-medium line-clamp-1">{playlist.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {playlist.description}
          </p>
          <div className="mt-3 text-sm">
            {playlist.videos.length} {playlist.videos.length === 1 ? 'video' : 'videos'}
          </div>
        </div>
      </div>
    </Link>
  );
}