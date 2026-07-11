"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { thirdFont } from "@/fonts";
import Image from "next/image";
import { Smartphone, Sparkles, CalendarDays, ListTodo, Radio, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { FaGooglePlay } from "react-icons/fa";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tikTokVideoUrl?: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  categories: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  readingTime: number;
  formattedPublishDate?: string;
}

/*
==========================================================
ORIGINAL BLOG DETAIL COMPONENT - COMMENTED OUT FOR BACKUP
==========================================================
const BlogDetailPage = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tikTokEmbedData, setTikTokEmbedData] = useState<any>(null);
  const [tikTokLoading, setTikTokLoading] = useState(false);
  const [tikTokError, setTikTokError] = useState("");

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
      const response = await axios.get(`/api/blogs/${slug}`);
      setBlog(response.data.data);
      await axios.patch(`/api/blogs/${slug}`, { action: "increment_view" });
      if (
        response.data.data.categories.length > 0 ||
        response.data.data.tags.length > 0
      ) {
        fetchRelatedBlogs(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching blog:", error);
      if (error.response?.status === 404) {
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
      const params = new URLSearchParams({
        status: "published",
        limit: "4",
        exclude: currentBlog._id,
      });
      currentBlog.categories.forEach((cat) => params.append("categories", cat));
      currentBlog.tags.forEach((tag) => params.append("tags", tag));

      const response = await axios.get(`/api/blogs?${params}`);
      const filtered = response.data.data
        .filter((b: Blog) => b._id !== currentBlog._id)
        .slice(0, 3);
      setRelatedBlogs(filtered);
    } catch (error) {
      console.error("Error fetching related blogs:", error);
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
    } catch (error: any) {
      console.error("Error fetching TikTok embed:", error);
      setTikTokError("Failed to load TikTok embed");
    } finally {
      setTikTokLoading(false);
    }
  };

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
          <p className="text-lovely/90 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamey container-custom">
      {/* Breadcrumb * /}
      <div className=" border-b">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-lovely/90">
            <Link href="/" className="hover:text-lovely hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-lovely hover:underline">
              Blogs
            </Link>
            <span>/</span>
            <span className="text-lovely">{blog.title}</span>
          </nav>
        </div>
      </div>

      <article className=" mx-auto   py-8">
        {/* Article Header * /}
        <header className="mb-8 flex flex-col items-center w-full justify-center">
          {/* Categories * /}
          {blog.categories.length > 0 && (
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

          {/* Title * /}
          <h1
            className={`${thirdFont.className} text-4xl md:text-5xl font-bold text-lovely mb-4 leading-tight`}
          >
            {blog.title}
          </h1>

          {/* Excerpt * /}
          <p className="text-xl text-lovely/90 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Meta Information * /}
          <div className="flex flex-wrap  items-center gap-6 text-sm text-lovely/80 mb-6">
            <div className="flex items-center space-x-4">
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              <span>•</span>
              <span>{blog.readingTime} min read</span>
            </div>
          </div>

          {/* Featured Image * /}
          {blog.featuredImage && (
            <div className="max-w-3xl relative aspect-video w-full mb-8">
              <Image
                fill
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>

        {/* Article Content * /}
        <div className="bg-creamey text-lovely rounded-lg  p-8 mb-8">
          <div
            className="prose blog-content overflow-x-scroll prose-lg max-w-none prose-headings:text-lovely prose-p:text-lovely prose-a:text-blue-600 prose-strong:text-lovely"
            dangerouslySetInnerHTML={{
              __html:
                blog.content.replace(
                  /<img /g,
                  '<div style="clear:both;"></div><img style="float:left;max-width:320px;margin:30px 16px 8px 0;" '
                ) + '<div style="clear:both;"></div>',
            }}
          />
          <style jsx global>{`
            .blog-content ol {
              list-style-type: decimal;
              padding-top: 3em;
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

        {/* TikTok Video * /}
        {blog.tikTokVideoUrl && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-lovely mb-4">
              Watch on TikTok
            </h3>
            <div className="flex bg-creamey justify-center">
              {(() => {
                const videoMatch = blog.tikTokVideoUrl.match(/\/video\/(\d+)/);
                const photoMatch = blog.tikTokVideoUrl.match(/\/photo\/(\d+)/);
                if (photoMatch) {
                  if (tikTokLoading) {
                    return (
                      <div className="bg-creamey p-8 rounded-lg border-2 border-lovely/20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lovely mx-auto mb-4"></div>
                        <p className="text-lovely">Loading TikTok content...</p>
                      </div>
                    );
                  }
                  if (tikTokError) {
                    return (
                      <div className="bg-creamey p-4 rounded-lg border-2 border-lovely/20">
                        <p className="text-lovely mb-3">
                          Unable to load TikTok content. Click below to view:
                        </p>
                        <a
                          href={blog.tikTokVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-lovely text-white rounded-lg hover:bg-lovely/90 transition-colors"
                        >
                          View TikTok Post
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    );
                  }
                  if (tikTokEmbedData?.html) {
                    return (
                      <div
                        className="tiktok-embed-container"
                        dangerouslySetInnerHTML={{
                          __html: tikTokEmbedData.html,
                        }}
                      />
                    );
                  }
                  return (
                    <div className="bg-creamey p-4 rounded-lg border-2 border-lovely/20">
                      <p className="text-lovely mb-3">
                        This is a TikTok photo post. Click below to view:
                      </p>
                      <a
                        href={blog.tikTokVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-lovely text-white rounded-lg hover:bg-lovely/90 transition-colors"
                      >
                        View TikTok Post
                        <svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  );
                }
                let embedUrl;
                if (videoMatch) {
                  embedUrl = `https://www.tiktok.com/embed/v2/${videoMatch[1]}?lang=en-US&autoplay=0&muted=1`;
                } else {
                  const idMatch = blog.tikTokVideoUrl.match(/(\d+)/);
                  embedUrl = idMatch
                    ? `https://www.tiktok.com/embed/v2/${idMatch[0]}?lang=en-US&autoplay=0&muted=1`
                    : blog.tikTokVideoUrl;
                }
                return (
                  <iframe
                    src={embedUrl}
                    width="325"
                    height="580"
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg bg-creamey border-none"
                    style={{
                      backgroundColor: "#fbf3e0",
                      maxWidth: "100%",
                      height: "auto",
                      aspectRatio: "9/16",
                    }}
                  />
                );
              })()}
            </div>
          </div>
        )}

        {/* Tags * /}
        {blog.tags.length > 0 && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-lovely mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-pinkey text-lovely text-sm px-3 py-1 rounded-full  cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <BlogsCommentSection slug={blog.slug} blogId={blog._id} />

        {relatedBlogs.length > 0 && (
          <div className="bg-creamey rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-lovely mb-6">
              Related Blogs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <article
                  key={relatedBlog._id}
                  className="bg-lovely rounded-lg text-creamey"
                >
                  <Link href={`/blogs/${relatedBlog.slug}`}>
                    {relatedBlog.featuredImage && (
                      <div className="relative w-full  aspect-video mb-4">
                        <Image
                          fill
                          src={relatedBlog.featuredImage}
                          alt={relatedBlog.title}
                          className="w-full h-40 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
                          unoptimized
                        />
                      </div>
                    )}
                    <h4 className="text-lg px-2 font-semibold text-creamey mb-2 group-hover:text-blue-600 transition-colors">
                      {relatedBlog.title}
                    </h4>
                    <p className="px-2 text-creamey/90 text-sm mb-3">
                      {truncateText(stripHtml(relatedBlog.excerpt), 100)}
                    </p>
                    <div className="flex px-2 items-center text-xs text-lovely/80">
                      <span>
                        {formatDate(
                          relatedBlog.publishedAt || relatedBlog.createdAt
                        )}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{relatedBlog.readingTime} min read</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Navigation * /}
        <div className="mt-12 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 border hover:text-creamey duration-500  border-lovely text-base font-medium rounded-md text-lovely bg-creamey hover:bg-lovely  transition-colors"
          >
            ← Back to Blogs
          </Link>
        </div>
      </article>
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

const BlogDetailPage = () => {
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
      </div>
    </div>
  );
};

export default BlogDetailPage;
