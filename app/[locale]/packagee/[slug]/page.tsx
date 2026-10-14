"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";

export default function PackageeSlugRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/package/${slug}`);
    } else {
      router.replace("/package/GehazBestiePlanner");
    }
  }, [slug, router]);

  return null;
}
