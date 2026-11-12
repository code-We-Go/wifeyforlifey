"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { thirdFont } from "@/fonts";
import Image from "next/image";
import { Sparkles, Layers, Languages, RefreshCw } from "lucide-react";

export interface ContentBlock {
  type: "text" | "image" | "imageText" | "carousel" | "embed";
  textHtml?: string;
  arabicContent?: string;
  imageUrl?: string;
  url?: string;
  caption?: string;
  alt?: string;
  layout?: "img-left" | "img-block";
  images?: { imageUrl: string; alt?: string; caption?: string }[];
}

export interface Blog {
  _id: string;
  title: string;
  titleAR?: string;
  slug: string;
  content: string;
  blocks?: ContentBlock[];
  v2?: {
    titleAR?: string;
    excerptAR?: string;
    blocks?: ContentBlock[];
  };
  excerpt: string;
  excerptAR?: string;
  featuredImage?: string;
  tikTokVideoUrl?: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  categories: string[];
  publishedAt?: string;
  viewCount: number;
  mobileViewCount?: number;
  webViewCount?: number;
  featured: boolean;
  createdAt: string;
  readingTime: number;
  formattedPublishDate?: string;
  translations?: {
    ar?: {
      title?: string;
      excerpt?: string;
      content?: string;
    };
  };
}

const TestBlogListPage = () => {
  const params = useParams();
  const routeLocale = (params?.locale as string) || "en";

  const [previewLang, setPreviewLang] = useState<"en" | "ar">(
    routeLocale === "ar" ? "ar" : "en"
  );
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

  // Migration state for testing
  const [migrationSummary, setMigrationSummary] = useState<any | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");

  const isArabic = previewLang === "ar";

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        status: "published",
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTag && { tag: selectedTag }),
      });

      const response = await axios.get(`/api/blogs?${queryParams}`);
      const list: Blog[] = response.data.data || [];
      setBlogs(list);
      setTotalPages(response.data.totalPages || 1);

      const categories = new Set<string>();
      const tags = new Set<string>();

      list.forEach((blog: Blog) => {
        (blog.categories || []).forEach((cat) => categories.add(cat));
        (blog.tags || []).forEach((tag) => tags.add(tag));
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
      setFeaturedBlogs((response.data.data || []).slice(0, 3));
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
    }
  };

  const fetchMigrationStatus = async () => {
    try {
      const res = await axios.get("/api/blogs/migrate");
      setMigrationSummary(res.data?.summary || null);
    } catch (err) {
      console.error("Error fetching migration status:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchMigrationStatus();
    if (page === 1) {
      fetchFeaturedBlogs();
    }
  }, [page, search, selectedCategory, selectedTag]);

  const handleMigrate = async (mode: "split-images" | "single-block") => {
    setMigrating(true);
    setMigrationMessage("");
    try {
      const res = await axios.post("/api/blogs/migrate", {
        mode,
        overwriteExistingBlocks: false,
      });
      setMigrationMessage(res.data?.message || "Migration completed!");
      await fetchBlogs();
      await fetchFeaturedBlogs();
      await fetchMigrationStatus();
    } catch (err: any) {
      setMigrationMessage(
        err?.response?.data?.error || "Failed to migrate blogs"
      );
    } finally {
      setMigrating(false);
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getLocalizedTitle = (blog: Blog) => {
    if (isArabic) {
      return (
        blog.v2?.titleAR ||
        blog.titleAR ||
        blog.translations?.ar?.title ||
        blog.title
      );
    }
    return blog.title;
  };

  const getLocalizedExcerpt = (blog: Blog) => {
    if (isArabic) {
      return (
        blog.v2?.excerptAR ||
        blog.excerptAR ||
        blog.translations?.ar?.excerpt ||
        blog.excerpt ||
        ""
      );
    }
    return blog.excerpt || "";
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setPage(1);
  };

  return (
    <div
      className="min-h-screen container-custom bg-creamey"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Test Environment Top Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-xl border border-lovely/30 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lovely px-3 py-1 text-xs font-bold text-creamey">
                <Sparkles className="h-3.5 w-3.5" />
                TEST ENVIRONMENT
              </span>
              <span className="text-sm font-medium text-lovely">
                Block-Based Bilingual Blogs (TGN Article System)
              </span>
            </div>

            {/* Instant Language Preview Switcher */}
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-lovely" />
              <div className="inline-flex rounded-lg border border-lovely/30 bg-creamey p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewLang("en")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    previewLang === "en"
                      ? "bg-lovely text-creamey"
                      : "text-lovely hover:bg-lovely/10"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang("ar")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    previewLang === "ar"
                      ? "bg-lovely text-creamey"
                      : "text-lovely hover:bg-lovely/10"
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>

          {/* Migration Bar */}
          {migrationSummary && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-lovely/15 pt-3 text-xs text-lovely/90">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Total Blogs: <strong>{migrationSummary.totalBlogs}</strong>
                </span>
                <span>•</span>
                <span>
                  With Blocks:{" "}
                  <strong className="text-green-700">
                    {migrationSummary.alreadyHasBlocks}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Legacy HTML Only:{" "}
                  <strong className="text-amber-700">
                    {migrationSummary.needsMigration}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  With Inline Images:{" "}
                  <strong>{migrationSummary.hasInlineImages}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={migrating}
                  onClick={() => handleMigrate("split-images")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lovely px-3 py-1.5 text-xs font-semibold text-creamey hover:bg-lovely/90 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${migrating ? "animate-spin" : ""}`}
                  />
                  {migrating
                    ? "Migrating..."
                    : "Migrate Existing Blogs (Split Images + Text)"}
                </button>
                <button
                  type="button"
                  disabled={migrating}
                  onClick={() => handleMigrate("single-block")}
                  className="rounded-lg border border-lovely/40 bg-creamey px-3 py-1.5 text-xs font-semibold text-lovely hover:bg-lovely/10 disabled:opacity-50"
                >
                  Migrate as Single Text Block
                </button>
              </div>
            </div>
          )}

          {migrationMessage && (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-800">
              {migrationMessage}
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-lovely/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-start">
            <h1
              className={`${thirdFont.className} text-4xl md:text-5xl text-lovely font-semibold`}
            >
              {isArabic ? "المدونة (نسخة الاختبار)" : "Blogs (Blocks Test)"}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Blogs Section */}
        {featuredBlogs.length > 0 && page === 1 && (
          <div className="mb-12">
            <h2
              className={`${thirdFont.className} text-2xl md:text-3xl tracking-normal font-bold text-lovely mb-6`}
            >
              {isArabic ? "المقالات المميزة" : "Featured Blogs"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => {
                const blockCount = Array.isArray(blog.v2?.blocks)
                  ? blog.v2!.blocks!.length
                  : Array.isArray(blog.blocks)
                    ? blog.blocks.length
                    : 0;
                return (
                  <Link
                    href={`/${routeLocale}/test/blogs/${blog.slug}?lang=${previewLang}`}
                    key={blog._id}
                    className="bg-lovely/90 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    {blog.featuredImage && (
                      <div className="relative h-48 md:h-64 bg-gray-200">
                        <Image
                          fill
                          src={blog.featuredImage}
                          alt={getLocalizedTitle(blog)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-6 py-4 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {isArabic ? "مميز" : "Featured"}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-creamey/20 text-creamey text-xs px-2 py-0.5 rounded">
                          <Layers className="h-3 w-3" />
                          {blockCount > 0
                            ? `${blockCount} Blocks`
                            : "Legacy HTML"}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-creamey mb-2">
                        {getLocalizedTitle(blog)}
                      </h3>
                      <p className="text-creamey/90 text-sm">
                        {truncateText(
                          stripHtml(getLocalizedExcerpt(blog)),
                          120
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-lovely/90 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder={
                  isArabic ? "ابحثي في المقالات..." : "Search blogs..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey placeholder:text-lovely/80 text-lovely"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey text-lovely/80"
              >
                <option value="">
                  {isArabic ? "كل الفئات" : "All Categories"}
                </option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pinkey bg-creamey text-lovely/80"
              >
                <option value="">
                  {isArabic ? "كل الوسوم" : "All Tags"}
                </option>
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
                {isArabic ? "مسح الفلاتر" : "Clear all filters"}
              </button>
            </div>
          )}
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lovely"></div>
            <p className="mt-4 text-lovely/80">
              {isArabic ? "جاري تحميل المقالات..." : "Loading blogs..."}
            </p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
            {blogs.map((blog) => {
              const blockCount = Array.isArray(blog.v2?.blocks)
                ? blog.v2!.blocks!.length
                : Array.isArray(blog.blocks)
                  ? blog.blocks.length
                  : 0;
              return (
                <Link
                  href={`/${routeLocale}/test/blogs/${blog.slug}?lang=${previewLang}`}
                  key={blog._id}
                  className="bg-lovely/90 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {blog.featuredImage && (
                    <div className="relative w-full aspect-video bg-gray-200">
                      <Image
                        fill
                        src={blog.featuredImage}
                        alt={getLocalizedTitle(blog)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="px-6 py-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {blog.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {isArabic ? "مميز" : "Featured"}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-creamey/20 text-creamey text-xs px-2 py-0.5 rounded">
                        <Layers className="h-3 w-3" />
                        {blockCount > 0
                          ? `${blockCount} Blocks`
                          : "Legacy HTML"}
                      </span>
                      {blog.titleAR && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                          AR + EN
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-creamey mb-2">
                      {getLocalizedTitle(blog)}
                    </h3>
                    <p className="text-creamey/90 text-sm">
                      {truncateText(stripHtml(getLocalizedExcerpt(blog)), 120)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lovely/80 text-lg">
              {isArabic ? "لا توجد مقالات." : "No blogs found."}
            </p>
            {(search || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-lovely underline font-medium"
              >
                {isArabic
                  ? "مسح الفلاتر لعرض الكل"
                  : "Clear filters to see all blogs"}
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-lovely bg-white border border-lovely/30 rounded-lg hover:bg-lovely/10 disabled:opacity-50"
              >
                {isArabic ? "السابق" : "Previous"}
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      page === pageNum
                        ? "text-creamey bg-lovely border border-lovely"
                        : "text-lovely bg-white border border-lovely/30 hover:bg-lovely/10"
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
                className="px-4 py-2 text-sm font-medium text-lovely bg-white border border-lovely/30 rounded-lg hover:bg-lovely/10 disabled:opacity-50"
              >
                {isArabic ? "التالي" : "Next"}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBlogListPage;

