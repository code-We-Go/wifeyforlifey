"use client";

import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Link from "next/link";
import { thirdFont } from "@/fonts";
import { FaTiktok, FaInstagram, FaPlay } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";

const socialMediaItems = [
  // 4
  {
    link: "https://vt.tiktok.com/ZSayBAJUW/",
    videoId: "7586805825663012117",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/owj0DOfD4EwjjVSI9vQeBkl3JE8A6EfAFAAIIA~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=EpxTiVmxVOgIp7ez0ac6VSOHu4Y%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 2 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmSHAV/",
    videoId: "7542150154153987335",
    type: "tiktok",
    thumbnail: ""
  },
  // 7
  {
    link: "https://vt.tiktok.com/ZSayBggbH/",
    videoId: "7564509315760016661",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocHEii1SIKfI4D9CR68DfD8jHeAFDjRAD82RIz~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=4n8bF2t8yeEsZYCvQsQffO1HBn8%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
    // 6 =>4
  {
    link: "https://vt.tiktok.com/ZSayBtUJL/",
    videoId: "7567527880519896327",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oYAGEBUDpBQjpXuFEgmUKAEzEBfFfBnggRIo0S~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=G7zydgx8vaB%2FD7V8AL3aUJLYkDQ%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 1 => 5
  {
    link: "https://vt.tiktok.com/ZSayBAQy8",
    videoId: "7597170482076536085",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oYfzunRABCBE7EgNeBD3UpIobIcHkkRPpFSE1h~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=nrJ0Tdqk3QMq%2FDTv0Kitrx20ZUI%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
    // 3 =>6
  {
    link: "https://vt.tiktok.com/ZSayBMouU/",
    videoId: "7575628629506411796",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocIwiPGEYIqIE4EgVA9ivi6ixtBa2SAuBdHyC~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=6oH%2B%2FwBsPgA2H%2BXmWfSFMAzkJOw%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 2
  {
    link: "https://vt.tiktok.com/ZSayBUeKU/",
    videoId: "7576642266526223634",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o0RRDEgqQmpCdTEAQBLRqcFsqJs1SBfaqrAfDZ~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=%2BNw2ElntS3INBFaOmxuJ8etgRBU%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 18 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmyYJs/",
    videoId: "7572594616323624200",
    type: "tiktok",
    thumbnail: ""
  },
  // 11
  {
    link: "https://vt.tiktok.com/ZSayBB8rP/",
    videoId: "7585295159953214740",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oscWE57hhBgAjAAxHsAEPgEAiBUiaIYynYRBS~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=v9iCWyC%2FsmF8GRsfR1ZDu0rSXeY%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 5
  {
    link: "https://vt.tiktok.com/ZSayBQf83/",
    videoId: "7587863234531626248",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocBNXq5SIA4p6IiqXfIgCk2AhBXZswp8EjAWi0~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=JEu76SeVMmr8ENe0vw7FIU%2FwXZw%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 14
  {
    link: "https://vt.tiktok.com/ZSayBvrqG/",
    videoId: "7539891119820213511",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocOQ4QEnAAMXDMf2jLe6iRGCxfRnkIIDwgTJFj~tplv-tiktokx-dmt-logom:tos-alisg-i-0068/o4AfExXtDICwoj7MAlFAcBRFSCf6oABEEZgjEo.image?dr=14573&x-expires=1769684400&x-signature=pC6t5mW4bbZbp9BVMv6zd9L8oLU%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 20 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmtDfG/",
    videoId: "7599271874585038088",
    type: "tiktok",
    thumbnail: ""
  },
  // 9
  {
    link: "https://vt.tiktok.com/ZSayBQeNR/",
    videoId: "7557812128640535815",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/osAlV1BAVAEPci6oOZj0EYBIwEVVvAADhiAPa~tplv-tiktokx-dmt-logom:tos-alisg-i-0068/ogbOmPAEE6iZAxoBTAVVcDilBwAYihXADIagX.image?dr=14573&x-expires=1769684400&x-signature=dn6AErblyqK3D%2FYWyPz%2F1GMAk%2Bk%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 17 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmudvg/",
    videoId: "7587543168829197586?",
    type: "tiktok",
    thumbnail: ""
  },
  // 13
  {
    link: "https://vt.tiktok.com/ZSayBvMWV/",
    videoId: "7556953554255219975",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oUrKfhB8efHGXMAHheTgNsNMAQtigsFGI8fLAh~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=dJowO0XRsfTXRpI3rIQepEf8bvQ%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 8
  {
    link: "https://vt.tiktok.com/ZSayBaLcj/",
    videoId: "7561551586389019912",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oIkBfGwvgAQf3vIR4GDIFEdQYQfGAyLijgFr0e~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=E2E6LCoqSyCZ8eztf9brcA6hPaE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 21 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmb2Bs/",
    videoId: "7539630520183819528",
    type: "tiktok",
    thumbnail: ""
  },
  // 10
  {
    link: "https://vt.tiktok.com/ZSayBqV17/",
    videoId: "7557770113185762568",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o8SCGKXefFhRLDAHQheojL1GAI0I4TECqnxXgL~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=zOkWYdTklcNE7pjBDecjXKW7ymk%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 15
  {
    link: "https://vt.tiktok.com/ZSayBbR1d/",
    videoId: "7556318247151340818",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocDeEUiBAwfBU10AboWdEKaI2AikaRA3m2CZZg~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=pkgRyOvMu5wt9MPKjJ3EfRGkij0%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 19 - NEW
  {
    link: "https://vt.tiktok.com/ZSaqmqTF4/",
    videoId: "7572594616323624200",
    type: "tiktok",
    thumbnail: ""
  },
  // 12
  {
    link: "https://vt.tiktok.com/ZSayBVFrx/",
    videoId: "7557799770065079559",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/okeRikjDIqGxCiqI3sLW7EAtDdAeIAEiWaAoeA~tplv-tiktokx-origin.image?dr=14575&x-expires=1769684400&x-signature=SgeUZU4OWPj5H8KtrGZ3QcrPuw8%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
  // 16
  {
    link: "https://vt.tiktok.com/ZSayBuFTX/",
    videoId: "7541381662374907143",
    type: "tiktok",
    thumbnail: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/owMRfABVxX2AviIU0Lh2zDqCwIzoAh1IRN5Ci9~tplv-tiktokx-dmt-logom:tos-alisg-i-0068/ow9VBfxUCiUKIqX5mA0wiBRoE3ICAADGCAnA9s.image?dr=14573&x-expires=1769684400&x-signature=0ZX7fC7zWp6S7T1ZZAzp%2FXqIbqE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2"
  },
 
];

export default function WifeyCommunity() {
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; type: string } | null>(null);
  
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      dragFree: true,
      align: "center",
      containScroll: "trimSnaps"
    },
    [
      AutoScroll({ 
        playOnInit: true, 
        stopOnInteraction: true, 
        stopOnMouseEnter: true, // Pause on hover
        speed: 1.5 
      })
    ]
  );

  return (
    <section className="py-20 bg-pinkey overflow-hidden relative">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className={`${thirdFont.className} normal-case ${headerStyle} text-lovely mb-4`}>
          #WifeyForLifeyCommunity
        </h2>
        <p className={`${subHeaderStyle} text-lovely/80 text-lg md:text-xl max-w-2xl mx-auto`}>
          See how our community is celebrating their journey on TikTok.
        </p>
      </div>

      <div className="embla w-full" ref={emblaRef}>
        <div className="embla__container flex gap-6 pl-4">
          {socialMediaItems.map((item, index) => (
            <div 
              className="embla__slide flex-[0_0_260px] md:flex-[0_0_300px]" 
              key={index}
            >
              <SocialCard 
                item={item} 
                index={index + 1} 
                onPlay={() => setSelectedVideo({ id: item.videoId, type: item.type })} 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative gradient edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-creamey via-creamey/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-creamey via-creamey/80 to-transparent z-10" />

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-md md:max-w-xl p-0 h-[90vh] bg-black border-none overflow-hidden flex items-center justify-center">
            <DialogTitle className="sr-only">Social Media Video</DialogTitle>
            {selectedVideo && (
                <div className="w-full h-full flex items-center justify-center">
                   {selectedVideo.type === 'tiktok' ? (
                       <iframe
                         src={`https://www.tiktok.com/embed/v2/${selectedVideo.id}?autoplay=1&mute=1`}
                         className="w-full h-full"
                         allow="autoplay; encrypted-media; fullscreen;"
                         title="TikTok Video"
                       ></iframe>
                   ) : (
                       <iframe
                         key={selectedVideo.id}
                         src={`https://www.instagram.com/reel/${selectedVideo.id}/embed/captioned/`}
                         className="w-full h-full bg-white"
                         allow="autoplay; encrypted-media; fullscreen;"
                         title="Instagram Video"
                       ></iframe>
                   )}
                </div>
            )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SocialCard({ item, index, onPlay }: { item: any; index: number; onPlay: () => void }) {
  const isTiktok = item.type === 'tiktok';
  const [imgError, setImgError] = useState(false);
  const [dynamicThumbnail, setDynamicThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch fresh thumbnail from our API route
  React.useEffect(() => {
    if (isTiktok) {
      setIsLoading(true);
      const fetchThumbnail = async () => {
        try {
          const response = await fetch(
            `/api/tiktok-thumbnail?url=${encodeURIComponent(item.link)}`
          );
          
          if (!response.ok) {
            console.error('Failed to fetch thumbnail:', response.status);
            setIsLoading(false);
            return;
          }
          
          const data = await response.json();
          if (data.thumbnail_url) {
            setDynamicThumbnail(data.thumbnail_url);
            setImgError(false);
          }
        } catch (error) {
          console.error('Failed to fetch TikTok thumbnail:', error);
          setImgError(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchThumbnail();
    } else {
      setIsLoading(false);
    }
  }, [isTiktok, item.link]);
  
  if (item.type === 'instagram') {
    return (
      <div className="block relative w-full aspect-[9/16] bg-white rounded-3xl overflow-hidden shadow-md border-2 border-lovely/5">
        <iframe
          src={`https://www.instagram.com/reel/${item.videoId}/embed/captioned/`}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; fullscreen;"
          title={`Instagram Video ${index}`}
          loading="lazy"
        ></iframe>
      </div>
    );
  }

  const thumbnailUrl = dynamicThumbnail || item.thumbnail;

  return (
    <button 
      onClick={onPlay}
      className="group block relative w-full aspect-[9/16] bg-white rounded-3xl overflow-hidden shadow-md border-2 border-lovely/5 hover:border-lovely/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left"
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-lovely/10 via-lovely/5 to-pinkey/10 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-lovely/20 animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Background Gradient or Image */}
      {!imgError && thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={`Thumbnail for video ${index}`}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => setImgError(true)}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${isTiktok ? 'from-black/80 via-black/90 to-[#ff0050]/20' : 'from-purple-500/80 via-pink-500/80 to-orange-500/80'} transition-colors duration-500 flex items-center justify-center`}>
            {/* Fallback pattern */}
            <div className="opacity-20 transform rotate-12 scale-150">
               {isTiktok ? <FaTiktok size={100} color="white" /> : <FaInstagram size={100} color="white" />}
            </div>
        </div>
      )}
      
      {/* Filter Overlay for readability */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>

      {/* Center Icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 group-hover:scale-110 transition-transform duration-300">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ${isTiktok ? 'bg-black/80 text-white' : 'bg-white/90 text-[#E1306C]'}`}>
             {isTiktok ? <FaTiktok size={32} /> : <FaInstagram size={32} />}
        </div>
        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-lovely opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
            <FaPlay size={16} className="ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-4 right-4 z-10">
         <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-lovely shadow-sm border border-lovely/10">
            #{index}
         </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-20 flex flex-col justify-end">
        <span className="text-white font-bold text-sm tracking-wide uppercase opacity-90 mb-1 drop-shadow-md">
            {isTiktok ? 'TikTok' : 'Instagram'}
        </span>
        <span className="text-white text-xs font-medium opacity-75 drop-shadow-sm">
            Tap to Watch
        </span>
      </div>
    </button>
  );
}

