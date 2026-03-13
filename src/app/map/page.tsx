"use client";

import { useState } from "react";

import MapView from "@/components/business/mapView";
import { categoryOptions } from "@/data/categories";
import { restaurants } from "@/data/restaurants";

export default function MapPage() {
	const [category, setCategory] = useState<string>("");

	return (
		<div className="space-y-4">
			<header className="rounded-xl bg-white p-4 shadow-sm">
				<h1 className="text-base font-semibold text-gray-900">地图模式</h1>
				<p className="mt-1 text-xs text-gray-500">当前展示：北京大学周边</p>
			</header>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<p className="mb-2 text-sm font-medium text-gray-800">筛选品类</p>
				<div className="flex gap-2 overflow-x-auto">
					<button
						type="button"
						onClick={() => setCategory("")}
						className={`shrink-0 rounded-full px-3 py-1 text-xs ${!category ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
					>
						全部
					</button>
					{categoryOptions.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setCategory(item.id)}
							className={`shrink-0 rounded-full px-3 py-1 text-xs ${category === item.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
						>
							{item.label}
						</button>
					))}
				</div>
			</section>

			<MapView restaurants={restaurants} universityId="pku" category={category || undefined} />
		</div>
	);
}
