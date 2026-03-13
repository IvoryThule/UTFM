import type { Restaurant } from "@/types";

interface MapViewProps {
  restaurants: Restaurant[];
  universityId: string;
  category?: string;
}

function getWalkMinutes(restaurant: Restaurant, universityId: string): number {
  return restaurant.distances.find((item) => item.universityId === universityId)?.walkMinutes ?? 20;
}

export default function MapView({ restaurants, universityId, category }: MapViewProps) {
  const filtered = restaurants
    .filter((item) => (category ? item.category === category : true))
    .sort((a, b) => getWalkMinutes(a, universityId) - getWalkMinutes(b, universityId));

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">地图模式（演示版）</h2>
        <span className="text-xs text-gray-500">共{filtered.length}家</span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-y-auto">
        {filtered.map((restaurant) => (
          <div key={restaurant.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900">{restaurant.name}</p>
            <p className="mt-1 text-xs text-gray-600">
              {restaurant.category} · ¥{restaurant.avgPrice} · 🚶 {getWalkMinutes(restaurant, universityId)}min
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
