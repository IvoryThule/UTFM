"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function MyFootprintsPage() {
	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center gap-3">
				<Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
					<ArrowLeft size={20} className="text-gray-600" />
				</Link>
				<h1 className="text-base font-bold text-gray-900">美食地图足迹</h1>
			</header>

            <div className="pt-20 px-8 relative">
                 <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gray-200"></div>
                 
                 <div className="space-y-8 relative">
                     {[1,2,3].map(i => (
                         <div key={i} className="relative pl-6">
                             <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white ring-2 ring-orange-100"></div>
                             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                 <span className="text-[10px] text-gray-400 mb-1 block">2023-10-0{i} 12:30</span>
                                 <h3 className="text-sm font-bold text-gray-900">必胜客 (光谷店)</h3>
                                 <p className="text-xs text-gray-500 mt-1">打卡成功！获得 "披萨达人" 徽章</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
}