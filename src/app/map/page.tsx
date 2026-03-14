"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

import MapView from "@/components/business/mapView";
import { categoryOptions } from "@/data/categories";
import { useLocation } from "@/hooks/useLocation";
import { useHomeData } from "@/hooks/useHomeData";

export default function MapPage() {
	const [category, setCategory] = useState<string>("");
	const { location, loading: locLoading } = useLocation();
	const { nearbyRestaurants, universities, loading: dataLoading } = useHomeData(location);

	// Get current university name
	const currentUniversityName = universities.length > 0 
		? universities[0].name 
		: locLoading ? "定位中..." : "我的位置";

	return (
		<div className="flex flex-col h-[calc(100vh-theme(spacing.16))] relative bg-gray-50">
			{/* Top Bar with ShadCN-like styling */}
			<header className="flex-none bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 px-4 py-3 shadow-none">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2 group cursor-pointer">
					    <div className="bg-orange-100 p-1.5 rounded-full group-hover:bg-orange-200 transition-colors">
                            <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
					    <div>
                            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[150px] leading-tight">
                                {currentUniversityName}
                            </h1>
                            <p className="text-[10px] text-gray-500">发现身边好店</p>
                        </div>
                    </div>
					<div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {nearbyRestaurants.length} results
                        </span>
                    </div>
				</div>
				
                {/* Horizontal Category Scroll */}
				<div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar scroll-smooth">
					<button
						type="button"
						onClick={() => setCategory("")}
						className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border ${
							!category 
								? "bg-gray-900 text-white border-transparent shadow-md scale-105" 
								: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
						}`}
					>
						全部
					</button>
					{categoryOptions.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setCategory(item.id)}
							className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border ${
								category === item.id 
									? "bg-gray-900 text-white border-transparent shadow-md scale-105" 
									: "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
							}`}
						>
                            {/* Simple inline icon logic */}
							{item.label}
						</button>
					))}
				</div>
			</header>

			<div className="flex-1 w-full relative z-0 overflow-hidden rounded-t-2xl shadow-inner -mt-2 bg-white">
				{/* Pass real data to MapView */}
				<MapView 
					restaurants={nearbyRestaurants} 
					universityId={universities[0]?.id || "current"} 
					category={category || undefined} 
				/>
			</div>
		</div>
	);
}
