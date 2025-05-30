import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


import VideoCard from "@/components/playlists/VideoCard";
import { mockPlaylists } from '@/models/VideoPlaylist';
import { thirdFont } from '@/fonts';

const Playlists = () => {
    const featuredPlaylists = mockPlaylists.slice(0, 2);

  return (
    <section className="py-16 bg-lovely text-creamey">
    <div className="container-custom">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h2 className={`${thirdFont.className} text-4xl md:text-5xl  lg:text-6xl font-semibold   mb-2`}>
            Featured Playlists
          </h2>
          <p className="text-creamey/60">
            Explore our curated video collections
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4 hover:bg-saga bg-everGreen hover:text-creamey border-0  text-creamey md:mt-0">
          <Link href="/playlists">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredPlaylists.map((playlist) => (
          <VideoCard key={playlist._id} playlist={playlist} />
        ))}
      </div>
    </div>
  </section>
  )
}

export default Playlists