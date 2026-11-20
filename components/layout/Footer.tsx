"use client";
import { Link } from "@/i18n/routing";
import { Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { thirdFont } from "@/fonts";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "@/hooks/use-toast";
import { bgRedButton } from "@/app/constants";

export default function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playlists, setPlaylists] = useState<{ _id: string; title: string }[]>(
    []
  );
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [shopCategories, setShopCategories] = useState<
    { _id: string; name: string }[]
  >([]);
  const [shopCategoriesLoading, setShopCategoriesLoading] = useState(false);
  const [shopCategoriesError, setShopCategoriesError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setPlaylistsLoading(true);
    setPlaylistsError(null);
    fetch(`/api/playlists?all=true&locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setPlaylists(
            data.data.map((p: any) => ({
              _id: p._id,
              title:
                locale === "ar" && p.translations?.ar?.title
                  ? p.translations.ar.title
                  : p.title,
            }))
          );
        } else {
          setPlaylists([]);
        }
      })
      .catch(() => setPlaylistsError("Failed to load playlists."))
      .finally(() => setPlaylistsLoading(false));
  }, [locale]);

  useEffect(() => {
    setShopCategoriesLoading(true);
    setShopCategoriesError(null);
    fetch(`/api/categories?type=product&locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShopCategories(
            data
              .slice(0, 5)
              .map((cat: any) => ({ _id: cat._id, name: cat.name || cat.categoryName }))
          );
        } else {
          setShopCategories([]);
        }
      })
      .catch(() => setShopCategoriesError("Failed to load categories."))
      .finally(() => setShopCategoriesLoading(false));
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newSletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setEmail("");
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
  const PLAYLISTS_PLACEHOLDER = [
    { _id: "686007d8bacf36b32ede9531", title: locale === "ar" ? "أزياء وملابس" : "Fashion" },
    { _id: "68600bc2dfe9d20434366bf8", title: locale === "ar" ? "ديكور" : "Decor" },
    { _id: "6860103c49b3ce972cede653", title: locale === "ar" ? "العناية الشخصية" : "Self care" },
    { _id: "6860137de6f2df88e5805d69", title: locale === "ar" ? "المشتريات الغذائية" : "Groceries" },
    { _id: "68601688c9d854f63af8a403", title: locale === "ar" ? "مستلزمات الحمام" : "Toilet Essentials " },
    { _id: "686617235a1506075be76c41", title: locale === "ar" ? "ميك آب" : "Makeup" },
    { _id: "686617935a1506075be76c45", title: locale === "ar" ? "المفروشات" : "Bedding" },
    { _id: "686617c05a1506075be76c4a", title: locale === "ar" ? "المطبخ والسفرة" : "Dinning & Kitchen" },
    { _id: "686617ef5a1506075be76c4e", title: locale === "ar" ? "الأجهزة الكهربائية" : "Appliances" },
    { _id: "6866181ed57c8789806a6914", title: locale === "ar" ? "الأثاث" : "Furniture" },
    { _id: "68661a16d57c8789806a691a", title: locale === "ar" ? "قابلي بيستي العرايس!" : "Meet your bridal era bestie!" },
    { _id: "68661ac05a1506075be76c73", title: locale === "ar" ? "تخرجي من التجربة!" : "Experience graduation! " },
  ];
  return (
    <footer className="bg-card border-t bg-lovely text-creamey">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3
              className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl  font-semibold`}
            >
              {t("brandSlogan")}
            </h3>
            <div className="justify-start text-start text-sm">
              <p>
                {t("brandBio1")}
              </p>
              <p className="mt-2">
                {t("brandBio2")}
              </p>
            </div>

            <div className="flex gap-4">
              {/* Instagram Button */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Instagram"
                asChild
              >
                <a
                  href="https://www.instagram.com/wifeyforlifey.community?igsh=MjFhNm1seGExd3A%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
              </Button>

              {/* Facebook Button */}
              <Button variant="ghost" size="icon" aria-label="Facebook" asChild>
                <a
                  href="https://www.facebook.com/share/19Sxh9rdt2/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook className="h-5 w-5" />
                </a>
              </Button>

              {/* TikTok Button */}
              <Button variant="ghost" size="icon" aria-label="TikTok" asChild>
                <a
                  href="https://www.tiktok.com/@wifey.for.lifey.c?_t=ZS-8wqV9Z4AVPk&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTiktok className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h6
              className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}
            >
              {t("shop")}
            </h6>
            <ul className="space-y-2">
              {shopCategoriesLoading && (
                <li className="text-sm text-creamey">{tCommon("loading")}</li>
              )}
              {shopCategoriesError && (
                <li className="text-sm text-red-500">{shopCategoriesError}</li>
              )}
              {/* {!shopCategoriesLoading && !shopCategoriesError && shopCategories.length === 0 && (
                <li className="text-sm text-creamey">No categories found.</li>
              )} */}
              {shopCategories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/shop?category=${cat._id}`}
                    className=" hover:cursor-pointer hover:underline transition duration-500 text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6
              className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}
            >
              {t("playlists")}
            </h6>
            <ul className="space-y-2">
              {playlistsLoading && (
                <>
                  {PLAYLISTS_PLACEHOLDER.map((playlist) => (
                    <li key={playlist._id} className="text-sm text-creamey  ">
                      {playlist.title}
                    </li>
                  ))}
                </>
              )}
              {playlistsError && (
                <li className="text-sm text-red-500">{playlistsError}</li>
              )}
              {!playlistsLoading &&
                !playlistsError &&
                playlists.length === 0 && (
                  <li className="text-sm text-creamey">No playlists found.</li>
                )}
              {playlists.map((playlist) => (
                <li key={playlist._id}>
                  <Link
                    href={`/playlists/${playlist._id}`}
                    className=" hover:cursor-pointer hover:underline transition duration-500 text-sm"
                  >
                    {playlist.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6
              className={`${thirdFont.className} tracking-normal text-xl lg:text-2xl font-medium mb-4`}
            >
              {t("newsletterTitle")}
            </h6>
            <p className=" text-sm mb-4">
              {t("newsletterSubtitle")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center">
                <Input
                  value={email}
                  type="email"
                  placeholder={t("newsletterPlaceholder")}
                  className="rounded-e-none lowercase text-lovely placeholder:text-lovely/80 bg-creamey border-e py-5 border-lovely"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  className={`${bgRedButton} rounded-s-none border-s-0`}
                >
                  {t("newsletterButton")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm ">
          <p>
            &copy; {new Date().getFullYear()} Wifey For Lifey. {tCommon("allRightsReserved")}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 flex-wrap">
            <Link
              href="/policies?privacy-policy"
              className="hover:text-foreground"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="/policies?terms-and-conditions"
              className="hover:text-foreground"
            >
              {t("termsOfService")}
            </Link>
            <Link
              href="/policies?return-and-exchange"
              className="hover:text-foreground"
            >
              {t("returnExchange")}
            </Link>
            <Link href="/vendors/join" className="hover:text-foreground font-medium underline-offset-4 hover:underline">
              {t("joinAsVendor")}
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              {t("contactUs")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
