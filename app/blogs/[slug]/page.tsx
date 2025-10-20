"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { thirdFont } from "@/fonts";
import Image from "next/image";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tikTokVideoUrl?: string;
  // author: {
  //   _id: string;
  //   username: string;
  //   firstName?: string;
  //   lastName?: string;
  //   email: string;
  //   imageURL?: string;
  // };
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
      // Check if it's a photo post that needs oEmbed data
      const photoMatch = blog.tikTokVideoUrl.match(/\/photo\/(\d+)/);
      if (photoMatch) {
        fetchTikTokEmbed(blog.tikTokVideoUrl);
      }
    }
  }, [blog]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      // Fetch the blog post
      const response = await axios.get(`/api/blogs/${slug}`);
      setBlog(response.data.data);

      // Increment view count
      await axios.patch(`/api/blogs/${slug}`, { action: "increment_view" });

      // Fetch related blogs (same categories or tags)
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
      // Get blogs with similar categories or tags
      const params = new URLSearchParams({
        status: "published",
        all: "true",
      });

      const response = await axios.get(`/api/blogs?${params}`);
      const allBlogs = response.data.data;

      // Filter related blogs based on categories and tags
      const related = allBlogs
        .filter((b: Blog) => b._id !== currentBlog._id)
        .filter((b: Blog) => {
          const hasCommonCategory = b.categories.some((cat) =>
            currentBlog.categories.includes(cat)
          );
          const hasCommonTag = b.tags.some((tag) =>
            currentBlog.tags.includes(tag)
          );
          return hasCommonCategory || hasCommonTag;
        })
        .slice(0, 3);

      setRelatedBlogs(related);
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  const fetchTikTokEmbed = async (url: string) => {
    setTikTokLoading(true);
    setTikTokError("");
    setTikTokEmbedData(null);

    try {
      const response = await axios.get(
        `/api/tiktok-embed?url=${encodeURIComponent(url)}`
      );
      setTikTokEmbedData(response.data);
    } catch (error: any) {
      console.error("Error fetching TikTok embed:", error);
      setTikTokError("Failed to load TikTok content");
    } finally {
      setTikTokLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            removed.
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
      {/* Breadcrumb */}
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
        {/* Article Header */}
        <header className="mb-8 flex flex-col items-center w-full justify-center">
          {/* Categories */}
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

          {/* Title */}
          <h1
            className={`${thirdFont.className} text-4xl md:text-5xl font-bold text-lovely mb-4 leading-tight`}
          >
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-lovely/90 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap  items-center gap-6 text-sm text-lovely/80 mb-6">
            {/* <div className="flex items-center">
              {blog.author.imageURL && (
                <img
                  src={blog.author.imageURL}
                  alt={blog.author.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div>
                <p className="font-medium text-lovely">
                  {blog.author.firstName && blog.author.lastName
                    ? `${blog.author.firstName} ${blog.author.lastName}`
                    : blog.author.username}
                </p>
                <p className="text-lovely/80">Author</p>
              </div>
            </div> */}
            <div className="flex items-center space-x-4">
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              <span>•</span>
              <span>{blog.readingTime} min read</span>
              <span>•</span>
              <span>{blog.viewCount} views</span>
            </div>
          </div>

          {/* Featured Image */}
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

        {/* Article Content */}
        <div className="bg-creamey text-lovely rounded-lg  p-8 mb-8">
          <div
            className="prose blog-content overflow-x-scroll prose-lg max-w-none prose-headings:text-lovely prose-p:text-lovely prose-a:text-blue-600 prose-strong:text-lovely"
            // dangerouslySetInnerHTML={{ __html: blog.content }}
            // dangerouslySetInnerHTML={{
            //   __html: blog.content.replace(
            //     /<img /g,
            //     '<img style="float:left;max-width:320px;margin:30px 16px 8px 0;display:inline-block;" '
            //   ),
            // }}
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

        {/* TikTok Video */}
        {blog.tikTokVideoUrl && (
          <div className="bg-creamey rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-lovely mb-4">
              Watch on TikTok
            </h3>
            <div className="flex bg-creamey justify-center">
              {(() => {
                // Extract video/photo ID from TikTok URL
                const videoMatch = blog.tikTokVideoUrl.match(/\/video\/(\d+)/);
                const photoMatch = blog.tikTokVideoUrl.match(/\/photo\/(\d+)/);

                // Handle photo posts with oEmbed data
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

                  // Fallback for photo posts
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

                // Handle video posts with iframe
                let embedUrl;
                if (videoMatch) {
                  embedUrl = `https://www.tiktok.com/embed/v2/${videoMatch[1]}?lang=en-US&autoplay=0&muted=1`;
                } else {
                  // Fallback: try to extract any numeric ID
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

        {/* Tags */}
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

        {/* Related Posts */}
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

        {/* Navigation */}
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

export default BlogDetailPage;
