"use client";

import { Bot, ChevronDown, Heart, Home, MapPin, Moon, Search, Sparkles, User, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import RestaurantCard from "@/components/business/restaurantCard";
import { sceneOptions } from "@/data/categories";
import { restaurants } from "@/data/restaurants";
import { universities } from "@/data/universities";
import { cn } from "@/lib/utils";

const SCENE_ICONS: Record<string, any> = {
  solo: User,
  date: Heart,
  group: Users,
  "late-night": Moon,
  budget: Wallet,
};

export default function HomePage() {
  const [universityId, setUniversityId] = useState("pku");
  const [scene, setScene] = useState<string>("all");

  const list = useMemo(() => {
    let filtered = restaurants;
    if (scene !== "all") {
      filtered = filtered.filter((item) => item.scenes.includes(scene as never));
    }
    return filtered.slice().sort((a, b) => b.studentCount - a.studentCount).slice(0, 50);
  }, [scene]);

  const currentUniversity = universities.find(u => u.id === universityId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-1 min-w-[100px] z-20">
            <MapPin className="h-5 w-5 text-gray-900" />
            <span className="font-bold text-gray-900 text-lg truncate max-w-[120px]">
                {currentUniversity?.name || "选择高校"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
            
            <select
               value={universityId}
               onChange={(event) => setUniversityId(event.target.value)}
               className="absolute inset-0 opacity-0 cursor-pointer"
            >
               {universities.map((item) => (
                   <option key={item.id} value={item.id}>{item.name}</option>
               ))}
            </select>
          </div>

          <div className="flex-1 relative z-10">
             <div className="flex items-center h-9 w-full rounded-full bg-gray-100 px-3 text-gray-400 group hover:bg-gray-200/50 transition-colors cursor-text">
                <Search className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">搜餐厅/菜品 (Demo)</span>
             </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* AI Entry Card */}
        <Link href="/ai-pick" className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 shadow-lg shadow-orange-200 transition-transform active:scale-[0.98]">
             {/* Mesh gradient simulation */}
             <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-r from-yellow-300/30 to-orange-400/30 blur-3xl animate-pulse"></div>
             
             <div className="relative z-10 flex p-5 items-center justify-between">
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md tracking-tight">
                        今天吃什么？
                        <Sparkles className="h-6 w-6 text-yellow-200 animate-pulse" />
                    </h2>
                    <p className="text-sm text-white/90 font-medium opacity-90">AI帮你30秒搞定选择困难症</p>
                    
                    <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/30 transition-colors">
                        <span>帮我选</span>
                        <ChevronDown className="ml-1 h-4 w-4 rotate-[-90deg]" />
                    </div>
                </div>
                
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    {/* Placeholder for 3D Robot - using a Lucide icon with effects */}
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                    <Bot size={64} className="relative z-10 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] transform -rotate-12 hover:rotate-0 transition-transform duration-500" />
                </div>
             </div>
        </Link>
        
        {/* Scene Entry */}
        <section>
            <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-base font-bold text-gray-900">场景入口</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-y-4">
                 <button
                    onClick={() => setScene("all")}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm",
                         scene === "all" ? "bg-gray-900 text-white shadow-gray-200 scale-110" : "bg-white text-gray-600 border border-gray-100 group-hover:bg-gray-50"
                    )}>
                       <Home size={20} />
                    </div>
                    <span className={cn("text-xs transition-colors", scene === "all" ? "font-bold text-gray-900" : "text-gray-500")}>全部</span>
                </button>
                
                {sceneOptions.map((item) => {
                    const Icon = SCENE_ICONS[item.id] || User;
                    const isActive = scene === item.id;
                    const colors: Record<string, string> = {
                        solo: "bg-orange-50 text-orange-500 group-hover:bg-orange-100",
                        date: "bg-pink-50 text-pink-500 group-hover:bg-pink-100",
                        group: "bg-blue-50 text-blue-500 group-hover:bg-blue-100",
                        "late-night": "bg-purple-50 text-purple-500 group-hover:bg-purple-100",
                        budget: "bg-green-50 text-green-500 group-hover:bg-green-100"
                    };
                    const activeColors: Record<string, string> = {
                        solo: "bg-orange-500 text-white shadow-orange-200",
                        date: "bg-pink-500 text-white shadow-pink-200",
                        group: "bg-blue-500 text-white shadow-blue-200",
                        "late-night": "bg-purple-500 text-white shadow-purple-200",
                        budget: "bg-green-500 text-white shadow-green-200"
                    };
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => setScene(item.id)}
                            className="flex flex-col items-center gap-2 group"
                        >
                             <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm",
                                isActive 
                                    ? cn(activeColors[item.id] || "bg-gray-900 text-white", "scale-110 shadow-lg") 
                                    : cn(colors[item.id] || "bg-gray-50 text-gray-500", "border border-transparent group-hover:scale-105")
                            )}>
                               <Icon size={20} />
                            </div>
                            <span className={cn("text-xs transition-colors", isActive ? "font-bold text-gray-900" : "text-gray-500")}>{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </section>

        {/* Feed */}
        <section className="space-y-3">
             <div className="flex items-center justify-between px-1 pt-2">
                <h3 className="text-base font-bold text-gray-900">猜你喜欢</h3>
             </div>
             
             {list.map((item) => (
                <RestaurantCard key={item.id} restaurant={item} universityId={universityId} />
            ))}
            
            {list.length === 0 && (
                <div className="py-10 text-center text-gray-400">
                    <p>没有找到相关餐厅</p>
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
