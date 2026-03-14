"use client";

import { ArrowRight, Bot, ChevronDown, Coffee, Heart, Map as MapIcon, MapPin, Moon, Pizza, Search, Sparkles, User, Users, Utensils, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import RandomPicker from "@/components/business/RandomPicker";
import RestaurantCard from "@/components/business/restaurantCard";
import { useHomeData } from "@/hooks/useHomeData";
import { useLocation } from "@/hooks/useLocation";
import { cn } from "@/lib/utils";

// More categories for the grid
const SCENE_ICONS = [
  { id: "all", label: "全部", icon: MapIcon, color: "bg-gray-800 text-white" },
  { id: "solo", label: "一人食", icon: User, color: "bg-orange-100 text-orange-600" },
  { id: "date", label: "约会", icon: Heart, color: "bg-pink-100 text-pink-600" },
  { id: "group", label: "聚餐", icon: Users, color: "bg-blue-100 text-blue-600" },
  { id: "late-night", label: "夜宵", icon: Moon, color: "bg-purple-100 text-purple-600" },
  { id: "budget", label: "穷鬼套餐", icon: Wallet, color: "bg-green-100 text-green-600" },
  { id: "coffee", label: "咖啡", icon: Coffee, color: "bg-amber-100 text-amber-700" },
  { id: "fast", label: "快餐", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { id: "western", label: "西餐", icon: Pizza, color: "bg-red-100 text-red-600" },
  { id: "chinese", label: "中餐", icon: Utensils, color: "bg-rose-100 text-rose-600" },
];


export default function HomePage() {
  const { location, loading: locLoading } = useLocation();
  const { nearbyRestaurants, universities, loading: dataLoading } = useHomeData(location);
  
  const [selectedUniId, setSelectedUniId] = useState("current");
  const [scene, setScene] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

    const currentUniversity = useMemo(() => {
     return universities.find(u => u.id === selectedUniId) || 
            (universities.length > 0 ? universities[0] : null);
  }, [universities, selectedUniId]);

  const displayList = useMemo(() => {
    // If we have selected a different university (that is not "current" location), ideally we should re-fetch data for THAT location.
    // For now, useHomeData fetches based on `location` prop only. 
    // To implement fully, useHomeData should accept an override location.
    // Simplifying: Filter currently loaded data.
    
    let filtered = nearbyRestaurants || [];
    
    if (scene !== "all") {
        const key = scene;
        if (key === 'solo' || key === 'fast') {
            filtered = filtered.filter(r => r.category.includes('快餐') || r.avgPrice < 30);
        } else if (key === 'budget') {
            filtered = filtered.filter(r => r.avgPrice < 25);
        } else if (key === 'coffee') {
            filtered = filtered.filter(r => r.category.includes('咖啡') || r.category.includes('饮品'));
        } else if (key === 'date') {
            filtered = filtered.filter(r => r.avgPrice > 60 || r.category.includes('西餐'));
        } else if (key === 'late-night') {
            filtered = filtered.filter(r => r.category.includes('烧烤') || r.name.includes('串'));
        } else if (key === 'western') {
             filtered = filtered.filter(r => r.category.includes('西餐') || r.category.includes('披萨') || r.name.toLowerCase().includes('pizza'));
        } else if (key === 'chinese') {
             filtered = filtered.filter(r => r.category.includes('中餐') || r.category.includes('餐饮'));
        }
    }

    if (searchText) {
        const lower = searchText.toLowerCase();
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(lower) || 
            r.category.toLowerCase().includes(lower) ||
            (lower.includes('pizza') && (r.category.includes('披萨') || r.name.includes('披萨')))
        );
    }

    return filtered;
  }, [nearbyRestaurants, scene, searchText]);


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex items-center gap-1 max-w-[40%] z-20 cursor-pointer group shrink-0">
            <MapPin className="h-5 w-5 text-orange-500 group-hover:animate-bounce shrink-0" />
            <span className="font-bold text-gray-900 text-sm truncate">
                {locLoading ? "定位中..." : (currentUniversity?.name || "当前位置")}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            
            <select
               value={selectedUniId}
               onChange={(event) => setSelectedUniId(event.target.value)}
               className="absolute inset-0 opacity-0 cursor-pointer"
               disabled={universities.length === 0}
               aria-label="选择学校"
            >
               {universities.map((item) => (
                   <option key={item.id} value={item.id}>{item.name}</option>
               ))}
               {universities.length === 0 && <option value="current">定位中...</option>}
            </select>
          </div>

          <div className="flex-1 relative z-10 min-w-0">
             <div className="flex items-center h-9 w-full rounded-full bg-gray-100 px-3 text-gray-600 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <Search className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                <input 
                    className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-400 truncate"
                    placeholder="搜美食 (Real Search)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
             </div>
          </div>
      </header>

      <div className="p-4 space-y-6">
        {/* AI Entry Card */}
        <Link href="/ai-pick" className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-lg transition-transform active:scale-[0.98] border border-gray-700 group">
             <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-orange-500/20 blur-[60px] rounded-full group-hover:bg-orange-500/30 transition-colors"></div>
             
             <div className="relative z-10 flex p-4 items-center justify-between">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">NEW</span>
                        <h2 className="text-lg font-bold text-white tracking-tight">AI 智能选餐</h2>
                    </div>
                    <p className="text-xs text-gray-300">基于 {nearbyRestaurants.length} 家周边真实商户大数据推荐</p>
                    
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-400 bg-white/10 px-2 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                        <span>点击开始对话</span>
                        <ArrowRight size={12} /> 
                    </div>
                </div>
                
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <Bot size={40} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-pulse" />
                </div>
             </div>
        </Link>


                <RandomPicker nearbyRestaurants={nearbyRestaurants} />
        
        {/* Scene Entry (Grid Layout) */}
        <section>
            <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-base font-bold text-gray-900">场景探索</h3>
            </div>
            <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                {SCENE_ICONS.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setScene(item.id)}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            scene === item.id 
                                ? "bg-gray-900 text-white shadow-lg scale-105" 
                                : "bg-white text-gray-600 border border-gray-100 shadow-sm group-hover:border-gray-300"
                        )}>
                            <item.icon size={18} strokeWidth={1.5} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium transition-colors",
                            scene === item.id ? "text-gray-900 font-bold" : "text-gray-500"
                        )}>{item.label}</span>
                    </button>
                ))}
            </div>
        </section>

        {/* Dynamic Restaurant List */}
        <section className="space-y-4">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                     {scene === 'all' ? "猜你喜欢" : "筛选结果"}
                     <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{displayList.length}</span>
                 </h3>
                 <Link href="/map" className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-900 px-2 py-1 bg-white rounded-md border border-gray-100 shadow-sm">
                     <MapIcon size={12} />
                     地图模式
                 </Link>
             </div>

             <div className="grid gap-4 min-h-[200px]">
                 {dataLoading || locLoading ? (
                     <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3 h-full">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                         <p className="text-xs animate-pulse">正在搜索周边美食...</p>
                     </div>
                 ) : displayList.length > 0 ? (
                     displayList.map(item => (
                         // Card already contains Link
                         <RestaurantCard 
                            key={item.id}
                            restaurant={item} 
                            universityId={selectedUniId}
                            className="shadow-sm border-gray-100 hover:shadow-md transition-shadow bg-white" 
                         />
                     ))
                 ) : (
                     <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                         <p>🤔 附近好像没有这类餐厅</p>
                         <button 
                             onClick={() => setScene('all')}
                             className="mt-2 text-xs text-orange-500 hover:underline"
                         >
                             查看全部
                         </button>
                     </div>
                 )}
             </div>
        </section>
      </div>
    </div>
  );
}