"use client";

import { useSearchParams, useRouter } from "next/navigation";
import BoardCard from "./BoardCard";
import { ArrowLeft, MoreHorizontal, Share, X, ZoomIn } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pin, Board, Section } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

const InspoTab = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardTitle = searchParams.get("board");
  const sectionTitle = searchParams.get("section");

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetch("/api/inspos");
        const data = await res.json();
        if (data.inspos) {
          const mappedBoards: Board[] = data.inspos.map((dbInspo: any) => {
            const sections: Section[] = dbInspo.sections.map((sec: any) => ({
              id: sec._id,
              title: sec.title,
              pins: sec.images.map((img: string, idx: number) => ({
                id: `${sec._id}-${idx}`,
                publicId: img,
                title: `${sec.title} ${idx + 1}`,
                width: 500,
                height: [600, 750, 500, 800][idx % 4],
              })),
            }));
            const allPins = sections.flatMap((s) => s.pins);
            const coverImages = allPins.slice(0, 3).map((p) => p.publicId);

            return {
              id: dbInspo._id,
              title: dbInspo.title,
              pinCount: allPins.length,
              sectionCount: sections.length,
              coverImages,
              sections,
            };
          });
          setBoards(mappedBoards);
        }
      } catch (error) {
        console.error("Failed to fetch boards", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const activeBoard = useMemo(
    () => boards.find((b) => b.title === boardTitle),
    [boards, boardTitle]
  );
  const activeSection = useMemo(
    () => activeBoard?.sections.find((s) => s.title === sectionTitle),
    [activeBoard, sectionTitle]
  );

  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const navigateToBoard = (title: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("board", title);
    params.delete("section");
    router.push(`/account?${params.toString()}`);
  };

  const navigateToSection = (title: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", title);
    router.push(`/account?${params.toString()}`);
  };

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (sectionTitle) {
      params.delete("section");
    } else if (boardTitle) {
      params.delete("board");
    }
    router.push(`/account?${params.toString()}`);
  };

  // Breadcrumbs / Header
  const renderHeader = () => {
    if (!activeBoard)
      return (
        <h2 className="text-2xl font-bold text-lovely">Inspiration Boards</h2>
      );

    return (
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-2 text-lovely/60 hover:text-lovely cursor-pointer w-fit"
          onClick={goBack}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-lovely">
              {activeSection ? activeSection.title : activeBoard.title}{" "}
              <span className="text-2xl">💕</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-lovely/70 mt-1">
              {!activeSection && (
                <>
                  <span>{activeBoard.pinCount} Pins</span>
                  <span>•</span>
                  <span>{activeBoard.sectionCount} Sections</span>
                </>
              )}
              {activeSection && <span>{activeSection.pins.length} Pins</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-lovely border-lovely/20"
            >
              <Share size={16} />
              Share
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-lovely border-lovely/20"
            >
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-[4/3] rounded-2xl w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // View: List of Boards
  if (!activeBoard) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-lovely mb-6">
          Inspiration Boards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              title={board.title}
              pinCount={board.pinCount}
              sectionCount={board.sectionCount}
              coverImages={board.coverImages}
              onClick={() => navigateToBoard(board.title)}
            />
          ))}
        </div>
      </div>
    );
  }

  // View: Inside Board (List of Sections)
  if (!activeSection) {
    return (
      <div className="space-y-8">
        {renderHeader()}

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeBoard.sections.map((section) => {
            // Get first 3 images from section for the cover
            const coverImages = section.pins.slice(0, 3).map((p) => p.publicId);
            return (
              <BoardCard
                key={section.id}
                title={section.title}
                pinCount={section.pins.length}
                coverImages={coverImages}
                onClick={() => navigateToSection(section.title)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // View: Inside Section (Pins Grid)
  return (
    <div className="space-y-8">
      {renderHeader()}

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {activeSection.pins.map((pin) => (
          <div
            key={pin.id}
            className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in mb-4"
            onClick={() => setSelectedPin(pin)}
          >
            <CldImage
              src={pin.publicId}
              alt={pin.title || "Pin"}
              width={pin.width || 500}
              height={pin.height || 500}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 p-2 rounded-full text-lovely">
                <ZoomIn size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full View Modal */}
      <Dialog
        open={!!selectedPin}
        onOpenChange={(open) => !open && setSelectedPin(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
          {selectedPin && (
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              {/* Close button - custom positioned */}
              <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => setSelectedPin(null)}
                >
                  <X size={24} />
                </Button>
              </div>

              <div className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden pointer-events-auto bg-white">
                <CldImage
                  src={selectedPin.publicId}
                  alt={selectedPin.title || "Full View"}
                  width={1000}
                  height={1000}
                  className="object-contain max-h-[85vh] w-auto"
                />
                {selectedPin.title && (
                  <div className="p-4 bg-white">
                    <h3 className="text-xl font-bold text-lovely">
                      {selectedPin.title}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspoTab;
