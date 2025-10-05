"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { thirdFont } from "@/fonts";
import Image from "next/image";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
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
  publishedAt?: string;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  readingTime: number;
  formattedPublishDate?: string;
}

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
      {/* Header */}
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
        {/* Featured Blogs Section */}
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
                    {/* <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        {blog.author.imageURL && (
                          <img
                            src={blog.author.imageURL}
                            alt={blog.author.username}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                        )}
                        <span>
                          {blog.author.firstName && blog.author.lastName
                            ? `${blog.author.firstName} ${blog.author.lastName}`
                            : blog.author.username}
                        </span>
                      </div>
                      <span>{blog.readingTime} min read</span>
                    </div> */}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
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

        {/* Blog List */}
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
                  {/* <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        {blog.author.imageURL && (
                          <img
                            src={blog.author.imageURL}
                            alt={blog.author.username}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                        )}
                        <span>
                          {blog.author.firstName && blog.author.lastName
                            ? `${blog.author.firstName} ${blog.author.lastName}`
                            : blog.author.username}
                        </span>
                      </div>
                      <span>{blog.readingTime} min read</span>
                    </div> */}
                </div>
              </Link>
              // <article
              //   key={blog._id}
              //   className="bg-lovely/90  rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              // >
              //   <Link href={`/blogs/${blog.slug}`} className="md:flex">
              //     {blog.featuredImage && (
              //       <div className="md:w-2/5">
              //         <div className="h-48 md:h-80 bg-gray-200">
              //           <img
              //             src={blog.featuredImage}
              //             alt={blog.title}
              //             className="w-full h-full object-cover"
              //           />
              //         </div>
              //       </div>
              //     )}
              //     <div
              //       className={`p-6 ${
              //         blog.featuredImage ? "md:w-2/3" : "w-full"
              //       }`}
              //     >
              //       <div className="flex items-center mb-3">
              //         {blog.featured && (
              //           <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
              //             Featured
              //           </span>
              //         )}
              //         {blog.categories.length > 0 && (
              //           <div className="flex flex-wrap gap-2">
              //             {blog.categories
              //               .slice(0, 2)
              //               .map((category, index) => (
              //                 <span
              //                   key={index}
              //                   className="bg-creamey text-lovely/90 text-xs font-medium px-2.5 py-0.5 rounded"
              //                 >
              //                   {category}
              //                 </span>
              //               ))}
              //           </div>
              //         )}
              //       </div>

              //       <h2
              //         className={`${thirdFont.className} text-2xl md:text-4xl tracking-normal font-bold text-creamey mb-3`}
              //       >
              //         {blog.title}
              //       </h2>

              //       <p className="text-creamey/90 mb-4 leading-relaxed">
              //         {truncateText(stripHtml(blog.excerpt), 200)}
              //       </p>

              //       {blog.tags.length > 0 && (
              //         <div className="flex flex-wrap gap-2 mb-4">
              //           {blog.tags.slice(0, 4).map((tag, index) => (
              //             <span
              //               key={index}
              //               className="bg-creamey text-everGreen text-xs px-2 py-1 rounded"
              //             >
              //               #{tag}
              //             </span>
              //           ))}
              //         </div>
              //       )}

              //       <div className="flex items-center justify-between text-sm text-creamey/90">
              //         <div className="flex items-center space-x-4">
              //           {/* <div className="flex items-center">
              //             {blog.author.imageURL && (
              //               <img
              //                 src={blog.author.imageURL}
              //                 alt={blog.author.username}
              //                 className="w-6 h-6 rounded-full mr-2"
              //               />
              //             )}
              //             <span>
              //               {blog.author.firstName && blog.author.lastName
              //                 ? `${blog.author.firstName} ${blog.author.lastName}`
              //                 : blog.author.username}
              //             </span>
              //           </div> */}
              //           <span>•</span>
              //           <span>
              //             {formatDate(blog.publishedAt || blog.createdAt)}
              //           </span>
              //           <span>•</span>
              //           <span>{blog.readingTime} min read</span>
              //         </div>
              //         <div className="flex items-center">
              //           <span>{blog.viewCount} views</span>
              //         </div>
              //       </div>
              //     </div>
              //   </Link>
              // </article>
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

        {/* Pagination */}
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
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
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

export default BlogListPage;
