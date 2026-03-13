import Link from "next/link";

import { restaurants } from "@/data/restaurants";
import { reviews } from "@/data/reviews";

interface RestaurantDetailPageProps {
	params: {
		id: string;
	};
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
	const restaurant = restaurants.find((item) => item.id === params.id);

	if (!restaurant) {
		return (
			<div className="rounded-xl bg-white p-6 text-center shadow-sm">
				<p className="text-sm text-gray-500">餐厅不存在</p>
				<Link href="/" className="mt-3 inline-block text-sm text-brand-orange">
					返回首页
				</Link>
			</div>
		);
	}

	const reviewList = reviews.filter((item) => item.restaurantId === restaurant.id).slice(0, 6);

	return (
		<div className="space-y-4">
			<header className="rounded-xl bg-white p-4 shadow-sm">
				<div className="flex items-center justify-between">
					<h1 className="text-base font-semibold text-gray-900">{restaurant.name}</h1>
					<Link href="/" className="text-xs text-gray-500">
						返回
					</Link>
				</div>
				<p className="mt-2 text-sm text-gray-600">
					{restaurant.category} · ⭐ {restaurant.rating.toFixed(1)} · ¥{restaurant.avgPrice}/人
				</p>
				<p className="mt-1 text-xs text-gray-500">营业时间：{restaurant.openHours}</p>
			</header>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<p className="text-sm font-semibold text-gray-900">学生标签</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{restaurant.tags.map((tag) => (
						<span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{tag}
						</span>
					))}
				</div>
				{restaurant.studentDiscount && <p className="mt-3 text-xs text-brand-orange">优惠：{restaurant.studentDiscount}</p>}
			</section>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<p className="text-sm font-semibold text-gray-900">必点菜</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{restaurant.mustOrderDishes.map((dish) => (
						<span key={dish} className="rounded-lg bg-brand-warm px-2 py-1 text-xs text-gray-700">
							{dish}
						</span>
					))}
				</div>
			</section>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<p className="text-sm font-semibold text-gray-900">学生评价</p>
				<div className="mt-3 space-y-3">
					{reviewList.map((review) => (
						<article key={review.id} className="rounded-lg border border-gray-100 p-3">
							<p className="text-xs text-gray-500">
								{review.authorName} · {review.authorDepartment} · ⭐ {review.rating.toFixed(1)}
							</p>
							<p className="mt-1 text-sm text-gray-700">{review.content}</p>
						</article>
					))}
				</div>
			</section>

			<button type="button" className="h-11 w-full rounded-xl bg-brand-orange text-sm font-semibold text-white">
				📍 导航过去
			</button>
		</div>
	);
}
