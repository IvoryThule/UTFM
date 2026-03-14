"use client";

import { ArrowLeft, MapPin, Phone, Star, Clock, Utensils, Share2, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Restaurant } from "@/types";

interface RestaurantDetailPageProps {
	params: {
		id: string;
	};
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
	const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reviews, setReviews] = useState<any[]>([]);
	const [newReview, setNewReview] = useState("");
	const [submitting, setSubmitting] = useState(false);

	// Fetch Restaurant Data
	useEffect(() => {
		async function fetchRestaurant() {
			try {
				const res = await fetch(`/api/restaurants/${params.id}`);
				if (!res.ok) return;
				const data = await res.json();
				const parsedRestaurant = data?.data?.restaurant || data?.restaurant || null;
				if (parsedRestaurant) {
					setRestaurant(parsedRestaurant);
					setError(null);
				}
			} catch (err: any) {
				console.warn("fetch /api/restaurants failed, fallback to AMap detail", err?.message || err);
			} finally {
				// Keep loading state for AMap detail fallback.
			}
		}
		fetchRestaurant();
	}, [params.id]);

	// Load Reviews from LocalStorage or Mock
	useEffect(() => {
		if (restaurant) {
			const saved = localStorage.getItem(`reviews-${restaurant.id}`);
			if (saved) {
				setReviews(JSON.parse(saved));
			} else {
				// Initialize with some mock data if empty
				setReviews([
					{ id: 1, user: "匿名同学", avatar: "U", rating: 5, content: "味道很不错，特别是招牌菜，性价比也很高，推荐！", date: "2天前" },
					{ id: 2, user: "美食猎人", avatar: "M", rating: 4, content: "环境很好，但是排队有点久。", date: "1周前" }
				]);
			}
		}
	}, [restaurant]);

	const handleSubmitReview = () => {
		if (!newReview.trim()) return;
		setSubmitting(true);
		
		// Simulate API call
		setTimeout(() => {
			const review = {
				id: Date.now(),
				user: "我",
				avatar: "Me", 
				rating: 5, // Default 5 for demo
				content: newReview,
				date: "刚刚"
			};
			const updated = [review, ...reviews];
			setReviews(updated);
			localStorage.setItem(`reviews-${restaurant?.id}`, JSON.stringify(updated));
			setNewReview("");
			setSubmitting(false);
		}, 500);
	};

	useEffect(() => {
		const fetchDetails = () => {
			if (!window.AMap || !window.AMap.PlaceSearch) {
				// If not loaded, retry or load plugin
				window.AMap?.plugin(["AMap.PlaceSearch"], fetchDetails);
				return;
			}

			const placeSearch = new window.AMap.PlaceSearch({
				extensions: "all", // Rich data
			});

			placeSearch.getDetails(params.id, (status: string, result: any) => {
				if (status === "complete" && result.poiList && result.poiList.pois.length > 0) {
					const poi = result.poiList.pois[0];

					// Consistent Heuristic (same as useHomeData)
					const idSum = poi.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
					const mockPrice = 15 + (idSum % 85);
					const mockRating = (3.5 + (idSum % 15) / 10).toFixed(1);
					const rating = poi.biz_ext?.rating && parseFloat(poi.biz_ext.rating) > 0 ? poi.biz_ext.rating : mockRating;
					const cost = poi.biz_ext?.cost && parseInt(poi.biz_ext.cost) > 0 ? poi.biz_ext.cost : mockPrice;

					const data: Restaurant = {
						id: poi.id,
						name: poi.name,
						category: poi.type.split(";")[2] || "餐饮",
						subcategory: poi.type.split(";")[1],
						avgPrice: parseInt(cost),
						rating: parseFloat(rating),
						lat: poi.location?.lat,
						lng: poi.location?.lng,
						distances: [], // Calculated externally usually
						address: poi.address,
						tags: poi.tag ? poi.tag.split(",") : [poi.type.split(";").pop()],
						// Richer fields from deep info or mocks
						scenes: [],
						coverImage: poi.photos && poi.photos.length > 0 ? poi.photos[0].url : undefined,
						reviewCount: poi.biz_ext?.review_count ? parseInt(poi.biz_ext.review_count) : idSum % 999,
						studentCount: (idSum % 5000) + 100,
						mustOrderDishes: ["招牌菜", "热销榜 first"], // Mock
						openHours: poi.biz_ext?.open_time || "10:00-22:00",
						isOpenLateNight: false,
						phone: poi.tel,
					};
					setRestaurant(data);
					setError(null);
				} else {
					if (!restaurant) {
						setError("未找到该餐厅信息");
					}
				}
				setLoading(false);
			});
		};

		// Check AMap
		if (typeof window !== "undefined") {
			const checkMap = setInterval(() => {
				if (window.AMap) {
					clearInterval(checkMap);
					fetchDetails();
				}
			}, 500);
			setTimeout(() => {
				clearInterval(checkMap);
				if (loading) setLoading(false);
			}, 5000);
		}
	}, [params.id]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
				<p className="text-xs">正在获取餐厅详情...</p>
			</div>
		);
	}

	if (error || !restaurant) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
				<div className="text-4xl mb-4">😢</div>
				<p className="text-gray-500 font-medium">{error || "餐厅不存在"}</p>
				<Link href="/" className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm shadow-md hover:bg-orange-600 transition-colors">
					返回首页
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pb-20">
			{/* Hero Image */}
			<div className="relative h-48 w-full bg-gray-200">
				{restaurant.coverImage ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
				) : (
					<div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
						<Utensils size={48} />
					</div>
				)}
				<Link href="/" className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10">
					<ArrowLeft size={20} />
				</Link>
				<div className="absolute top-4 right-4 flex gap-2">
					<button title="分享餐厅" className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors">
						<Share2 size={18} />
					</button>
					<button 
						title="收藏餐厅"
                        onClick={() => alert("收藏功能已更新至个人中心！")}
                        className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors hover:text-red-500 hover:bg-white"
                    >
						<Heart size={18} />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="px-4 py-5 -mt-6 relative bg-white rounded-t-3xl shadow-sm z-0">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h1 className="text-xl font-bold text-gray-900 leading-tight">{restaurant.name}</h1>
						<div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
							<div className="flex text-orange-500">
								{[1, 2, 3, 4, 5].map((i) => (
									<Star key={i} size={12} fill={i <= Math.round(restaurant.rating) ? "currentColor" : "none"} />
								))}
							</div>
							<span className="font-bold text-gray-900">{restaurant.rating}分</span>
							<span>¥{restaurant.avgPrice}/人</span>
						</div>
					</div>
				</div>

				{/* Meta */}
				<div className="mt-4 flex flex-col gap-3 pb-4 border-b border-gray-100">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<Clock size={14} className="text-gray-400" />
						<span>营业时间: {restaurant.openHours}</span>
					</div>
					<div className="flex items-start gap-2 text-sm text-gray-600">
						<MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
						<span className="line-clamp-2">{restaurant.address}</span>
						<a
							href={`https://uri.amap.com/marker?position=${restaurant.lng},${restaurant.lat}&name=${restaurant.name}`}
							target="_blank"
							className="ml-auto text-orange-500 text-xs font-bold border border-orange-200 px-2 py-0.5 rounded-full"
						>
							导航
						</a>
					</div>
					{restaurant.phone && (
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Phone size={14} className="text-gray-400" />
							<span>{restaurant.phone.split(";")[0]}</span>
						</div>
					)}
				</div>

				{/* Dishes */}
				<div className="py-4 border-b border-gray-100">
					<h3 className="font-bold text-gray-900 mb-3 text-sm">本店招牌</h3>
					<div className="flex flex-wrap gap-2">
						{restaurant.tags.slice(0, 5).map((tag) => (
							<span key={tag} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-lg">
								{tag}
							</span>
						))}
					</div>
				</div>

				{/* Reviews */}
				<div className="py-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-bold text-gray-900 text-sm">
							评价 <span className="text-gray-400 font-normal">({restaurant.reviewCount})</span>
						</h3>
						<span className="text-xs text-gray-400 flex items-center gap-1">
							查看全部 <ArrowLeft size={12} className="rotate-180" />
						</span>
					</div>


					{/* Review Input */}
					<div className="mb-6 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
						<h4 className="font-bold text-gray-900 text-sm mb-2">写评价</h4>
						<textarea
							value={newReview}
							onChange={(e) => setNewReview(e.target.value)}
							placeholder="分享你的用餐体验..."
							className="w-full text-xs p-3 rounded-lg border border-gray-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all resize-none h-20 bg-white"
						/>
						<div className="flex justify-end mt-2">
							<button 
								onClick={handleSubmitReview}
								disabled={!newReview.trim() || submitting}
								className="bg-orange-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{submitting ? "提交中..." : "发布评价"}
							</button>
						</div>
					</div>

					{/* Reviews List */}
					<div className="space-y-3 pb-20">
						{reviews.map((review) => (
							<div key={review.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
								<div className="flex items-center gap-2 mb-1.5">
									<div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-200">
										{review.avatar || "U"}
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-800 font-bold leading-none">{review.user}</span>
										<span className="text-[10px] text-gray-400 scale-90 origin-left">{review.date}</span>
									</div>
									<div className="ml-auto flex text-orange-400 text-[10px]">
										{[1,2,3,4,5].map(s => (
											<span key={s}>{s <= review.rating ? "★" : "☆"}</span>
										))}
									</div>
								</div>
								<p className="text-xs text-gray-600 leading-relaxed pl-8">
									{review.content}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Bottom Bar - Padded for iPhone Home Indicator */}
			<div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-3 px-4 flex items-center gap-3 pb-8 md:pb-4 safe-area-bottom z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
				<button className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-900 transition-colors">
					<MessageSquare size={20} />
					<span className="text-[10px] font-medium">点评</span>
				</button>
				<button className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-black hover:shadow-xl flex items-center justify-center gap-2">
					<Utensils size={18} />
					<span>去点餐</span>
				</button>
			</div>
		</div>
	);
}
