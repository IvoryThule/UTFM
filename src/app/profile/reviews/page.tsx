"use client";

import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function MyReviewsPage() {
	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center gap-3">
				<Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
					<ArrowLeft size={20} className="text-gray-600" />
				</Link>
				<h1 className="text-base font-bold text-gray-900">我的评价</h1>
			</header>

            <div className="pt-20 px-4 space-y-3">
                 {[1, 2].map(i => (
                     <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-gray-900 text-sm">黄焖鸡米饭</h3>
                             <span className="text-[10px] text-gray-400">2023-11-12</span>
                         </div>
                         <div className="text-orange-500 text-xs mb-2">★★★★★</div>
                         <p className="text-xs text-gray-600 leading-relaxed">
                             分量很足，但是有点咸了。建议老板少放点盐。米饭可以免费续这点很棒！
                         </p>
                     </div>
                 ))}
                 
                 <div className="text-center py-8 text-gray-300 text-xs">
                     - 没有更多了 -
                 </div>
            </div>
        </div>
    );
}