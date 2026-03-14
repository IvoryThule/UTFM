"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Utensils, Store, Play, Plus, Trash2, Settings2, X, RefreshCw } from "lucide-react";

// Default entries if local storage is empty
const DEFAULT_FOOD_ENTRIES = ["盖饭", "面馆", "米线", "炒菜", "火锅", "烤肉", "日料", "轻食", "汉堡", "麻辣烫"];

interface RandomPickerProps {
    className?: string;
    nearbyRestaurants?: { name: string }[];
}

export default function RandomPicker({ className, nearbyRestaurants = [] }: RandomPickerProps) {
    const [mode, setMode] = useState<"food" | "restaurant">("restaurant");
    
    // Data states
    const [foodEntries, setFoodEntries] = useState<string[]>(DEFAULT_FOOD_ENTRIES);
    const [restaurantEntries, setRestaurantEntries] = useState<string[]>([]);
    
    // UI states
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentText, setCurrentText] = useState("今天吃什么？");
    const [result, setResult] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newEntryInput, setNewEntryInput] = useState("");

    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize data from LocalStorage
    useEffect(() => {
        try {
            const savedFood = localStorage.getItem("picker-food-entries");
            const savedRestaurant = localStorage.getItem("picker-restaurant-entries");
            
            if (savedFood) {
                const parsed = JSON.parse(savedFood);
                if (Array.isArray(parsed) && parsed.length > 0) setFoodEntries(parsed);
            }
            
            if (savedRestaurant) {
                const parsed = JSON.parse(savedRestaurant);
                if (Array.isArray(parsed) && parsed.length > 0) setRestaurantEntries(parsed);
            }
        } catch (e) {
            console.error("Failed to load picker data", e);
        }
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem("picker-food-entries", JSON.stringify(foodEntries));
    }, [foodEntries]);

    useEffect(() => {
        localStorage.setItem("picker-restaurant-entries", JSON.stringify(restaurantEntries));
    }, [restaurantEntries]);

    // Auto-fill restaurants if empty
    useEffect(() => {
        if (restaurantEntries.length === 0 && nearbyRestaurants.length > 0) {
            // Take top 15 unique names
            const defaults = Array.from(new Set(nearbyRestaurants.map((r) => r.name))).slice(0, 15);
            if (defaults.length > 0) {
                setRestaurantEntries(defaults);
            }
        }
    }, [nearbyRestaurants, restaurantEntries.length]);

    const activeEntries = mode === "restaurant" ? restaurantEntries : foodEntries;

    const handleSpin = () => {
        if (isSpinning || activeEntries.length === 0) return;

        setIsSpinning(true);
        setResult(null);
        setIsEditOpen(false);

        let speed = 50; // Initial speed
        let counter = 0;
        const totalDuration = 2000; // Total spin time (ms)
        const startTime = Date.now();

        const spin = () => {
            const now = Date.now();
            const elapsed = now - startTime;

            // Pick a random temp item
            const randomIndex = Math.floor(Math.random() * activeEntries.length);
            setCurrentText(activeEntries[randomIndex]);

            if (elapsed < totalDuration) {
                // Determine next timeout based on elapsed time (ease-out effect)
                // Linear slow down is simple enough
                const progress = elapsed / totalDuration;
                // Speed increases (delay increases) as we approach end
                // Start at 50ms, end at ~300ms
                const nextDelay = 50 + (300 * Math.pow(progress, 2)); 
                
                spinIntervalRef.current = setTimeout(spin, nextDelay);
            } else {
                // Final pick
                const finalIndex = Math.floor(Math.random() * activeEntries.length);
                const finalPick = activeEntries[finalIndex];
                setCurrentText(finalPick);
                setResult(finalPick);
                setIsSpinning(false);
            }
        };

        spin();
    };

    // Clean up timeout
    useEffect(() => {
        return () => {
            if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
        };
    }, []);

    const handleAddEntry = () => {
        const val = newEntryInput.trim();
        if (!val) return;
        
        const setter = mode === "restaurant" ? setRestaurantEntries : setFoodEntries;
        setter(prev => {
            if (prev.includes(val)) return prev;
            return [...prev, val];
        });
        setNewEntryInput("");
    };

    const handleRemoveEntry = (item: string) => {
        const setter = mode === "restaurant" ? setRestaurantEntries : setFoodEntries;
        setter(prev => prev.filter(i => i !== item));
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden", className)}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -z-0 opacity-50" />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {isSpinning ? <RefreshCw className="animate-spin text-orange-500" size={18}/> : <span className="text-xl">🎰</span>}
                        今天吃什么？
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        {mode === "restaurant" ? `在 ${activeEntries.length} 家餐厅中随机选择` : `在 ${activeEntries.length} 种品类中随机选择`}
                    </p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => !isSpinning && setMode("restaurant")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === "restaurant" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                       <Store className="inline-block w-3 h-3 mr-1 mb-0.5" /> 餐厅
                    </button>
                    <button
                        onClick={() => !isSpinning && setMode("food")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === "food" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Utensils className="inline-block w-3 h-3 mr-1 mb-0.5" /> 品类
                    </button>
                </div>
            </div>

            {/* Main Display Area */}
            <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                    "w-full h-32 mb-6 rounded-2xl flex items-center justify-center text-center px-6 transition-all duration-300 transform",
                    isSpinning ? "bg-orange-50 scale-105 shadow-inner" : "bg-gray-50",
                    result ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg scale-100 ring-4 ring-orange-100" : ""
                )}>
                    <span className={cn(
                        "font-black tracking-wide break-words line-clamp-2",
                        currentText.length > 6 ? "text-2xl" : "text-4xl",
                        result ? "animate-bounce" : ""
                    )}>
                        {currentText}
                    </span>
                    
                    {/* Result confetti effect hint (could add real confetti later) */}
                    {result && (
                        <div className="absolute top-2 right-2 flex space-x-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                    )}
                </div>

                <div className="flex w-full gap-3">
                    <button
                        onClick={() => setIsEditOpen(!isEditOpen)}
                        className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        disabled={isSpinning}
                    >
                        {isEditOpen ? <X size={20} /> : <Settings2 size={20} />}
                    </button>
                    
                    <button
                        onClick={handleSpin}
                        disabled={isSpinning || activeEntries.length === 0}
                        className={cn(
                            "flex-1 h-12 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2",
                            isSpinning 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-gray-900 text-white hover:bg-black active:scale-[0.98] active:shadow-none"
                        )}
                    >
                        {isSpinning ? (
                            "挑选美味中..."
                        ) : (
                            <>
                                <Play fill="currentColor" size={16} />
                                {result ? "再抽一次" : "开始抽取"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Edit Panel (Expandable) */}
             <div className={cn(
                "relative z-10 overflow-hidden transition-all duration-300 ease-in-out",
                isEditOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex gap-2 mb-3">
                        <input
                            value={newEntryInput}
                            onChange={(e) => setNewEntryInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                            placeholder={`添加新的候选${mode === "restaurant" ? "餐厅" : "美食"}...`}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 bg-white"
                        />
                        <button 
                            onClick={handleAddEntry}
                            className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                        {activeEntries.map((item, idx) => (
                            <span key={`${item}-${idx}`} className="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-xs text-gray-700">
                                {item}
                                <button 
                                    onClick={() => handleRemoveEntry(item)}
                                    className="ml-1.5 text-gray-300 hover:text-red-500 p-0.5"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </span>
                        ))}
                        {activeEntries.length === 0 && (
                            <span className="text-gray-400 text-xs py-2 w-full text-center">暂无候选项目，请在上方添加</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
