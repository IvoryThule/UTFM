"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PreferencesPage() {
    const preferences = ["不吃辣", "微辣", "爱吃面", "咖啡控", "肉食主义", "素食者", "海鲜过敏"];
    const [selected, setSelected] = useState<string[]>(["微辣", "爱吃面"]);

    const toggle = (tag: string) => {
        if (selected.includes(tag)) setSelected(selected.filter(t => t !== tag));
        else setSelected([...selected, tag]);
    };

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center gap-3">
				<Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
					<ArrowLeft size={20} className="text-gray-600" />
				</Link>
				<h1 className="text-base font-bold text-gray-900">口味偏好设置</h1>
			</header>

            <div className="pt-20 px-4">
                 <h2 className="text-sm font-bold text-gray-900 mb-4">选择你的饮食偏好</h2>
                 <div className="flex flex-wrap gap-3">
                     {preferences.map(tag => (
                         <button
                            key={tag}
                            onClick={() => toggle(tag)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
                                selected.includes(tag) 
                                    ? "bg-orange-500 text-white shadow-orange-200" 
                                    : "bg-white text-gray-600 border border-gray-100"
                            }`}
                         >
                             {tag}
                             {selected.includes(tag) && <Check size={14} />}
                         </button>
                     ))}
                 </div>

                 <div className="mt-8 text-xs text-gray-400 leading-relaxed">
                     * 这里的设置将影响 AI 推荐和首页排序权重。
                 </div>

                 <button className="mt-8 w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform text-sm">
                     保存设置
                 </button>
            </div>
        </div>
    );
}