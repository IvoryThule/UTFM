"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Restaurant } from "@/types";

declare global {
  interface Window {
    AMap: any;
  }
}

interface MapViewProps {
  restaurants: Restaurant[];
  universityId: string;
  category?: string;
}

export default function MapView({ restaurants, universityId, category }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter restaurants based on category if provided
  const filtered = restaurants.filter((item) => (category ? item.category === category : true));

  useEffect(() => {
    // Check if Amap is loaded, retry if not
    let retryCount = 0;
    const maxRetries = 20;

    const initMap = () => {
      if (!window.AMap) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initMap, 500); 
        } else {
          setLoading(false); // Timeout
          console.error("AMap script failed to load or key invalid.");
        }
        return;
      }

      if (!mapContainer.current) return;
      
      // Default center: Peking University
      const defaultCenter = [116.31088, 39.993005];
      const initialCenter = filtered.length > 0 ? [filtered[0].lng, filtered[0].lat] : defaultCenter;

      const map = new window.AMap.Map(mapContainer.current, {
        zoom: 15,
        center: initialCenter,
        viewMode: "2D",
      });

      setMapInstance(map);
      setLoading(false);
    };

    initMap();

    return () => {
      if (mapInstance && typeof mapInstance.destroy === 'function') {
        mapInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Update markers when filtered data changes or map is ready
  useEffect(() => {
    if (!mapInstance || !window.AMap) return;

    mapInstance.clearMap(); // Clear existing markers

    const markers: any[] = [];

    filtered.forEach((r) => {
      // Create custom marker content
      const contentDiv = document.createElement("div");
      contentDiv.className = "amap-custom-marker";
      contentDiv.style.padding = "4px 8px";
      contentDiv.style.backgroundColor = "white";
      contentDiv.style.borderRadius = "8px";
      contentDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
      contentDiv.style.fontSize = "12px";
      contentDiv.style.fontWeight = "600";
      contentDiv.style.color = "#374151";
      contentDiv.style.border = "1px solid #f3f4f6";
      contentDiv.style.display = "flex";
      contentDiv.style.alignItems = "center";
      contentDiv.style.gap = "4px";
      contentDiv.style.whiteSpace = "nowrap";
      contentDiv.style.transform = "translate(-50%, -100%)";
      contentDiv.style.cursor = "pointer";
      
      contentDiv.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #f97316;"></span>
          ${r.name}
      `;

      // Handle marker click
      contentDiv.onclick = () => {
          mapInstance.setCenter([r.lng, r.lat]);
          mapInstance.setZoom(17);
      };

      const marker = new window.AMap.Marker({
        position: [r.lng, r.lat],
        content: contentDiv,
        offset: new window.AMap.Pixel(0, -10),
        title: r.name,
        extData: { id: r.id }
      });
      
      markers.push(marker);
    });

    if (markers.length > 0) {
       mapInstance.add(markers);
       mapInstance.setFitView(); // Adjust view to fit all markers
    } else {
        // Do not violently center to a hardcoded location if there are no results.
        // Let it stay where the user was looking.
    }
    
  }, [mapInstance, filtered]);

  return (
    <div className="relative w-full h-[calc(100vh-220px)] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
           <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-xs">地图资源加载中...</p>
           </div>
        </div>
      )}
      <div ref={mapContainer} className="flex-1 w-full h-full" />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-500 shadow-sm border border-gray-100">
          高德地图 API
      </div>
    </div>
  );
}
