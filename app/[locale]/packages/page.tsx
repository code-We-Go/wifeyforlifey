"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import PackageCard from "@/components/shop/PackageCard";

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Ipackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/packages?all=true");
        const data = await response.json();
        setPackages(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1
          className={`${thirdFont.className} text-4xl font-bold text-lovely mb-4`}
        >
          Our Packages
        </h1>
        <p className="text-lovely/80 max-w-2xl mx-auto">
          Discover our carefully curated packages designed to provide you with
          the best experience. Each package includes a selection of premium
          products and services.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lovely mx-auto"></div>
          <p className="mt-4 text-lovely/90">Loading packages...</p>
        </div>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages
            .filter((pkg) => pkg.active)
            .map((pkg) => (
              <PackageCard key={pkg._id} packageItem={pkg} />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-lovely/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-lovely mb-2">
            No Packages Available
          </h2>
          <p className="text-lovely/70">
            We&apos;re currently updating our packages. Please check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
