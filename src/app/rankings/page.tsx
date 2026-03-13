"use client";

import { Flame, Medal, Tag, TrendingUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import RestaurantCard from "@/components/business/restaurantCard";
import { restaurants } from "@/data/restaurants";
import { cn } from "@/lib/utils";

type RankingType = "hot" | "value" | "new";

const RankingBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="absolute top-0 right-0 bg-yellow-500 text-white rounded-bl-xl rounded-tr-xl px-3 py-1 text-xs font-bold shadow-sm z-10 font-DIN">TOP 1</div>;
  if (rank === 2) return <div className="absolute top-0 right-0 bg-slate-400 text-white rounded-bl-xl rounded-tr-xl px-3 py-1 text-xs font-bold shadow-sm z-10 font-DIN">TOP 2</div>;
  if (rank === 3) return <div className="absolute top-0 right-0 bg-orange-400 text-white rounded-bl-xl rounded-tr-xl px-3 py-1 text-xs font-bold shadow-sm z-10 font-DIN">TOP 3</div>;
  return null;
};

export default function RankingsPage() {
  const [type, setType] = useState<RankingType>("hot");

  const list = useMemo(() => {
    let data = [...restaurants];
    if (type === "value") {
      data = data.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (type === "new") {
       data = data.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      data = data.sort((a, b) => b.studentCount - a.studentCount);
    }
    return data.slice(0, 50);
  }, [type]);

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                美食榜单
            </h1>
        </div>
        
        <div className="mt-4 flex gap-2 p-1 bg-gray-100 rounded-xl">
           <button 
                onClick={() => setType("hot")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                    type === "hot" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <Flame size={14} className={cn(type === "hot" && "fill-orange-600")} />
               热门榜
           </button>
           <button 
                onClick={() => setType("value")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                    type === "value" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <Tag size={14} className={cn(type === "value" && "fill-orange-600")} />
               性价比
           </button>
           <button 
                onClick={() => setType("new")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                    type === "new" ? "bg-white text-orange-600 shadow-sm scale-105" : "text-gray-500 hover:text-gray-900"
                )}
           >
               <TrendingUp size={14} />
               新店榜
           </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Top 3 */}
        <div className="space-y-4">
             {top3.map((item, index) => (
                 <div key={item.id} className="relative group transition-transform hover:scale-[1.02]">
                    <div className="absolute -left-1 -top-3 z-30 filter drop-shadow-md transition-transform group-hover:scale-110">
                        {index === 0 && <Medal className="w-10 h-10 text-yellow-500 fill-yellow-100" />}
                        {index === 1 && <Medal className="w-10 h-10 text-slate-400 fill-slate-100" />}
                        {index === 2 && <Medal className="w-10 h-10 text-orange-400 fill-orange-100" />}
                    </div>
                    
                    <RankingBadge rank={index + 1} />
                    
                    <RestaurantCard 
                        restaurant={item} 
                        universityId="pku" 
                        className={cn(
                            "border-2 relative z-0",
                            index === 0 ? "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 border-yellow-400/30 shadow-yellow-100" :
                            index === 1 ? "bg-gradient-to-br from-slate-50 via-white to-slate-50/50 border-slate-300/30 shadow-slate-100" :
                            "bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-orange-300/30 shadow-orange-100"
                        )}
                    />
                 </div>
             ))}
        </div>

        {/* Rest of list */}
        <div className="space-y-2">
             {rest.map((item, index) => (
                 <div key={item.id} className="flex gap-2 items-center group">
                    <div className="flex flex-col items-center justify-center w-8 shrink-0">
                        <span className="text-xl font-bold font-DIN text-gray-300 italic group-hover:text-orange-400 transition-colors">{index + 4}</span>
                    </div>
                    <div className="flex-1">
                        <RestaurantCard restaurant={item} universityId="pku" />
                    </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
}
