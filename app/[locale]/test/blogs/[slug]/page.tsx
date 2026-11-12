"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { thirdFont } from "@/fonts";
import Image from "next/image";
import {
  Sparkles,
  Calendar,
  Clock,
  Eye,
  Languages,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import TikTokEmbed from "@/components/TikTokEmbed";
import type { Blog, ContentBlock } from "../page";

function renderContentBlocks(
  blocks: ContentBlock[] | undefined,
  locale: "en" | "ar"
) {
  if (!blocks || blocks.length === 0) return null;

  const normalizeHtmlSpacing = (html: string) => {
    return html
      .replace(/<p>\s*(?:<br\s*\/?\s*)+<\/p>/gi, "<br/>")
      .replace(/(?:<br\s*\/?\s*){2,}/gi, "<br/>");
  };

  return blocks.map((block, index) => {
    const rawContent =
      locale === "ar" && block.arabicContent
        ? block.arabicContent
        : block.textHtml || "";
    const content = normalizeHtmlSpacing(rawContent);

    switch (block.type) {
      case "text":
        return (
          <div
            key={index}
            className="prose blog-content prose-lg max-w-none text-lovely leading-relaxed prose-headings:text-lovely prose-p:text-lovely prose-strong:text-lovely"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      case "image":
        return (
          <div key={index} className="my-8 flex flex-col items-center">
            {block.imageUrl && (
              <img
                src={block.imageUrl}
                alt={block.alt || "Blog image"}
                className="w-auto max-w-full h-auto max-h-[85vh] rounded-xl shadow-md object-contain"
                loading="lazy"
              />
            )}
            {block.caption && (
              <p className="text-sm text-lovely/75 text-center mt-2">
                {block.caption}
              </p>
            )}
          </div>
        );
      case "imageText": {
        const isRtl = locale === "ar";
        const layout = block.layout === "img-left" ? "img-left" : "img-block";

        if (layout === "img-left" && block.imageUrl) {
          return (
            <div
              dir={isRtl ? "rtl" : "ltr"}
              key={index}
              className="flex flex-col-reverse md:flex-row gap-6 my-8 items-start"
            >
              <div
                className="md:w-1/2 prose blog-content prose-lg text-lovely leading-relaxed prose-headings:text-lovely prose-p:text-lovely prose-strong:text-lovely"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <img
                  src={block.imageUrl}
                  alt={block.alt || "Blog image"}
                  className="w-auto max-w-full h-auto max-h-[75vh] rounded-xl shadow-md object-contain"
                  loading="lazy"
                />
                {block.caption && (
                  <p
                    className={`text-sm w-full ${
                      isRtl ? "text-right" : "text-left"
                    } text-lovely/75 mt-2`}
                  >
                    {block.caption}
                  </p>
                )}
              </div>
            </div>
          );
        }

        // img-block layout
        return (
          <div key={index} className="my-8" dir={isRtl ? "rtl" : "ltr"}>
            {block.imageUrl && (
              <div className="flex flex-col items-center mb-4">
                <img
                  src={block.imageUrl}
                  alt={block.alt || "Blog image"}
                  className="w-auto max-w-full h-auto max-h-[85vh] rounded-xl shadow-md object-contain"
                  loading="lazy"
                />
                {block.caption && (
                  <p className="text-sm text-lovely/75 text-center mt-2">
                    {block.caption}
                  </p>
                )}
              </div>
            )}
            <div
              className="prose blog-content prose-lg max-w-none text-lovely leading-relaxed prose-headings:text-lovely prose-p:text-lovely prose-strong:text-lovely"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }
      case "carousel": {
        const rtl = locale === "ar";
        const imgs = (block.images || []).filter((i) => !!i?.imageUrl);
        if (imgs.length === 0 && block.imageUrl) {
          imgs.push({
            imageUrl: block.imageUrl,
            alt: block.alt,
            caption: block.caption,
          });
        }

        return (
          <div key={index} className="my-8 px-8" dir={rtl ? "rtl" : "ltr"}>
            {imgs.length > 0 ? (
              <Carousel
                className="w-full"
                opts={{ direction: rtl ? "rtl" : "ltr" }}
              >
                <CarouselContent>
                  {imgs.map((img, i) => (
                    <CarouselItem key={i}>
                      <div className="relative w-full h-80 md:h-[550px] rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                        <Image
                          src={img.imageUrl}
                          alt={img.alt || "Blog image"}
                          fill
                          sizes="100vw"
                          className="object-contain"
                        />
                      </div>
                      {img.caption && (
                        <p className="text-sm text-lovely/75 text-center mt-2">
                          {img.caption}
                        </p>
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="w-full h-32 rounded-md bg-lovely/10 flex items-center justify-center text-lovely/70">
                {rtl
                  ? "لا توجد صور في هذا المعرض"
                  : "No images available in this carousel"}
              </div>
            )}

            {content && (
              <div
                className="prose blog-content prose-lg max-w-none text-lovely leading-relaxed mt-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        );
      }
      case "embed": {
        if (!block.url) return null;

        // TikTok embeds are rendered with the official script-based embed widget
        if (block.url.includes("tiktok.com")) {
          return (
            <TikTokEmbed
              key={index}
              url={block.url}
              caption={block.caption}
              locale={locale}
            />
          );
        }

        const instagram = block.url.match(
          /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/
        );
        const youtube = block.url.match(
          /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]+)/
        );

        let embedSrc: string | null = null;
        let platform = "Media";
        let maxWidth = "360px";
        let height = "520";
        let aspectRatio = "4/5";

        if (instagram) {
          embedSrc = `https://www.instagram.com/p/${instagram[1]}/embed`;
          platform = "Instagram";
          maxWidth = "360px";
          height = "520";
          aspectRatio = "4/5";
        } else if (youtube) {
          embedSrc = `https://www.youtube.com/embed/${youtube[1]}`;
          platform = "YouTube";
          maxWidth = "720px";
          height = "400";
          aspectRatio = "16/9";
        }

        return (
          <div
            key={index}
            className="my-8 flex flex-col items-center justify-center"
          >
            {embedSrc ? (
              <div
                className="w-full flex flex-col items-center justify-center bg-creamey"
                style={{
                  maxWidth,
                }}
              >
                <iframe
                  src={embedSrc}
                  width={platform === "YouTube" ? "100%" : "325"}
                  height={height}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg bg-creamey border-none shadow-md"
                  style={{
                    backgroundColor: "#fbf3e0",
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio,
                  }}
                />
                {block.url && (
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-lovely/70 hover:text-lovely hover:underline"
                  >
                    <span>
                      {locale === "ar"
                        ? `مشاهدة على ${platform}`
                        : `Watch on ${platform}`}
                    </span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-lovely/20 bg-creamey/80">
                <p className="text-lovely text-sm font-medium">
                  {locale === "ar"
                    ? "منشور تفاعلي من منصة"
                    : "Interactive post on"}{" "}
                  {platform}
                </p>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-lovely px-6 py-3 text-sm font-semibold text-creamey shadow-md hover:bg-lovely/90 transition"
                >
                  <span>
                    {locale === "ar" ? "مشاهدة على" : "Watch on"} {platform}
                  </span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
            )}
            {block.caption && (
              <p className="mt-2 text-center text-sm text-lovely/75 font-medium">
                {block.caption}
              </p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  });
}

const TestBlogDetailPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const routeLocale = (params?.locale as string) || "en";
  const initialLang =
    searchParams.get("lang") === "ar" || routeLocale === "ar" ? "ar" : "en";

  const [previewLang, setPreviewLang] = useState<"en" | "ar">(initialLang);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tikTokEmbedData, setTikTokEmbedData] = useState<any>(null);
  const [tikTokLoading, setTikTokLoading] = useState(false);
  const [tikTokError, setTikTokError] = useState("");
  const [migratingSingle, setMigratingSingle] = useState(false);

  const isArabic = previewLang === "ar";

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  useEffect(() => {
    if (blog?.tikTokVideoUrl) {
      const photoMatch = blog.tikTokVideoUrl.match(/\/photo\/(\d+)/);
      if (photoMatch) {
        fetchTikTokEmbed(blog.tikTokVideoUrl);
      }
    }
  }, [blog]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/blogs/${slug}?source=web`);
      const fetchedBlog: Blog = response.data.data;
      setBlog(fetchedBlog);
      if (
        (fetchedBlog.categories && fetchedBlog.categories.length > 0) ||
        (fetchedBlog.tags && fetchedBlog.tags.length > 0)
      ) {
        fetchRelatedBlogs(fetchedBlog);
      }
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      if (err.response?.status === 404) {
        setError("Blog post not found");
      } else {
        setError("Failed to load blog post");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (currentBlog: Blog) => {
    try {
      const queryParams = new URLSearchParams({
        status: "published",
      });
      const response = await axios.get(`/api/blogs?${queryParams}`);
      const filtered = (response.data.data || [])
        .filter((b: Blog) => b._id !== currentBlog._id)
        .slice(0, 3);
      setRelatedBlogs(filtered);
    } catch (err) {
      console.error("Error fetching related blogs:", err);
    }
  };

  const fetchTikTokEmbed = async (url: string) => {
    setTikTokLoading(true);
    setTikTokError("");
    try {
      const response = await axios.get(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      );
      setTikTokEmbedData(response.data);
    } catch (err: any) {
      console.error("Error fetching TikTok embed:", err);
      setTikTokError("Failed to load TikTok embed");
    } finally {
      setTikTokLoading(false);
    }
  };

  const handleMigrateThisBlog = async (
    mode: "split-images" | "single-block"
  ) => {
    if (!blog?._id) return;
    setMigratingSingle(true);
    try {
      await axios.post("/api/blogs/migrate", {
        blogId: blog._id,
        mode,
        overwriteExistingBlocks: true,
      });
      const refreshed = await axios.get(`/api/blogs/${slug}?track=false`);
      setBlog(refreshed.data.data);
    } catch (err) {
      console.error("Failed to migrate blog:", err);
    } finally {
      setMigratingSingle(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isArabic ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-creamey flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lovely"></div>
          <p className="mt-4 text-lovely">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-creamey flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-lovely mb-4">
            {error || "Blog not found"}
          </h1>
          <Link
            href={`/${routeLocale}/test/blogs`}
            className="inline-flex items-center px-6 py-3 rounded-md text-creamey bg-lovely hover:bg-lovely/90"
          >
            Back to Test Blogs
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = isArabic
    ? blog.v2?.titleAR ||
      blog.titleAR ||
      blog.translations?.ar?.title ||
      blog.title
    : blog.title;
  const displayExcerpt = isArabic
    ? blog.v2?.excerptAR ||
      blog.excerptAR ||
      blog.translations?.ar?.excerpt ||
      blog.excerpt
    : blog.excerpt;
  const effectiveBlocks = blog.v2?.blocks || blog.blocks;
  const hasBlocks = Array.isArray(effectiveBlocks) && effectiveBlocks.length > 0;
  const hasEmbedBlock =
    hasBlocks &&
    effectiveBlocks!.some(
      (b) => b.type === "embed" && Boolean(b.url && b.url.trim())
    );

  return (
    <div
      className="min-h-screen bg-creamey container-custom"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top Test Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="rounded-xl border border-lovely/30 bg-white/90 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-lovely px-2.5 py-0.5 text-xs font-bold text-creamey">
              <Sparkles className="h-3 w-3" />
              TEST READER (V2)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-lovely/10 px-2.5 py-0.5 text-xs font-semibold text-lovely">
              <Layers className="h-3.5 w-3.5" />
              {hasBlocks
                ? `Rendered via ${effectiveBlocks!.length} V2 Block(s)`
                : "Rendered via Legacy HTML Fallback"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={migratingSingle}
              onClick={() => handleMigrateThisBlog("split-images")}
              className="inline-flex items-center gap-1 rounded-lg border border-lovely/30 bg-creamey px-2.5 py-1 text-xs font-semibold text-lovely hover:bg-lovely/10 disabled:opacity-50"
              title="Convert this blog's legacy HTML content & inline images into structured blocks"
            >
              <RefreshCw
                className={`h-3 w-3 ${migratingSingle ? "animate-spin" : ""}`}
              />
              {hasBlocks ? "Re-sync Blocks from HTML" : "Convert to Blocks Now"}
            </button>

            <div className="inline-flex items-center gap-1 rounded-lg border border-lovely/30 bg-creamey p-0.5">
              <Languages className="h-3.5 w-3.5 text-lovely mx-1" />
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`rounded px-2.5 py-0.5 text-xs font-semibold transition ${
                  previewLang === "en"
                    ? "bg-lovely text-creamey"
                    : "text-lovely hover:bg-lovely/10"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("ar")}
                className={`rounded px-2.5 py-0.5 text-xs font-semibold transition ${
                  previewLang === "ar"
                    ? "bg-lovely text-creamey"
                    : "text-lovely hover:bg-lovely/10"
                }`}
              >
                AR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-lovely/20 mt-4">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-lovely/90">
            <Link
              href={`/${routeLocale}`}
              className="hover:text-lovely hover:underline"
            >
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <Link
              href={`/${routeLocale}/test/blogs?lang=${previewLang}`}
              className="hover:text-lovely hover:underline"
            >
              {isArabic ? "المدونة (نسخة الاختبار)" : "Blogs (Test)"}
            </Link>
            <span>/</span>
            <span className="text-lovely font-medium">{displayTitle}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8 flex flex-col items-start w-full">
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-pinkey text-lovely text-sm font-medium px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className={`${thirdFont.className} text-4xl md:text-5xl font-bold text-lovely mb-4 leading-tight`}
          >
            {displayTitle}
          </h1>

          {/* Excerpt */}
          {displayExcerpt && (
            <p className="text-xl text-lovely/90 mb-6 leading-relaxed">
              {displayExcerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-lovely/80 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {blog.readingTime || 1}{" "}
                {isArabic ? "دقائق قراءة" : "min read"}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>
                {blog.viewCount ?? 0} {isArabic ? "مشاهدة" : "views"}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative aspect-video w-full mb-8 rounded-2xl overflow-hidden shadow-lg">
              <Image
                fill
                src={blog.featuredImage}
                alt={displayTitle}
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Article Content: Render Blocks if available, otherwise fallback to legacy HTML */}
        <div className="bg-creamey text-lovely rounded-lg p-2 md:p-6 mb-8">
          {hasBlocks ? (
            <div className="space-y-6">
              {renderContentBlocks(effectiveBlocks, previewLang)}
            </div>
          ) : (
            <div
              className="prose blog-content overflow-x-auto prose-lg max-w-none prose-headings:text-lovely prose-p:text-lovely prose-a:text-blue-600 prose-strong:text-lovely"
              dangerouslySetInnerHTML={{
                __html:
                  (isArabic && blog.translations?.ar?.content
                    ? blog.translations.ar.content
                    : blog.content || ""
                  ).replace(
                    /<img /g,
                    '<div style="clear:both;"></div><img style="float:left;max-width:320px;margin:30px 16px 8px 0;" '
                  ) + '<div style="clear:both;"></div>',
              }}
            />
          )}
          <style jsx global>{`
            .blog-content ol {
              list-style-type: decimal;
              margin-left: 1.5em;
              padding-left: 1em;
            }
            .blog-content ul {
              list-style-type: disc;
              margin-left: 1.5em;
              padding-left: 1em;
            }
          `}</style>
        </div>

        {/* TikTok Video: Only render legacy bottom section if there is no embed block in the article */}
        {!hasEmbedBlock && blog.tikTokVideoUrl && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 mb-8 border border-lovely/15">
            <h3 className="text-lg font-semibold text-lovely mb-4">
              {isArabic ? "شاهدي على تيك توك" : "Watch on TikTok"}
            </h3>
            <TikTokEmbed url={blog.tikTokVideoUrl} locale={previewLang} />
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 mb-8 border border-lovely/15">
            <h3 className="text-lg font-semibold text-lovely mb-4">
              {isArabic ? "الوسوم" : "Tags"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-pinkey text-lovely text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 border border-lovely/15">
            <h3 className="text-2xl font-bold text-lovely mb-6">
              {isArabic ? "مقالات ذات صلة" : "Related Blogs"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => {
                const relTitle = isArabic
                  ? relatedBlog.titleAR ||
                    relatedBlog.translations?.ar?.title ||
                    relatedBlog.title
                  : relatedBlog.title;
                const relExcerpt = isArabic
                  ? relatedBlog.excerptAR ||
                    relatedBlog.translations?.ar?.excerpt ||
                    relatedBlog.excerpt
                  : relatedBlog.excerpt;
                return (
                  <article
                    key={relatedBlog._id}
                    className="bg-lovely rounded-lg text-creamey overflow-hidden"
                  >
                    <Link
                      href={`/${routeLocale}/test/blogs/${relatedBlog.slug}?lang=${previewLang}`}
                    >
                      {relatedBlog.featuredImage && (
                        <div className="relative w-full aspect-video mb-3">
                          <Image
                            fill
                            src={relatedBlog.featuredImage}
                            alt={relTitle}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="text-lg font-semibold text-creamey mb-2">
                          {relTitle}
                        </h4>
                        <p className="text-creamey/90 text-sm mb-3">
                          {truncateText(stripHtml(relExcerpt), 100)}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            href={`/${routeLocale}/test/blogs?lang=${previewLang}`}
            className="inline-flex items-center px-6 py-3 border hover:text-creamey duration-500 border-lovely text-base font-medium rounded-md text-lovely bg-creamey hover:bg-lovely transition-colors"
          >
            {isArabic ? "→ العودة إلى المدونة" : "← Back to Blogs (Test)"}
          </Link>
        </div>
      </article>
    </div>
  );
};

export default TestBlogDetailPage;

