'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { VideoPlaylist } from "@/app/interfaces/interfaces";

import VideoCard from "@/components/playlists/VideoCard";
import VideoCardSkeleton from "@/components/skeletons/VideoCardSkeleton";
import { thirdFont } from "@/fonts";

const Playlists = () => {
  const [featuredPlaylists, setFeaturedPlaylists] = useState<VideoPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/playlists?featured=true&all=true");
        const data = await res.json();
        if (res.ok) {
          setFeaturedPlaylists(data.data || []);
        } else {
          setError(data.error || "Failed to fetch featured playlists");
        }
      } catch (err) {
        setError("Failed to fetch featured playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPlaylists();
  }, []);

  return (
    <section className="py-16 bg-lovely text-creamey">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2
              className={`${thirdFont.className} tracking-normal  text-4xl md:text-5xl  lg:text-6xl font-semibold   mb-2`}
            >
              Featured Playlists
            </h2>
            <p className="text-creamey/60">
              Explore our curated video collections
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-4 hover:bg-saga bg-everGreen hover:text-creamey border-0  text-creamey md:mt-0"
          >
            <Link href="/playlists">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPlaylists.length === 0 ? (
              <div className="col-span-2 text-center py-8">No featured playlists found.</div>
            ) : (
              featuredPlaylists.map((playlist) => (
                <VideoCard key={playlist._id} playlist={playlist} />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Playlists;
