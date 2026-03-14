"use client";

import { useUser } from "@/hooks/useUser";
import { ArrowLeft, Clock, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Restaurant } from "@/types";

export default function MyFavoritesPage() {
    const [favorites, setFavorites] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
        // Mock loading
        setTimeout(() => {
            setFavorites([]); // TODO: Fetch from /api/user/favorites
            setLoading(false);
        }, 500);
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center gap-3">
				<Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
					<ArrowLeft size={20} className="text-gray-600" />
				</Link>
				<h1 className="text-base font-bold text-gray-900">我的特别关注</h1>
			</header>

            <div className="pt-16 px-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400 text-xs">Loading...</div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                        <Heart size={40} className="mb-2 text-gray-200" />
                        <p className="text-sm">暂无收藏店铺</p>
                        <Link href="/map" className="mt-4 px-6 py-2 bg-orange-500 text-white text-xs font-bold rounded-full">
                            去发现美食
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* List items */}
                    </div>
                )}
            </div>
        </div>
    );
}