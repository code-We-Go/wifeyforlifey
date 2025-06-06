import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { thirdFont } from "@/fonts";
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';


export default function Footer() {
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
            <p className=" text-sm">
              Wifey for Lifey isn’t just a brand — it’s a full support system
              designed to guide brides through every step of their wedding and
              home-prep journey. From engagement to honeymoon, we empower brides
              with tools, content, and emotional support to help them feel calm,
              confident, and in control.
            </p>
 
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
              <li>
                <Link
                  href="/shop?category=clothing"
                  className=" hover:text-foreground text-sm"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=accessories"
                  className=" hover:text-foreground text-sm"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=home"
                  className=" hover:text-foreground text-sm"
                >
                  Home Decor
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=bath"
                  className=" hover:text-foreground text-sm"
                >
                  Bath & Body
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=stationery"
                  className=" hover:text-foreground text-sm"
                >
                  Stationery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}>Playlists</h6>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/playlists?category=tutorials"
                  className=" hover:text-foreground text-sm"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists?category=lifestyle"
                  className=" hover:text-foreground text-sm"
                >
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists?category=fashion"
                  className=" hover:text-foreground text-sm"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists?category=beauty"
                  className=" hover:text-foreground text-sm"
                >
                  Beauty
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists?category=fitness"
                  className=" hover:text-foreground text-sm"
                >
                  Fitness
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="font-medium mb-4">Subscribe to our Newsletter</h6>
            <p className=" text-sm mb-4">
              Get the latest updates, sales, and exclusive content straight to
              your inbox.
            </p>
            <form className="space-y-2">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none"
                />
                <Button
                  type="submit"
                  className="bg-pinkey text-lovely rounded-l-none"
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
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
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
