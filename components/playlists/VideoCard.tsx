import Link from "next/link";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoPlaylist } from "@/app/interfaces/interfaces";

interface VideoCardProps {
  playlist: VideoPlaylist;
}

export default function VideoCard({ playlist }: VideoCardProps) {
  return (
    <Link href={`/playlists/${playlist._id}`}>
      <div className="video-card group">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full  flex items-center justify-center">
              {!playlist.isPublic ? (
                <Lock className="h-6 w-6 text-primary" />
              ) : (
                <Play className="h-6 w-6 text-primary ml-1" />
              )}
            </div>
          </div>
        </div>
        <div className="p-4  bg-creamey">
          <div className="flex items-center justify-between mb-2">
            {playlist.category && (
              <Badge variant="destructive" className="font-normal">
                {playlist.category.charAt(0).toUpperCase() + playlist.category.slice(1)}
              </Badge>
            )}
            {!playlist.isPublic && (
              <Badge variant="outline" className="font-normal">
                Premium
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-lovely line-clamp-1">{playlist.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {playlist.description}
          </p>
          <div className="mt-3 text-lovely text-sm">
            {playlist.videos?.length || 0} {(playlist.videos?.length || 0) === 1 ? 'video' : 'videos'}
          </div>
        </div>
      </div>
    </Link>
  );
}