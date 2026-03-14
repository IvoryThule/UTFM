"use client";

import { Home, Map, Sparkles, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "发现", Icon: Home },
  { href: "/map", label: "地图", Icon: Map },
  { href: "/ai-pick", label: "AI推荐", Icon: Sparkles },
  { href: "/rankings", label: "榜单", Icon: Trophy },
  { href: "/profile", label: "我的", Icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on Detail Pages and AI Chat Page (which has its own input bar)
  if (pathname.includes("/restaurant/") || pathname === "/ai-pick") {
      return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 border-t border-gray-100 bg-white/95 backdrop-blur-lg pb-safe-bottom shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.05)]">
      <ul className="flex justify-around items-center h-14 max-w-md mx-auto relative px-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1 flex justify-center">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full relative group transition-all duration-300",
                  isActive ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn(
                    "p-1.5 rounded-xl transition-all duration-300 relative",
                    isActive ? "-translate-y-1 bg-gradient-to-tr from-orange-50 to-amber-50 shadow-sm" : ""
                )}>
                    <Icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={cn("transition-transform duration-300", isActive && "scale-110")} 
                    />
                </div>
                <span className={cn(
                    "text-[10px] font-medium transition-all duration-300",
                    isActive ? "font-bold translate-y-[-2px]" : ""
                )}>
                    {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}