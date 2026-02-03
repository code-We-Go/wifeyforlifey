import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    subcategories: any[];
  };
  onClick: () => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-creamey border-2 border-lovely/20 hover:border-lovely flex flex-col justify-start transition-all duration-300 hover:shadow-lg text-left w-full"
    >
      {/* Image Section */}
      {category.image && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-bold text-lovely   group-hover:text-lovely/90 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-lovely/70 line-clamp-2 ">
                {category.description}
              </p>
            )}
            <p className="text-sm text-lovely/60">
              {category.subcategories.length} subcategories
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-lovely/40 group-hover:text-lovely group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
        </div>
      </div>
    </button>
  );
}
