"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { thirdFont } from "@/fonts";
import Image from "next/image";
import { Smartphone, Sparkles, CalendarDays, ListTodo, Radio, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { FaGooglePlay } from "react-icons/fa";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  categories: string[];
  publishedAt?: string;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  readingTime: number;
  formattedPublishDate?: string;
}

/*
=========================================================
ORIGINAL BLOG LIST COMPONENT - COMMENTED OUT FOR BACKUP
=========================================================
const BlogListPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: "published",
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTag && { tag: selectedTag }),
      });

      const response = await axios.get(`/api/blogs?${params}`);
      setBlogs(response.data.data);
      setTotalPages(response.data.totalPages);

      // Extract unique categories and tags
      const categories = new Set<string>();
      const tags = new Set<string>();

      response.data.data.forEach((blog: Blog) => {
        blog.categories.forEach((cat) => categories.add(cat));
        blog.tags.forEach((tag) => tags.add(tag));
      });

      setAllCategories(Array.from(categories));
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await axios.get(
        "/api/blogs?status=published&featured=true&all=true"
      );
      setFeaturedBlogs(response.data.data.slice(0, 3)); // Show top 3 featured blogs
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
    if (page === 1) {
      fetchFeaturedBlogs();
    }
  }, [page, search, selectedCategory, selectedTag]);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setPage(1);
  };

  return (
    <div className="min-h-screen container-custom bg-creamey">
      {/* Header * /}
      <div className=" border-b border-lovely/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-start">
            <h1
              className={`${thirdFont.className} text-4xl md:text-5xl text-lovely font-semibold`}
            >
              Blogs
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Blogs Section * /}
        {featuredBlogs.length > 0 && page === 1 && (
          <div className="mb-12">
            <h2
              className={`${thirdFont.className} text-2xl md:text-3xl tracking-normal font-bold text-lovely mb-6`}
            >
              Featured Blogs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <Link
                  href={`/blogs/${blog.slug}`}
                  key={blog._id}
                  className="bg-lovely/90 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {blog.featuredImage && (
                    <div className="h-48 md:h-64 bg-gray-200">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="px-6 py-2">
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-creamey  ">
                      {blog.title}
                    </h3>
                    <p className="text-creamey/90 ">
                      {truncateText(stripHtml(blog.excerpt), 120)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters * /}
        <div className="bg-lovely/90 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey placeholder:text-lovely/80"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey text-lovely/80 placeholder:text-lovely/80"
              >
                <option value="">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey text-lovely/80 placeholder:text-lovely/80"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(search || selectedCategory || selectedTag) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-creamey hover:underline text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Blog List * /}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lovely"></div>
            <p className="mt-4 text-lovely/80">Loading blogs...</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 ">
            {blogs.map((blog) => (
              <Link
                href={`/blogs/${blog.slug}`}
                key={blog._id}
                className="bg-lovely/90 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {blog.featuredImage && (
                  <div className="relative w-full aspect-video bg-gray-200">
                    <Image
                      fill
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="px-6 py-2">
                  <div className="flex items-center mb-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-creamey  ">
                    {blog.title}
                  </h3>
                  <p className="text-creamey/90 ">
                    {truncateText(stripHtml(blog.excerpt), 120)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lovely/80 text-lg">No blogs found.</p>
            {(search || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters to see all blogs
              </button>
            )}
          </div>
        )}

        {/* Pagination * /}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg \${
                      page === pageNum
                        ? "text-white bg-blue-600 border border-blue-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
*/

const AppShowcaseCarousel = () => {
  const images = [
    "/blogsImages/1.webp",
    "/blogsImages/2.webp",
    "/blogsImages/3.webp",
    "/blogsImages/4.webp",
    "/blogsImages/5.webp",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="relative w-[260px] aspect-[9/19.5] mb-12 group">
      {/* Slides Container */}
      <div className="relative w-full h-full overflow-hidden rounded-sm border border-lovely/10 shadow-lg bg-black/5">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={src}
              alt={`Mobile App Screen ${idx + 1}`}
              fill
              className="object-cover w-full h-full"
              priority={idx === 0}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/60 text-lovely hover:bg-white/90 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 border border-lovely/10 backdrop-blur-sm shadow-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/60 text-lovely hover:bg-white/90 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 border border-lovely/10 backdrop-blur-sm shadow-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-4 z-20 relative">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-5 bg-lovely"
                : "w-2 bg-lovely/30 hover:bg-lovely/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const BlogListPage = () => {
  return (
    <div className="min-h-screen container-custom bg-creamey py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Premium Badge */}
        <span className="inline-flex items-center gap-1.5 bg-lovely/10 text-lovely text-sm font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6 border border-lovely/20 animate-pulse">
          <Sparkles className="w-4 h-4 text-lovely" />
          New Experience
        </span>
        
        {/* Heading */}
        <h1 className={`${thirdFont.className} text-4xl md:text-6xl font-bold text-lovely mb-6 leading-tight`}>
          Wifey for Lifey is Now on Mobile!
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-lovely/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          To provide you with a richer, more interactive bridal era bestie experience, all our wedding blogs have moved exclusively to our mobile app.
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 w-full max-w-md sm:max-w-none">
          {/* App Store */}
          <a
            href="https://apps.apple.com/ae/app/wifey-for-lifey/id6757353337"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-lovely text-creamey hover:bg-lovely/90 px-8 py-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 group border border-lovely/30 w-full sm:w-auto justify-center"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider opacity-85">Download on the</p>
              <p className="text-lg font-semibold font-sans">App Store</p>
            </div>
          </a>

          {/* Google Play Store */}
          <a
            href="https://play.google.com/store/apps/details?id=com.WifeyForLifey&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-everGreen text-creamey hover:bg-everGreen/90 px-8 py-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 group border border-everGreen/30 w-full sm:w-auto justify-center"
          >
         <FaGooglePlay className="text-creamey w-6 h-6" />

            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider opacity-85">Get it on</p>
              <p className="text-lg font-semibold font-sans">Google Play</p>
            </div>
          </a>
        </div>

        {/* Showcase Image Carousel */}
        <AppShowcaseCarousel />

        {/* Feature Cards Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto mb-16">
          <div className="bg-white/40 p-6 rounded-2xl border border-lovely/10 shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center justify-center p-3 bg-lovely/10 rounded-xl text-lovely mb-4">
              <ListTodo className="w-6 h-6" />
            </span>
            <h3 className={`${thirdFont.className} text-xl font-bold text-lovely mb-2`}>Interactive Lists</h3>
            <p className="text-lovely/85 text-sm leading-relaxed">
              Track items, set budgets, and organize your bridal prep checklists with dynamic checklists that sync across your devices.
            </p>
          </div>

          <div className="bg-white/40 p-6 rounded-2xl border border-lovely/10 shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center justify-center p-3 bg-lovely/10 rounded-xl text-lovely mb-4">
              <CalendarDays className="w-6 h-6" />
            </span>
            <h3 className={`${thirdFont.className} text-xl font-bold text-lovely mb-2`}>Timeline Bestie</h3>
            <p className="text-lovely/85 text-sm leading-relaxed">
              Plan and customize your perfect wedding day timeline down to the minute. Receive notifications and tips as the big day approaches.
            </p>
          </div>

          <div className="bg-white/40 p-6 rounded-2xl border border-lovely/10 shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center justify-center p-3 bg-lovely/10 rounded-xl text-lovely mb-4">
              <Radio className="w-6 h-6" />
            </span>
            <h3 className={`${thirdFont.className} text-xl font-bold text-lovely mb-2`}>Bridal Era Playlists</h3>
            <p className="text-lovely/85 text-sm leading-relaxed">
              Read all our premium blog guides, listen to curated playlists, and get daily motivational tips to keep you inspired and stress-free.
            </p>
          </div>
        </div> */}

        {/* Back to Home Button */}
        {/* <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-lovely text-base font-medium rounded-xl text-lovely bg-transparent hover:bg-lovely hover:text-creamey transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default BlogListPage;
