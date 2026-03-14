"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center gap-3">
				<Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
					<ArrowLeft size={20} className="text-gray-600" />
				</Link>
				<h1 className="text-base font-bold text-gray-900">关于 / 反馈</h1>
			</header>

            <div className="pt-20 px-6 text-center">
                 <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl rotate-3">
                     <span className="text-white font-black text-2xl">Eat</span>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">吃什么 - 大学城版</h2>
                 <p className="text-xs text-gray-400 mt-1">Version 1.0.2 (Beta)</p>

                 <div className="mt-12 text-left space-y-4">
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                             <AlertCircle size={16} className="text-orange-500" />
                             问题反馈
                         </h3>
                         <textarea 
                            placeholder="遇到什么问题了吗？告诉我们..."
                            className="w-full h-24 text-xs p-2 bg-gray-50 rounded-lg outline-none resize-none"
                         />
                         <button className="mt-2 text-xs bg-gray-900 text-white px-4 py-1.5 rounded-full float-right">提交</button>
                         <div className="clear-both"></div>
                     </div>
                 </div>

                 <div className="fixed bottom-8 left-0 w-full text-center text-[10px] text-gray-300">
                     &copy; 2026 University Food Map Team
                 </div>
            </div>
        </div>
    );
}