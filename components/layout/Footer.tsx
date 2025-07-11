'use client'
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { thirdFont } from "@/fonts";
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { bgRedButton } from "@/app/constants";


export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playlists, setPlaylists] = useState<{ _id: string, title: string }[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [shopCategories, setShopCategories] = useState<{ _id: string, name: string }[]>([]);
  const [shopCategoriesLoading, setShopCategoriesLoading] = useState(false);
  const [shopCategoriesError, setShopCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    setPlaylistsLoading(true);
    setPlaylistsError(null);
    fetch("/api/playlists?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setPlaylists(data.data.map((p: any) => ({ _id: p._id, title: p.title })));
        } else {
          setPlaylists([]);
        }
      })
      .catch(() => setPlaylistsError("Failed to load playlists."))
      .finally(() => setPlaylistsLoading(false));
  }, []);

  useEffect(() => {
    setShopCategoriesLoading(true);
    setShopCategoriesError(null);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShopCategories(data.slice(0, 5).map((cat: any) => ({ _id: cat._id, name: cat.name })));
        } else {
          setShopCategories([]);
        }
      })
      .catch(() => setShopCategoriesError("Failed to load categories."))
      .finally(() => setShopCategoriesLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newSletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, // Using email as number since the model expects a number field
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter.",
          variant: "added",
        });
        setEmail('');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="bg-card border-t bg-lovely text-creamey">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3
              className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl  font-semibold`}
            >
              Wifey for Lifey – Your Bridal Era Bestie
            </h3>
           <div className="justify-start text-start text-sm"  >

            <p >
              Wifey for Lifey isn’t just a brand — it’s a full support system
              designed to guide brides through every step of their wedding and
              home-prep journey. 
            </p>
            <p>
              From engagement to honeymoon, we empower brides
              with tools, content, and emotional support to help them feel calm,
              confident, and in control.
            </p>
           </div>
 
<div className="flex space-x-4">
  {/* Instagram Button */}
  <Button variant="ghost" size="icon" aria-label="Instagram" asChild>
    <a href="https://www.instagram.com/wifeyforlifey.community?igsh=MjFhNm1seGExd3A%3D&utm_source=qr" 
       target="_blank" 
       rel="noopener noreferrer">
      <FaInstagram className="h-5 w-5" />
    </a>
  </Button>
  
  {/* Facebook Button */}
  <Button variant="ghost" size="icon" aria-label="Facebook" asChild>
    <a href="https://www.facebook.com/share/19Sxh9rdt2/?mibextid=wwXIfr" 
       target="_blank" 
       rel="noopener noreferrer">
      <FaFacebook className="h-5 w-5" />
    </a>
  </Button>
  
  {/* TikTok Button */}
  <Button variant="ghost" size="icon" aria-label="TikTok" asChild>
    <a href="https://www.tiktok.com/@wifey.for.lifey.c?_t=ZS-8wqV9Z4AVPk&_r=1" 
       target="_blank" 
       rel="noopener noreferrer">
      <FaTiktok className="h-5 w-5" />
    </a>
  </Button>
</div>
          </div>

          <div>
            <h6 className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}>Shop</h6>
            <ul className="space-y-2">
              {shopCategoriesLoading && (
                <li className="text-sm text-muted-foreground">Loading...</li>
              )}
              {shopCategoriesError && (
                <li className="text-sm text-red-500">{shopCategoriesError}</li>
              )}
              {!shopCategoriesLoading && !shopCategoriesError && shopCategories.length === 0 && (
                <li className="text-sm text-muted-foreground">No categories found.</li>
              )}
              {shopCategories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/shop?category=${cat._id}`}
                    className=" hover:text-foreground text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}>Playlists</h6>
            <ul className="space-y-2">
              {playlistsLoading && (
                <li className="text-sm text-muted-foreground">Loading...</li>
              )}
              {playlistsError && (
                <li className="text-sm text-red-500">{playlistsError}</li>
              )}
              {!playlistsLoading && !playlistsError && playlists.length === 0 && (
                <li className="text-sm text-muted-foreground">No playlists found.</li>
              )}
              {playlists.slice(0, 5).map((playlist) => (
                <li key={playlist._id}>
                  <Link
                    href={`/playlists/${playlist._id}`}
                    className=" hover:text-foreground text-sm"
                  >
                    {playlist.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}>Subscribe to our Newsletter</h6>
            <p className=" text-sm mb-4">
              Get the latest updates, sales, and exclusive content straight to
              your inbox.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center">
                <Input
                  value={email}
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none bg-creamey border-r py-5 border-lovely"
                  onChange={(e)=>setEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  className={`${bgRedButton} rounded-l-none border-l-0`}
                >
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm ">
          <p>
            &copy; {new Date().getFullYear()} Wifey For Lifey. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/policies?privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/policies?terms-and-conditions" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/policies?return-and-exchange" className="hover:text-foreground">
              Return & Exchange
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
