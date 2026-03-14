"use client";

import { AlertCircle, ChevronRight, Coffee, Heart, LogOut, Map, Settings, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
    const { user, userId, username, level, avatar, resetUser } = useUser();
    const [stats, setStats] = useState({ visited: 0, favorited: 0 });

    // Simulate loading user stats
    useEffect(() => {
        if (userId) {
            // In real app, fetch from API using userId
            setStats({
                visited: Math.floor(Math.random() * 20) + 5,
                favorited: Math.floor(Math.random() * 10) + 1
            });
        } else {
            setStats({ visited: 0, favorited: 0 });
        }
    }, [userId]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / User Card */}
            <header className="relative bg-white pt-12 pb-6 px-4 mb-4">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-400 to-amber-500 z-0"></div>
                
                <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 -mt-8 mx-2 border border-orange-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0 overflow-hidden">
                            {avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-orange-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
                                {username || "未登录用户"}
                                {userId && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full font-normal border border-yellow-200">
                                        Lv.{level} 吃货
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-gray-400 font-mono mt-1 truncate max-w-[200px]">
                                ID: {userId ? userId.slice(0, 8) + "..." : "Guest"}
                            </p>
                        </div>
                        <Settings className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-6">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{stats.visited}</div>
                            <div className="text-xs text-gray-500">探店足迹</div>
                        </div>
                        <div className="text-center border-l border-r border-gray-100">
                            <div className="text-lg font-bold text-gray-900">{stats.favorited}</div>
                            <div className="text-xs text-gray-500">收藏店铺</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">4</div>
                            <div className="text-xs text-gray-500">我的评价</div>
                        </div>
                    </div>
                </div>
			</header>

            {/* Menu Sections */}
			<div className="px-4 space-y-4">
                
                {/* Main Actions */}
				<section className="bg-white rounded-xl shadow-sm overflow-hidden">
					<Link href="/map" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Map size={18} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">美食足迹地图</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                    <Link href="/profile/favorites" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <Heart size={18} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">我的特别关注</span>
                        <span className="text-xs text-gray-400">{stats.favorited} 家</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
				</section>

                {/* Secondary Actions */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
					<Link href="/profile/preferences" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Coffee size={18} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">口味偏好设置</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                    <Link href="/profile/about" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <AlertCircle size={18} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">关于 / 反馈</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                     <Link href="/profile/reviews" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                         <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <User size={18} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700">我的评价</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
				</section>
                
                {/* Logout */}
                <button 
                    onClick={() => {
                        if(confirm("确定要重置当前用户身份吗？数据将丢失。")) {
                            resetUser();
                            alert("身份已重置");
                        }
                    }}
                    className="w-full bg-white rounded-xl shadow-sm p-3 flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                    <LogOut size={16} />
                    重置访客身份
                </button>
			</div>
		</div>
	);
}
