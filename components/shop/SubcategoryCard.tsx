import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface SubcategoryCardProps {
  subcategory: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
  };
  onClick: () => void;
}

export default function SubcategoryCard({ subcategory, onClick }: SubcategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-creamey border-2 border-lovely/20 hover:border-lovely transition-all duration-300 hover:shadow-lg text-left w-full"
    >
      {/* Image Section */}
      {subcategory.image && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={subcategory.image}
            alt={subcategory.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-bold text-lovely mb-1 group-hover:text-lovely/90 transition-colors">
              {subcategory.name}
            </h3>
            {subcategory.description && (
              <p className="text-sm text-lovely/70 line-clamp-2">
                {subcategory.description}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-lovely/40 group-hover:text-lovely group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
        </div>
      </div>
    </button>
  );
}
