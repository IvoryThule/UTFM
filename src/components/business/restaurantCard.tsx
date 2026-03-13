import { Clock, Star, Users, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  universityId: string;
  className?: string;
}

function getWalkMinutes(restaurant: Restaurant, universityId: string): number {
  return restaurant.distances.find((item) => item.universityId === universityId)?.walkMinutes ?? 20;
}

export default function RestaurantCard({ restaurant, universityId, className }: RestaurantCardProps) {
  const walkMinutes = getWalkMinutes(restaurant, universityId);

  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className={cn(
        "group flex gap-3 rounded-xl bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md border border-gray-100 hover:border-orange-200 active:scale-[0.99]",
        className
      )}
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {restaurant.coverImage ? (
           <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" />
        ) : (
           <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400">
              <Utensils size={20} className="mb-1 opacity-50" />
              <span className="text-[10px] scale-90">暂无图片</span>
           </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5 h-24 justify-between">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs">
            <div className="flex items-center font-bold text-orange-500">
               <Star className="mr-0.5 h-3 w-3 fill-current" />
               {restaurant.rating.toFixed(1)}
            </div>
            <span className="h-3 w-[1px] bg-gray-200"></span>
            <span className="font-DIN text-lg font-bold text-red-500 leading-none">¥{restaurant.avgPrice}</span>
            <span className="h-3 w-[1px] bg-gray-200"></span>
            <div className="flex items-center text-gray-400">
              <Clock className="mr-0.5 h-3 w-3" />
              {walkMinutes}min
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
             <div className="flex flex-wrap gap-1.5">
               {restaurant.tags.slice(0, 3).map(tag => (
                   <span key={tag} className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 border border-gray-100">
                     {tag}
                   </span>
               ))}
            </div>

            <div className="flex items-center text-[10px] text-gray-400 mt-auto">
               <Users size={12} className="mr-1" />
               <span className="text-gray-500 font-medium">{restaurant.studentCount}</span>
               <span className="text-gray-400 ml-0.5">位同学推荐</span>
            </div>
        </div>
      </div>
    </Link>
  );
}
