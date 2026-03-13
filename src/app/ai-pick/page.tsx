"use client";

import { ArrowLeft, Bot, Loader2, RefreshCw, Send, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import RestaurantCard from "@/components/business/restaurantCard";
import { restaurants } from "@/data/restaurants";
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好呀！我是你的美食助手。今天想吃点什么？告诉我你的口味、预算或者场景，我来帮你推荐~"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate API call
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const inputLower = userMsg.content.toLowerCase();
        let matched = restaurants.filter(r => 
             inputLower.includes(r.category) || 
             r.tags.some(t => inputLower.includes(t)) ||
             inputLower.includes(r.name)
        );
        
        if (inputLower.includes("便宜") || inputLower.includes("30") || inputLower.includes("穷") || inputLower.includes("少")) {
            matched = matched.filter(r => r.avgPrice <= 30);
        }
        
        if (matched.length === 0) {
            matched = restaurants.sort(() => 0.5 - Math.random()).slice(0, 3);
        } else {
             matched = matched.slice(0, 3);
        }
        
        const responseMsg: Message = {
           id: (Date.now() + 1).toString(),
           role: "assistant",
           content: `根据你的要求，我为你精选了 ${matched.length} 家餐厅：`,
           recommendations: matched.map(r => ({
               restaurantId: r.id,
               reasons: [`匹配度高`, `评分 ${r.rating}`]
           }))
        };
        
        setMessages(prev => [...prev, responseMsg]);
    } catch (e) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: "抱歉，我好像断片了，请再试一次~"
        }]);
    } finally {
        setLoading(false);
    }
  };

  const handleQuickTag = (tag: string) => {
      setInput(tag);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-[60px]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-none border-b border-gray-100 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                 <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
                 <div className="bg-gradient-to-tr from-orange-400 to-rose-500 p-1.5 rounded-full">
                    <Sparkles size={16} className="text-white" />
                 </div>
                 <h1 className="text-base font-bold text-gray-900">AI 美食助手</h1>
            </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
             <RefreshCw size={18} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                 {/* Avatar */}
                 <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                     msg.role === "assistant" 
                        ? "bg-gradient-to-tr from-orange-400 to-rose-500 text-white" 
                        : "bg-gray-200 text-gray-500"
                 )}>
                    {msg.role === "assistant" ? <Sparkles size={14} /> : <User size={16} />}
                 </div>
                 
                 {/* Content Bubble */}
                 <div className={cn(
                     "max-w-[85%] space-y-3",
                     msg.role === "user" ? "items-end flex flex-col" : "items-start"
                 )}>
                     <div className={cn(
                         "px-4 py-3 text-sm shadow-sm",
                         msg.role === "user" 
                            ? "bg-orange-500 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                     )}>
                         {msg.content}
                     </div>
                     
                     {/* Recommendations */}
                     {msg.recommendations && (
                         <div className="space-y-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                             {msg.recommendations.map(rec => {
                                 const restaurant = restaurants.find(r => r.id === rec.restaurantId);
                                 if (!restaurant) return null;
                                 return (
                                     <div key={rec.restaurantId} className="w-full">
                                         <RestaurantCard 
                                            restaurant={restaurant} 
                                            universityId="pku" 
                                            className="border-gray-100 hover:border-orange-300 shadow-md"
                                         />
                                     </div>
                                 )
                             })}
                         </div>
                     )}
                 </div>
            </div>
        ))}
        
        {loading && (
            <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 flex items-center justify-center shrink-0 text-white shadow-sm">
                    <Loader2 size={14} className="animate-spin" />
                 </div>
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-gray-500 shadow-sm border border-gray-100 flex items-center gap-2">
                     <span className="animate-pulse">正在思考...</span>
                 </div>
            </div>
        )}
        
        <div className="h-4" /> {/* Spacer */}
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100 pb-8 safe-area-bottom w-full sticky bottom-0">
         {/* Quick Tags */}
         {messages.length < 3 && (
             <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
                {quickTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => handleQuickTag(tag)}
                        className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full transition-colors font-medium"
                    >
                        {tag}
                    </button>
                ))}
             </div>
         )}
         
         <div className="flex gap-2 items-center bg-gray-100 rounded-full px-4 py-2 ring-2 ring-transparent focus-within:ring-orange-100 focus-within:bg-white transition-all">
             <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="人均30以内，想吃辣..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-1" 
             />
             <button 
                disabled={!input.trim() || loading}
                onClick={handleSend}
                className={cn(
                    "p-2 rounded-full transition-all",
                    input.trim() && !loading
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md transform hover:scale-105" 
                        : "bg-gray-300 text-gray-50 cursor-not-allowed"
                )}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
             </button>
         </div>
      </div>
    </div>
  );
}
