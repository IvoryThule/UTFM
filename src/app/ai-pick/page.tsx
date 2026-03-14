"use client";

import { ArrowLeft, Loader2, RefreshCw, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useHomeData } from "@/hooks/useHomeData";
import { useLocation } from "@/hooks/useLocation";
import { cn } from "@/lib/utils";

const quickTags = ["人均30以内", "想吃面", "离学校近", "适合聚餐", "深夜还开门", "不辣"];

interface Recommendation {
  restaurantId: string;
  reasons: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
}

export default function AiPickPage() {
  const { location, loading: locLoading } = useLocation();
  const { nearbyRestaurants, loading: dataLoading } = useHomeData(location);
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好呀！我是你的周边美食助手。正在定位你的位置..."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync data status to chat
  useEffect(() => {
    if (locLoading) return;

    if (!location) {
        setMessages(prev => {
            if (prev.some(m => m.id === "1-loc-fail")) return prev;
            return [...prev, {
                id: "1-loc-fail",
                role: "assistant",
                content: "抱歉，无法确切定位。我将使用默认数据为你推荐。"
            }];
        });
        return;
    }

    if (!dataLoading && nearbyRestaurants.length > 0) {
        setMessages(prev => {
            if (prev.some(m => m.id === "1-ready")) return prev;
            return [...prev, {
                id: "1-ready",
                role: "assistant", 
                content: `定位成功！已为你找到附近 ${nearbyRestaurants.length} 家餐厅。告诉我你想吃什么？或者试试下面的标签👇`
            }];
        });
    }
  }, [location, locLoading, dataLoading, nearbyRestaurants.length]);

  // Handle auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history from prior user/assistant messages (for multi-turn context)
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            input: userMsg.content,
            university: "current",
            location: location,
            restaurants: nearbyRestaurants.map(r => ({
                id: r.id,
                name: r.name,
                category: r.category,
                avgPrice: r.avgPrice,
                rating: r.rating,
                distance: r.distances[0]?.distanceMeters || 0,
                tags: r.tags,
                scenes: r.scenes,
                isOpenLateNight: r.isOpenLateNight,
                mustOrderDishes: r.mustOrderDishes,
                studentCount: r.studentCount,
                studentDiscount: r.studentDiscount,
                openHours: r.openHours,
            })),
            history: history,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const recommendations: Recommendation[] = data.recommendations || [];

      // Use the agent's natural language reply
      const responseContent = data.reply || (
        recommendations.length > 0
          ? `为你推荐以下 ${recommendations.length} 家：`
          : "抱歉，附近没有完全符合条件的餐厅，建议换个说法试试？"
      );

      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        recommendations: recommendations
      };

      setMessages(prev => [...prev, responseMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "抱歉，我不小心走神了（网络错误），请再试一次~"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white px-4 py-3 shadow-sm flex items-center gap-3 z-10 border-b border-gray-100">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full transition-all active:scale-95">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
           <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
             AI 选餐助手
           </h1>
           <p className="text-[10px] text-gray-400">基于 LangChain & GLM-4 驱动</p>
        </div>
        <button 
            onClick={() => setMessages([])} 
            className="ml-auto p-2 text-gray-400 hover:text-gray-900 transition-colors"
            title="清空对话"
        >
            <RefreshCw size={18} />
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
            
            {/* Bubble */}
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === "user" 
                ? "bg-orange-500 text-white rounded-br-none" 
                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
            )}>
               {msg.content}
            </div>

            {/* Recommendations Cards */}
            {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full space-y-3 mt-1 min-w-[280px]">
                    {msg.recommendations.map((rec, idx) => {
                        const restaurant = nearbyRestaurants.find(r => r.id === rec.restaurantId);
                        if (!restaurant) return null;
                        return (
                            <Link key={idx} href={`/restaurant/${restaurant.id}`} className="block bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 line-clamp-1">{restaurant.name}</h4>
                                    <span className="text-xs font-bold text-orange-500">{restaurant.rating}分</span>
                                </div>
                                <div className="bg-orange-50 text-orange-700 text-xs px-2 py-1.5 rounded-lg mb-2 leading-tight">
                                    Why: {rec.reasons[0]}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>¥{restaurant.avgPrice}/人</span>
                                    <span>•</span>
                                    <span>{restaurant.category}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
            
            {/* Metadata */}
            <span className="text-[10px] text-gray-300 px-1">
                {msg.role === 'assistant' ? 'AI Assistant' : 'Me'}
            </span>
          </div>
        ))}
        
        {loading && (
             <div className="flex items-center gap-2 text-gray-400 text-xs ml-4 animate-pulse">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 正在思考中...
             </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white border-t border-gray-100 p-3 pb-8 safe-area-bottom">
         {/* Quick Tags */}
         {messages.length < 3 && (
             <div className="flex gap-2 overflow-x-auto mb-3 pb-1 no-scrollbar">
                 {quickTags.map(tag => (
                     <button 
                        key={tag}
                        onClick={() => handleSend(tag)}
                        className="shrink-0 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-colors"
                     >
                        {tag}
                     </button>
                 ))}
             </div>
         )}
         
         <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 ring-2 ring-transparent focus-within:ring-orange-100 focus-within:bg-white transition-all">
             <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="想吃点什么？试试 '性价比高的火锅'..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 min-w-0"
                disabled={loading}
             />
             <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={cn(
                    "p-2 rounded-full transition-all",
                    input.trim() && !loading ? "bg-orange-500 text-white shadow-md active:scale-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
             >
                 {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
             </button>
         </div>
      </div>
    </div>
  );
}
