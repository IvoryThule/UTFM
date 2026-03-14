"use client";

import { Flame, Medal, TrendingUp, Trophy, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import RestaurantCard from "@/components/business/restaurantCard";
import { useHomeData } from "@/hooks/useHomeData";
import { useLocation } from "@/hooks/useLocation";
import { cn } from "@/lib/utils";

type RankingType = "hot" | "value" | "new";

export default function RankingsPage() {
  const [type, setType] = useState<RankingType>("hot");
  const { location } = useLocation();
  const { nearbyRestaurants, loading } = useHomeData(location);

  const list = useMemo(() => {
    // If no real data yet, return empty (loading state handles UI)
    if (!nearbyRestaurants) return [];
    
    let data = [...nearbyRestaurants];
    
    // Sort logic
    if (type === "value") {
      // Logic: Lower price is better
      data = data.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (type === "new") {
       // Mock logic for "new"
       data = data.reverse(); 
    } else {
      // Hot: High rating
      data = data.sort((a, b) => b.rating - a.rating);
    }
    return data.slice(0, 50);
  }, [type, nearbyRestaurants]);

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                美食榜单
            </h1>
             <span className="text-xs text-gray-400">
                {loading ? "更新中..." : `共 ${nearbyRestaurants.length} 上榜`}
            </span>
        </div>
        
        <div className="mt-3 flex gap-2 p-1 bg-gray-100 rounded-xl">
           <button 
                onClick={() => setType("hot")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all",
                    type === "hot" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <Flame size={14} className={cn(type === "hot" && "fill-orange-600")} />
               好评榜
           </button>
           <button 
                onClick={() => setType("value")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    type === "value" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <Wallet size={14} className={cn(type === "value" && "fill-orange-600")} />
               性价比
           </button>
           <button 
                onClick={() => setType("new")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    type === "new" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <TrendingUp size={14} />
               必吃榜
           </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {loading && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-xs">正在计算排名...</p>
             </div>
        )}

        {/* Top 3 */}
        {!loading && top3.length > 0 && (
            <div className="space-y-4">
                 {top3.map((item, index) => (
                     <Link key={item.id} href={`/restaurant/${item.id}`} className="block relative group transition-transform hover:scale-[1.01]">
                        <div className="absolute -left-1 -top-3 z-30 filter drop-shadow-md">
                            {index === 0 && <Medal className="w-8 h-8 text-yellow-500 fill-yellow-100" />}
                            {index === 1 && <Medal className="w-8 h-8 text-slate-400 fill-slate-100" />}
                            {index === 2 && <Medal className="w-8 h-8 text-orange-400 fill-orange-100" />}
                        </div>
                        
                        <RestaurantCard 
                            restaurant={item} 
                            universityId="current"
                            className={cn(
                                "border-2 relative z-0 pointer-events-none",
                                index === 0 ? "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 border-yellow-400/30 shadow-yellow-100" :
                                index === 1 ? "bg-gradient-to-br from-slate-50 via-white to-slate-50/50 border-slate-300/30 shadow-slate-100" :
                                "bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-orange-300/30 shadow-orange-100"
                            )} 
                        />
                     </Link>
                 ))}
            </div>
        )}

        {/* Rest List */}
        {!loading && rest.length > 0 && (
            <div className="space-y-3 pt-2">
                 <h2 className="text-sm font-bold text-gray-900">第 4 - {list.length} 名</h2>
                 {rest.map((item, index) => (
                     <Link key={item.id} href={`/restaurant/${item.id}`} className="block flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 items-center">
                        <span className="font-bold text-lg text-gray-300 font-mono w-6 text-center">{index + 4}</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="text-orange-600 font-bold">{item.rating}分</span>
                                <span>¥{item.avgPrice}/人</span>
                                <span className="ml-auto">{item.category}</span>
                            </div>
                        </div>
                     </Link>
                 ))}
            </div>
        )}
      </div>
    </div>
  );
}
