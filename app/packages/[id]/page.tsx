"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import PackageDetailSkeleton from "./PackageDetailSkeleton";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [packageData, setPackageData] = useState<Ipackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/packages?packageID=${params.id}`
        );
        setPackageData(response.data.data);
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPackageData();
    }
  }, [params.id]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!packageData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-lovely">Package not found</h2>
          <p className="mt-4 text-lovely/90">
            The package you are looking for does not exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/shop")}
            className="mt-6 bg-lovely text-creamey hover:bg-lovely/90"
          >
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-lovely hover:text-lovely/80 hover:bg-transparent p-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Package Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-lovely">
          <Image
            src={packageData.imgUrl}
            alt={packageData.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Package Details */}
        <div>
          <h1
            className={`${thirdFont.className} text-3xl font-bold text-lovely mb-2`}
          >
            {packageData.name}
          </h1>
          <p className="text-lg font-medium text-lovely mb-4">
            Duration: {packageData.duration}
          </p>
          <p className="text-2xl font-bold text-lovely mb-6">
            LE {packageData.price.toFixed(2)}
          </p>

          <Separator className="my-6" />

          {/* Package Items */}
          <div className="mb-6">
            <h2
              className={`${thirdFont.className} text-xl font-semibold text-lovely mb-4`}
            >
              What&apos;s Included
            </h2>
            <ul className="space-y-2">
              {packageData.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  {/* <Package className="h-5 w-5 text-lovely mr-2 flex-shrink-0 mt-0.5" /> */}
                  <span className="text-lovely">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          {packageData.notes && packageData.notes.length > 0 && (
            <div className="mb-6">
              <h2
                className={`${thirdFont.className} text-xl font-semibold text-lovely mb-4`}
              >
                Notes
              </h2>
              <ul className="space-y-2">
                {packageData.notes.map((note, index) => (
                  <li key={index} className="text-lovely/90 text-sm">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="w-full mt-6 bg-lovely text-creamey hover:bg-lovely/90 rounded-full py-6"
            onClick={() => router.push(`/subscription/${packageData._id}`)}
          >
            Subscribe to {packageData.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
