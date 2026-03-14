import { useEffect, useState } from "react";

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
  address?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try browser geolocation first
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      setLoading(false);
      return;
    }

    // Try AMap Geolocation plugin if available (more accurate in China)
    const getAmapLocation = () => {
      if (window.AMap && window.AMap.Geolocation) {
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === "complete") {
            setLocation({
              lat: result.position.lat,
              lng: result.position.lng,
              city: result.addressComponent?.city,
              address: result.formattedAddress
            });
            setLoading(false);
          } else {
            console.warn("AMap location failed, falling back to browser API");
            getBrowserLocation();
          }
        });
      } else {
        // AMap not loaded yet or plugin missing, wait or use browser
        if (window.AMap) {
             window.AMap.plugin('AMap.Geolocation', getAmapLocation);
        } else {
             getBrowserLocation();
        }
      }
    };

    const getBrowserLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          // Default to Peking University coords as fallback dev location
          setLocation({
             lat: 39.9930,
             lng: 116.3109,
             city: "北京市",
             address: "北京大学(默认)"
          });
        }
      );
    };

    getAmapLocation();
  }, []);

  return { location, error, loading };
}