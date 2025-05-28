"use client";
import { Suspense } from 'react';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Lock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPlaylists, videoCategories, VideoPlaylist } from "@/models/VideoPlaylist";
import VideoCard from "@/components/playlists/VideoCard";

interface PlaylistFilters {
  category?: string;
  requiresSubscription?: boolean;
  search?: string;
  sortBy?: string;
}

function PlaylistsPageFallback() {
  return <div>Loading...</div>;
}

function PlaylistsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>(mockPlaylists);
  const [filteredPlaylists, setFilteredPlaylists] = useState<VideoPlaylist[]>(mockPlaylists);
  const [filters, setFilters] = useState<PlaylistFilters>({
    category: initialCategory,
    requiresSubscription: undefined,
    search: "",
    sortBy: "newest",
  });

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...mockPlaylists];
    
    // Filter by category
    if (filters.category) {
      result = result.filter(playlist => playlist.category === filters.category);
    }
    
    // Filter by subscription requirement
    if (filters.requiresSubscription !== undefined) {
      result = result.filter(
        playlist => playlist.requiresSubscription === filters.requiresSubscription
      );
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        playlist => 
          playlist.title.toLowerCase().includes(searchLower) || 
          playlist.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort playlists
    if (filters.sortBy === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (filters.sortBy === "most_videos") {
      result.sort((a, b) => b.videos.length - a.videos.length);
    } else {
      // Default to newest
      result.sort((a, b) => (b._id || "").localeCompare(a._id || ""));
    }
    
    setFilteredPlaylists(result);
  }, [filters]);

  const updateFilter = (key: keyof PlaylistFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      requiresSubscription: undefined,
      search: "",
      sortBy: "newest",
    });
  };

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-display font-medium">Video Playlists</h1>
          <p className="text-muted-foreground">
            Explore our collection of curated video playlists for tutorials, inspiration, and more.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search playlists..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-4">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
                <SelectItem value="most_videos">Most Videos</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your playlist search with these filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Categories</h3>
                    <div className="grid gap-2">
                      {videoCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={filters.category === category.id}
                            onCheckedChange={(checked) => 
                              updateFilter("category", checked ? category.id : "")
                            }
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Subscription Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="subscription-free"
                          checked={filters.requiresSubscription === false}
                          onCheckedChange={(checked) => 
                            updateFilter("requiresSubscription", checked ? false : undefined)
                          }
                        />
                        <label
                          htmlFor="subscription-free"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Free Content
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="subscription-premium"
                          checked={filters.requiresSubscription === true}
                          onCheckedChange={(checked) => 
                            updateFilter("requiresSubscription", checked ? true : undefined)
                          }
                        />
                        <label
                          htmlFor="subscription-premium"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Premium Content
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.requiresSubscription !== undefined) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category && (
              <Badge 
                onClick={() => updateFilter("category", "")} 
                className="cursor-pointer"
              >
                {videoCategories.find(c => c.id === filters.category)?.name}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {filters.requiresSubscription !== undefined && (
              <Badge 
                onClick={() => updateFilter("requiresSubscription", undefined)} 
                className="cursor-pointer"
              >
                {filters.requiresSubscription ? "Premium Content" : "Free Content"}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
          </div>
        )}

        {/* Subscription CTA */}
        <div className="bg-pink-gradient rounded-xl p-6 md:p-8 shadow-md">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-display font-medium">
                Unlock Premium Content
              </h2>
              <p className="text-muted-foreground">
                Subscribe today to access our exclusive premium video playlists and tutorials.
              </p>
              <div className="flex space-x-2">
                <div className="flex items-center text-sm">
                  <Play className="h-4 w-4 mr-1 text-primary" />
                  <span>Unlimited access</span>
                </div>
                <div className="flex items-center text-sm">
                  <Lock className="h-4 w-4 mr-1 text-primary" />
                  <span>Exclusive content</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Button size="lg" className="rounded-full">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>

        {/* Playlists Grid */}
        {filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => (
              <VideoCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
              <Filter className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium">No playlists found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search term.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaylistPageWrapper(){
  <Suspense fallback={<PlaylistsPageFallback />}>
      <PlaylistsPage />
    </Suspense>
}

// Badge component for active filters
function Badge({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}