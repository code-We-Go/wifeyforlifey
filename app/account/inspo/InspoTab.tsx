"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import BoardCard from "./BoardCard";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Share,
  X,
  ZoomIn,
  Heart,
  Lock,
} from "lucide-react";
import { CldImage } from "next-cloudinary";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Pin, Board, Section } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

const InspoTab = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardTitle = searchParams.get("board");
  const sectionTitle = searchParams.get("section");

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteInspoIds, setFavoriteInspoIds] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [lockedBoardPackages, setLockedBoardPackages] = useState<any[]>([]);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Helper to extract string ID from potential $oid object or string
  const extractId = (id: any): string => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id.$oid) return id.$oid;
    return String(id);
  };

  const trackActivity = async (type: string, data: any) => {
    try {
      await fetch("/api/inspos/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...data }),
      });
    } catch (error) {
      console.error("Tracking error:", error);
    }
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetch("/api/inspos");
        const data = await res.json();
        if (data.inspos) {
          const mappedBoards: Board[] = data.inspos.map((dbInspo: any) => {
            const sections: Section[] = (dbInspo.sections || []).map(
              (sec: any) => {
                const images = sec.images || sec.pins || [];
                const secId = extractId(sec._id);
                const pins: Pin[] = images
                  .map((img: any, idx: number) => {
                    let pId = "";
                    if (typeof img === "string") {
                      pId = img;
                    } else if (img && typeof img === "object") {
                      pId = img.public_id || img.publicId || "";
                    }

                    return {
                      id: `${secId}-${idx}`,
                      publicId: pId,
                      title: `${sec.title} ${idx + 1}`,
                      width: 500,
                      height: [600, 750, 500, 800][idx % 4],
                    };
                  })
                  .filter((pin: Pin) => pin.publicId);

                return {
                  id: secId,
                  title: sec.title,
                  pins,
                };
              }
            );
            const allPins = sections.flatMap((s) => s.pins);
            // Randomize the cover images so they aren't all from the first section
            const shuffledPins = [...allPins].sort(() => 0.5 - Math.random());
            const coverImages = shuffledPins.slice(0, 3).map((p) => p.publicId);

            return {
              id: extractId(dbInspo._id),
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

  useEffect(() => {
    const fetchSubsAndPackages = async () => {
      if (sessionStatus !== "authenticated" || !session?.user?.email) {
        setLoadingSubs(false);
        return;
      }

      try {
        setLoadingSubs(true);
        // Fetch subscriptions
        const subRes = await fetch(
          `/api/subscriptions/track?email=${encodeURIComponent(
            session.user.email
          )}&all=true`
        );
        if (subRes.ok) {
          const subs = await subRes.json();
          setUserSubs(Array.isArray(subs) ? subs : [subs]);
        }

        // Fetch all active packages
        const pkgRes = await fetch("/api/packages?all=true&active=true");
        if (pkgRes.ok) {
          const pkgs = await pkgRes.json();
          setAllPackages(pkgs.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch subs/packages", error);
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubsAndPackages();
  }, [session?.user?.email, sessionStatus]);

  const checkAccess = (boardId: string) => {
    if (!boardId) return true;
    if (sessionStatus !== "authenticated") return false;

    const now = Date.now();
    for (const sub of userSubs) {
      if (!sub || !sub.subscribed) continue;

      const isMini =
        String(sub.packageID?._id || sub.packageID) ===
        "68bf6ae9c4d5c1af12cdcd37";
      const isExpired =
        !isMini &&
        sub.expiryDate &&
        new Date(sub.expiryDate).getTime() < now;
      if (isExpired) continue;

      // Check package-level inspo access
      const pkg = sub?.packageID; // populated package object
      if (pkg) {
        if (pkg.accessAllInspos) {
          // If accessAllInspos is true, user has access to all inspos in the package
          const pkgInspos = Array.isArray(pkg.packageInspos)
            ? pkg.packageInspos
            : [];
          if (
            pkgInspos.some(
              (id: any) => String(extractId(id)) === String(boardId)
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getRequiredPackages = (boardId: string) => {
    return allPackages.filter((pkg) => {
      const pkgInspos = Array.isArray(pkg.packageInspos)
        ? pkg.packageInspos
        : [];
      return pkgInspos.some(
        (id: any) => String(extractId(id)) === String(boardId)
      );
    });
  };

  const handleLockedSectionClick = (boardId: string) => {
    const pkgs = getRequiredPackages(boardId);
    setLockedBoardPackages(pkgs);
    setIsLockModalOpen(true);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setFavoritesLoading(true);
        const res = await fetch("/api/user/inspo-favorites");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.favorites)) {
          setFavoriteInspoIds(data.favorites);
        }
      } catch (error) {
        console.error("Failed to fetch inspo favorites", error);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const activeBoard = useMemo(
    () => boards.find((b) => b.title === boardTitle),
    [boards, boardTitle]
  );
  const activeSection = useMemo(
    () => activeBoard?.sections.find((s) => s.title === sectionTitle),
    [activeBoard, sectionTitle]
  );

  useEffect(() => {
    if (activeBoard?.id) {
      trackActivity("view_inspo", { inspoId: activeBoard.id });
    }
  }, [activeBoard?.id]);

  useEffect(() => {
    if (activeSection?.id && activeBoard?.id) {
      trackActivity("view_section", {
        inspoId: activeBoard.id,
        sectionId: activeSection.id,
      });
    }
  }, [activeSection?.id, activeBoard?.id]);

  const pinId = searchParams.get("pin");

  const selectedPin = useMemo(() => {
    if (!pinId) return null;
    if (activeSection)
      return activeSection.pins.find((p) => p.id === pinId) || null;
    // Fallback search
    for (const board of boards) {
      for (const section of board.sections) {
        const pin = section.pins.find((p) => p.id === pinId);
        if (pin) return pin;
      }
    }
    return null;
  }, [pinId, activeSection, boards]);

  const currentSection = useMemo(() => {
    if (activeSection) return activeSection;
    if (!selectedPin) return null;
    for (const board of boards) {
      for (const section of board.sections) {
        if (section.pins.some((p) => p.id === selectedPin.id)) return section;
      }
    }
    return null;
  }, [activeSection, selectedPin, boards]);

  const favoritePins: Pin[] = useMemo(
    () =>
      boards.flatMap((board) =>
        board.sections.flatMap((section) =>
          section.pins.filter((pin) => favoriteInspoIds.includes(pin.publicId))
        )
      ),
    [boards, favoriteInspoIds]
  );

  const openPin = (pin: Pin) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pin", pin.id);
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const closePin = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pin");
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const handleNext = () => {
    if (!selectedPin || !currentSection) return;
    const currentIndex = currentSection.pins.findIndex(
      (p) => p.id === selectedPin.id
    );
    if (currentIndex < currentSection.pins.length - 1) {
      openPin(currentSection.pins[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedPin || !currentSection) return;
    const currentIndex = currentSection.pins.findIndex(
      (p) => p.id === selectedPin.id
    );
    if (currentIndex > 0) {
      openPin(currentSection.pins[currentIndex - 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPin) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPin, currentSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateToBoard = (title: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("board", title);
    params.delete("section");
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const navigateToSection = (title: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", title);
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const navigateToRoot = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("board");
    params.delete("section");
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const handleFavoritesClick = () => {
    const next = !showFavorites;
    setShowFavorites(next);
    if (next) {
      navigateToRoot();
    }
  };

  const toggleFavorite = async (publicId: string) => {
    const optimisticHas = favoriteInspoIds.includes(publicId);
    const optimisticNext = optimisticHas
      ? favoriteInspoIds.filter((id) => id !== publicId)
      : [...favoriteInspoIds, publicId];
    setFavoriteInspoIds(optimisticNext);

    try {
      const res = await fetch("/api/user/inspo-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePublicId: publicId }),
      });

      if (!res.ok) {
        setFavoriteInspoIds(favoriteInspoIds);
        toast({
          title: "Error",
          description: "Could not update favorites. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.favorites)) {
        setFavoriteInspoIds(data.favorites);
      }
    } catch (error) {
      console.error("Failed to toggle inspo favorite", error);
      setFavoriteInspoIds(favoriteInspoIds);
      toast({
        title: "Error",
        description: "Could not update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (sectionTitle) {
      params.delete("section");
    } else if (boardTitle) {
      params.delete("board");
    }
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed", err);
          throw new Error("Clipboard copy failed");
        } finally {
          document.body.removeChild(textArea);
        }
      }

      toast({
        title: "Link Copied",
        description: "Link has been copied to your clipboard.",
        variant: "added",
      });
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Error",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (publicId: string, title?: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      toast({
        title: "Download Failed",
        description: "Missing Cloudinary configuration.",
        variant: "destructive",
      });
      return;
    }

    try {
      const downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your image is downloading.",
        variant: "added",
      });

      // Track download
      const boardId =
        activeBoard?.id ||
        boards.find((b) => b.sections.some((s) => s.id === currentSection?.id))
          ?.id;

      if (boardId && currentSection?.id) {
        trackActivity("download_image", {
          inspoId: boardId,
          sectionId: currentSection.id,
          imagePublicId: publicId,
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Breadcrumbs / Header
  const renderHeader = () => {
    if (!activeBoard)
      return (
        <h2 className="text-2xl font-bold text-lovely">Inspiration Boards</h2>
      );

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-lovely/70 mb-1">
              <button
                type="button"
                className="text-lovely/60 hover:text-lovely"
                onClick={navigateToRoot}
              >
                Inspiration Boards
              </button>
              <span className="text-pinkey">/</span>
              {activeSection ? (
                <>
                  <button
                    type="button"
                    className="text-lovely/60 hover:text-lovely"
                    onClick={goBack}
                  >
                    {activeBoard.title}
                  </button>
                  <span className="text-pinkey">/</span>
                  <span className="text-lovely">{activeSection.title}</span>
                </>
              ) : (
                <span className="text-lovely">{activeBoard.title}</span>
              )}
            </nav>

            <h2 className="text-3xl font-bold text-lovely">
              {activeSection ? activeSection.title : activeBoard.title}{" "}
              <span className="text-2xl">💕</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-lovely/70 mt-1">
              {!activeSection && (
                <>
                  <span>{activeBoard.pinCount} Inspos</span>
                  <span>•</span>
                  <span>{activeBoard.sectionCount} Sections</span>
                </>
              )}
              {activeSection && <span>{activeSection.pins.length} Pins</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFavoritesClick}
              size="sm"
              className="gap-2 text-lovely border-lovely/20"
              disabled={favoritesLoading}
            >
              <Heart
                size={16}
                className={
                  showFavorites ? "fill-lovely  text-lovely" : "text-lovely "
                }
              />
              Favorites
              {favoritePins.length > 0 && ` (${favoritePins.length})`}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-2 text-lovely border-lovely/20"
            >
              <Share size={16} />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
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

    if (!activeBoard) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-lovely">
              Inspiration Boards
            </h2>
            <Button
              onClick={handleFavoritesClick}
              size="sm"
              className="gap-2 text-lovely border-lovely/20"
              disabled={favoritesLoading}
            >
              <Heart
                size={16}
                className={
                  showFavorites ? "fill-lovely  text-lovely" : "text-lovely "
                }
              />
              Favorites
              {favoritePins.length > 0 && ` (${favoritePins.length})`}
            </Button>
          </div>

          {showFavorites ? (
            favoritePins.length === 0 ? (
              <div className="text-lovely/70">
                You do not have any inspo favorites yet.
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {favoritePins.map((pin) => (
                  <div
                    key={pin.id}
                    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in mb-4"
                    onClick={() => openPin(pin)}
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!favoritesLoading) {
                          toggleFavorite(pin.publicId);
                        }
                      }}
                    >
                      <Heart
                        size={18}
                        className={
                          favoriteInspoIds.includes(pin.publicId)
                            ? "fill-lovely text-lovely"
                            : "text-creamey"
                        }
                      />
                    </button>
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
            )
          ) : (
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
          )}
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
              const coverImages = section.pins
                .slice(0, 3)
                .map((p) => p.publicId);
              const isLocked = !checkAccess(activeBoard.id);
              return (
                <BoardCard
                  key={section.id}
                  title={section.title}
                  pinCount={section.pins.length}
                  coverImages={coverImages}
                  isLocked={isLocked}
                  onClick={() =>
                    isLocked
                      ? handleLockedSectionClick(activeBoard.id)
                      : navigateToSection(section.title)
                  }
                />
              );
            })}
          </div>
        </div>
      );
    }

    // View: Inside Section (Pins Grid)
    if (activeSection) {
      const isLocked = activeBoard ? !checkAccess(activeBoard.id) : false;
      if (isLocked) {
        const pkgs = activeBoard ? getRequiredPackages(activeBoard.id) : [];
        return (
          <div className="space-y-8">
            {renderHeader()}
            <div className="flex flex-col items-center justify-center py-20 bg-creamey/30 rounded-3xl border-2 border-dashed border-lovely/20 px-6 text-center">
              <div className="bg-white p-6 rounded-full shadow-xl mb-6">
                <Lock size={48} className="text-lovely" />
              </div>
              <h3 className="text-2xl font-bold text-lovely mb-4">
                Section Locked
              </h3>
              <p className="text-lovely/70 max-w-md mx-auto mb-8">
                {pkgs.length > 0
                  ? `This section is exclusive to ${pkgs
                      .map((p) => p.name)
                      .join(
                        " and "
                      )} packages. Please subscribe to view these inspiration boards.`
                  : "Please subscribe to a package to view these inspiration boards."}
              </p>

              {pkgs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {pkgs.map((pkg) => (
                    <Button
                      key={pkg._id}
                      onClick={() => router.push(`/subscription/${pkg._id}`)}
                      className="bg-lovely text-white hover:bg-lovely/90 rounded-full px-6"
                    >
                      Subscribe to {pkg.name}
                    </Button>
                  ))}
                </div>
              )}

              <Button
                onClick={navigateToRoot}
                variant="outline"
                className="rounded-full border-lovely text-lovely hover:bg-lovely hover:text-white px-8"
              >
                View Other Boards
              </Button>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-8">
        {renderHeader()}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {activeSection.pins.map((pin) => (
            <div
              key={pin.id}
              className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in mb-4"
              onClick={() => openPin(pin)}
            >
              <button
                type="button"
                className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!favoritesLoading) {
                    toggleFavorite(pin.publicId);
                  }
                }}
              >
                <Heart
                  size={18}
                  className={
                    favoriteInspoIds.includes(pin.publicId)
                      ? "fill-lovely text-lovely"
                      : "text-creamey"
                  }
                />
              </button>
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
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Full View Modal */}
      <Dialog open={!!selectedPin} onOpenChange={(open) => !open && closePin()}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedPin?.title || "Pin Preview"}
          </DialogTitle>
          {selectedPin && (
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              {/* Close button - custom positioned */}
              <div className="absolute top-4 right-4 z-50 pointer-events-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() =>
                    handleDownload(selectedPin.publicId, selectedPin.title)
                  }
                  title="Download Image"
                >
                  <Download size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={closePin}
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-40 pointer-events-none">
                <div className="pointer-events-auto">
                  {currentSection &&
                    currentSection.pins.findIndex(
                      (p) => p.id === selectedPin.id
                    ) > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrev();
                        }}
                      >
                        <ChevronLeft size={32} />
                      </Button>
                    )}
                </div>
                <div className="pointer-events-auto">
                  {currentSection &&
                    currentSection.pins.findIndex(
                      (p) => p.id === selectedPin.id
                    ) <
                      currentSection.pins.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                      >
                        <ChevronRight size={32} />
                      </Button>
                    )}
                </div>
              </div>

              <div className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden pointer-events-auto bg-white">
                <CldImage
                  src={selectedPin.publicId}
                  alt={selectedPin.title || "Full View"}
                  width={1000}
                  height={1000}
                  className="object-contain max-h-[85vh] w-auto"
                />
                {/*
                {selectedPin.title && (
                  <div className="p-4 bg-white">
                    <h3 className="text-xl font-bold text-lovely">
                      {selectedPin.title}
                    </h3>
                  </div>
                )}
                  */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lock Guidance Modal */}
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent className="max-w-md bg-creamey rounded-3xl p-8 border-none shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="bg-creamey/30 p-4 rounded-full mb-6">
              <Lock size={40} className="text-lovely" />
            </div>
            <DialogTitle className="text-2xl font-bold text-lovely mb-4">
              Board Locked
            </DialogTitle>
            <p className="text-lovely/70 mb-8">
              {lockedBoardPackages.length > 0
                ? "This inspiration board is exclusive to our community members. Subscribe to one of the following packages to gain full access:"
                : "This inspiration board is exclusive to our community members. Please subscribe to a package to gain full access."}
            </p>

            <div className="w-full space-y-3">
              {lockedBoardPackages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => {
                    router.push(`/subscription/${pkg._id}`);
                    setIsLockModalOpen(false);
                  }}
                  className="w-full flex items-center hover:bg-pinkey cursor-pointer justify-between p-4 hover:text-lovely bg-pinkey/80  rounded-2xl border border-lovely/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
                      {pkg.imgUrl && (
                        <img
                          src={pkg.imgUrl}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-semibold text-lovely  transition-colors">
                      {pkg.name}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-lovely/50" />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsLockModalOpen(false)}
              className="mt-6 text-lovely/60 hover:text-lovely"
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InspoTab;
