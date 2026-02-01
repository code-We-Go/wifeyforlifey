"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { thirdFont } from "@/fonts";
import ProductCardSkeleton from "../skeletons/ProductCardSkeleton";
import axios from "axios";
import { Blog } from "@/app/blogs/page";
import { headerStyle } from "@/app/styles/style";

const FeaturedBlogs = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const fetchFeaturedBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/blogs?status=published&featured=true&all=true"
      );
      setFeaturedBlogs(response.data.data.slice(0, 3)); // Show top 3 featured blogs
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  return (
    <section className="  bg-creamey ">
      {/* <div className='inset-0 bg-black/10 backdrop-blur-[4px]'> */}
      <div className="py-16 container-custom ">
        <div className="flex flex-col items-start md:flex-row justify-between md:items-center mb-12">
          <div>
            <h2
              className={`${thirdFont.className} ${headerStyle} text-lovely mb-2`}
            >
              Featured Blogs
            </h2>
            {/* <p className="text-creamey text">
                Discover our handpicked selection of trending items
              </p> */}
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden md:flex items-center hover:bg-everGreen hover:text-creamey border-0 bg-lovely text-creamey  mt-4 md:mt-0"
          >
            <Link href="/shop">
              View All <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          // Your actual ProductCard grid
          <div className="grid w-full grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
        )}
        <div className="flex justify-center w-full">
          <Button
            asChild
            variant="outline"
            className="flex md:hidden w-fit items-center hover:bg-everGreen hover:text-creamey border-0 bg-lovely text-creamey  mt-4 md:mt-0"
          >
            <Link href="/shop">
              View All <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {/* </div> */}
      </div>
    </section>
  );
};

export default FeaturedBlogs;
