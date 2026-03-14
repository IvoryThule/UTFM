// src/hooks/useHomeData.ts
"use client";

import { useEffect, useState } from "react";

import type { Restaurant } from "@/types";
import type { GeoLocation } from "./useLocation";

export function useHomeData(location: GeoLocation | null) {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location || !window.AMap) {
        return;
    }

    setLoading(true);

    const fetchData = () => {
        // 1. Search Universities (Higher Education)
        const placeSearchUni = new window.AMap.PlaceSearch({
            pageSize: 10,
            pageIndex: 1,
            type: '高等院校',
            extensions: 'base'
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        placeSearchUni.searchNearBy('', [location.lng, location.lat], 5000, (status: string, result: any) => {
            if (status === 'complete' && result.poiList) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const schools = result.poiList.pois.map((poi: any) => ({
                    id: poi.id,
                    name: poi.name,
                    location: {
                        lat: poi.location.lat,
                        lng: poi.location.lng,
                    },
                    distance: poi.distance
                }));
                 // Add "Current Location" as an option too
                 schools.unshift({
                    id: "current",
                    name: "当前位置",
                    location: location,
                    distance: 0
                });
                setUniversities(schools);
            } else {
                 setUniversities([{
                    id: "current",
                    name: "当前位置",
                    location: location,
                    distance: 0
                }]);
            }
        });

        // 2. Search Restaurants (General Food)
        const placeSearchRest = new window.AMap.PlaceSearch({
             pageSize: 20, 
             pageIndex: 1,
             type: '餐饮服务', 
             extensions: 'all' 
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        placeSearchRest.searchNearBy('', [location.lng, location.lat], 2000, (status: string, result: any) => {
             if (status === 'complete' && result.poiList) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const mapped: Restaurant[] = result.poiList.pois.map((poi: any) => {
                       // Heuristic Fallbacks for missing real data
                       const idSum = poi.id.split('').reduce((acc:number, char:string) => acc + char.charCodeAt(0), 0);
                       const mockPrice = 15 + (idSum % 85); // 15-100
                       const mockRating = 3.5 + (idSum % 15) / 10; // 3.5-5.0

                       return {
                            id: poi.id,
                            name: poi.name,
                            category: poi.type.split(';')[2] || poi.type.split(';')[1] || '餐饮',
                            subcategory: poi.type.split(';')[1] || '',
                            // Use Real data if available, else heuristic
                            avgPrice: poi.biz_ext?.cost && parseInt(poi.biz_ext.cost) > 0 
                                ? parseInt(poi.biz_ext.cost) 
                                : mockPrice, 
                            rating: poi.biz_ext?.rating && parseFloat(poi.biz_ext.rating) > 0 
                                ? parseFloat(poi.biz_ext.rating) 
                                : mockRating, 
                            lat: poi.location?.lat || 0,
                            lng: poi.location?.lng || 0,
                            distances: [{
                                universityId: 'current',
                                walkMinutes: Math.round(poi.distance / 70), 
                                distanceMeters: poi.distance
                            }],
                            address: poi.address || '',
                            tags: poi.tag ? poi.tag.split(',') : [poi.type.split(';').pop()],
                            std_tag: poi.type || '',
                            scenes: [],
                            coverImage: poi.photos && poi.photos.length > 0 ? poi.photos[0].url : undefined,
                            reviews: [],
                            reviewCount: typeof poi.biz_ext?.review_count !== 'undefined' ? parseInt(poi.biz_ext.review_count) : (idSum % 500),
                            studentCount: (idSum % 2000) + 100,
                            mustOrderDishes: [],
                            openHours: '10:00-22:00',
                            isOpenLateNight: false,
                       };
                   });
                   setNearbyRestaurants(mapped);
             }
             setLoading(false);
        });
    };
    
    // Check if placeSearch plugin is loaded
    if (!window.AMap.PlaceSearch) {
        window.AMap.plugin(["AMap.PlaceSearch"], fetchData);
    } else {
        fetchData();
    }

  }, [location]);

  return { nearbyRestaurants, universities, loading };
}